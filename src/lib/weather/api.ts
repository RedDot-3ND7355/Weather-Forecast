import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { detectWindShift, dewpointFromRh, estimateRain, nextRainWindow } from "./rain";
import { mapMetNoForecast } from "./metno";
import type {
  CurrentWeather,
  DayPoint,
  Forecast,
  HourPoint,
  Place,
} from "./types";

const UA = "Vane/1.0 (wind-aware weather forecast)";

const placeSchema = z.object({
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  admin: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
});

type GeoHit = {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  timezone?: string;
};

type GeoResponse = { results?: GeoHit[] };

type MeteoCurrent = {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
};

type MeteoHourly = {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  dew_point_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  cloud_cover: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  wind_gusts_10m: number[];
  cape: number[];
  is_day: number[];
};

type MeteoDaily = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  wind_direction_10m_dominant: number[];
};

type MeteoResponse = {
  timezone: string;
  current: MeteoCurrent;
  hourly: MeteoHourly;
  daily: MeteoDaily;
};

const forecastCache = new Map<string, { at: number; value: Forecast }>();
const CACHE_MS = 90 * 1000;

function cacheKey(place: Place): string {
  return `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
}

function num(v: number | null | undefined, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": UA,
    },
  });
  if (!res.ok) {
    const err = new Error(`Weather service returned ${res.status}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

function hourIndexAt(times: string[], iso: string): number {
  const now = new Date(iso).getTime();
  let best = 0;
  for (let i = 0; i < times.length; i += 1) {
    if (new Date(times[i]).getTime() <= now) best = i;
    else break;
  }
  return best;
}

function mapHour(
  hourly: MeteoHourly,
  i: number,
  latitude: number,
): HourPoint {
  const tempC = num(hourly.temperature_2m[i]);
  const humidity = num(hourly.relative_humidity_2m[i]);
  const dewpointC = num(hourly.dew_point_2m[i], dewpointFromRh(tempC, humidity));
  const modelChance = num(hourly.precipitation_probability[i]);
  const windDir = num(hourly.wind_direction_10m[i]);
  const windSpeedKmh = num(hourly.wind_speed_10m[i]);
  const cloudCover = num(hourly.cloud_cover[i]);
  const cape = num(hourly.cape[i]);
  return {
    time: hourly.time[i],
    temperatureC: tempC,
    humidity,
    dewpointC,
    precipMm: num(hourly.precipitation[i]),
    modelChance,
    weatherCode: num(hourly.weather_code[i]),
    cloudCover,
    windSpeedKmh,
    windGustKmh: num(hourly.wind_gusts_10m[i]),
    windDir,
    isDay: num(hourly.is_day[i]) === 1,
    cape,
    rain: estimateRain({
      modelProb: modelChance,
      rh: humidity,
      tempC,
      dewpointC,
      windDir,
      windSpeedKmh,
      cloudCover,
      cape,
      latitude,
      weatherCode: num(hourly.weather_code[i]),
    }),
  };
}

function mapDay(
  daily: MeteoDaily,
  i: number,
  hours: HourPoint[],
  latitude: number,
): DayPoint {
  const date = daily.time[i];
  const dayHours = hours.filter((h) => h.time.startsWith(date));
  const peak = dayHours.reduce(
    (m, h) => Math.max(m, h.rain.chance),
    num(daily.precipitation_probability_max[i]),
  );
  const windDir = num(daily.wind_direction_10m_dominant[i]);
  const windSpeedKmh = num(daily.wind_speed_10m_max[i]);
  const sample =
    dayHours.find((h) => h.time.includes("T15:")) ??
    dayHours[Math.floor(dayHours.length / 2)] ??
    hours[0];
  const rain = estimateRain({
    modelProb: peak,
    rh: sample?.humidity ?? 60,
    tempC: num(daily.temperature_2m_max[i]),
    dewpointC: sample?.dewpointC ?? dewpointFromRh(num(daily.temperature_2m_max[i]), 60),
    windDir,
    windSpeedKmh,
    cloudCover: sample?.cloudCover ?? 50,
    cape: sample?.cape ?? 0,
    latitude,
    weatherCode: num(daily.weather_code[i]),
  });
  rain.chance = Math.round(0.7 * peak + 0.3 * rain.chance);
  return {
    date,
    weatherCode: num(daily.weather_code[i]),
    tempMaxC: num(daily.temperature_2m_max[i]),
    tempMinC: num(daily.temperature_2m_min[i]),
    precipMm: num(daily.precipitation_sum[i]),
    modelChance: num(daily.precipitation_probability_max[i]),
    windSpeedKmh,
    windGustKmh: num(daily.wind_gusts_10m_max[i]),
    windDir,
    sunrise: daily.sunrise[i],
    sunset: daily.sunset[i],
    uvMax: num(daily.uv_index_max[i]),
    rain,
  };
}

function mapOpenMeteo(json: MeteoResponse, data: Place): Forecast {
  const allHours = json.hourly.time.map((_, i) =>
    mapHour(json.hourly, i, data.latitude),
  );
  const idx = hourIndexAt(json.hourly.time, json.current.time);
  const hourly = allHours.slice(idx, idx + 24);
  const daily = json.daily.time.map((_, i) =>
    mapDay(json.daily, i, allHours, data.latitude),
  );

  const currentHour = allHours[idx];
  const tempC = num(json.current.temperature_2m);
  const humidity = num(json.current.relative_humidity_2m);
  const dewpointC = currentHour?.dewpointC ?? dewpointFromRh(tempC, humidity);
  const windDir = num(json.current.wind_direction_10m);
  const windSpeedKmh = num(json.current.wind_speed_10m);
  const cloudCover = num(json.current.cloud_cover);
  const modelChance = currentHour?.modelChance ?? daily[0]?.modelChance ?? 0;

  const current: CurrentWeather = {
    time: json.current.time,
    timezone: json.timezone,
    temperatureC: tempC,
    apparentC: num(json.current.apparent_temperature),
    humidity,
    dewpointC,
    pressureHpa: num(json.current.pressure_msl),
    cloudCover,
    precipitationMm: num(json.current.precipitation),
    weatherCode: num(json.current.weather_code),
    isDay: json.current.is_day === 1,
    windSpeedKmh,
    windGustKmh: num(json.current.wind_gusts_10m),
    windDir,
    rain: estimateRain({
      modelProb: modelChance,
      rh: humidity,
      tempC,
      dewpointC,
      windDir,
      windSpeedKmh,
      cloudCover,
      cape: currentHour?.cape ?? 0,
      latitude: data.latitude,
      weatherCode: num(json.current.weather_code),
    }),
  };

  return {
    place: data,
    current,
    hourly,
    daily,
    nextRain: nextRainWindow(hourly),
    windShift: detectWindShift(hourly),
    fetchedAt: Date.now(),
  };
}

async function fetchOpenMeteo(data: Place): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(data.latitude),
    longitude: String(data.longitude),
    timezone: "auto",
    forecast_days: "7",
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
    ].join(","),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "dew_point_2m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "cape",
      "is_day",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
      "wind_direction_10m_dominant",
    ].join(","),
  });
  const json = await getJson<MeteoResponse>(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );
  return mapOpenMeteo(json, data);
}

async function fetchMetNo(data: Place): Promise<Forecast> {
  const url =
    `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${data.latitude}` +
    `&lon=${data.longitude}`;
  const json = await getJson<Parameters<typeof mapMetNoForecast>[0]>(url);
  return mapMetNoForecast(json, data);
}

export const searchPlaces = createServerFn({ method: "GET" })
  .validator(
    z.object({
      q: z.string().trim().min(1).max(80),
      language: z.enum(["en", "fr"]).optional(),
    }),
  )
  .handler(async ({ data }): Promise<Place[]> => {
    const lang = data.language === "fr" ? "fr" : "en";
    const url =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(data.q)}` +
      `&count=7&language=${lang}&format=json`;
    const json = await getJson<GeoResponse>(url);
    return (json.results ?? []).map((r) => ({
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      admin: r.admin1 ?? null,
      country: r.country ?? null,
      timezone: r.timezone ?? null,
    }));
  });

type NominatimReverse = {
  name?: string;
  addresstype?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    suburb?: string;
    city_district?: string;
    hamlet?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

function placeFromNominatim(json: NominatimReverse, lat: number, lon: number): Place | null {
  const a = json.address;
  if (!a && !json.name) return null;
  const name =
    a?.city ||
    a?.town ||
    a?.village ||
    a?.municipality ||
    a?.city_district ||
    a?.suburb ||
    a?.hamlet ||
    json.name;
  if (!name) return null;
  return {
    name,
    latitude: lat,
    longitude: lon,
    admin: a?.state ?? a?.county ?? null,
    country: a?.country ?? null,
  };
}

export const reversePlace = createServerFn({ method: "GET" })
  .validator(
    z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      language: z.enum(["en", "fr"]).optional(),
    }),
  )
  .handler(async ({ data }): Promise<Place> => {
    const lang = data.language === "fr" ? "fr" : "en";
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${data.latitude}&lon=${data.longitude}` +
      `&zoom=14&addressdetails=1&accept-language=${lang}`;
    try {
      const res = await fetch(url, {
        headers: {
          accept: "application/json",
          "user-agent": UA,
        },
      });
      if (res.ok) {
        const json = (await res.json()) as NominatimReverse;
        const place = placeFromNominatim(json, data.latitude, data.longitude);
        if (place) return place;
      }
    } catch {
      /* fall through */
    }
    return {
      name: lang === "fr" ? "Votre position" : "Your location",
      latitude: data.latitude,
      longitude: data.longitude,
      admin: null,
      country: null,
    };
  });

export const fetchForecast = createServerFn({ method: "GET" })
  .validator(placeSchema)
  .handler(async ({ data }): Promise<Forecast> => {
    const key = cacheKey(data);
    const hit = forecastCache.get(key);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;

    let forecast: Forecast;
    try {
      forecast = await fetchOpenMeteo(data);
    } catch {
      forecast = await fetchMetNo(data);
    }
    forecastCache.set(key, { at: Date.now(), value: forecast });
    return forecast;
  });
