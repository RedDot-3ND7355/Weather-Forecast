import { dewpointFromRh, estimateRain, detectWindShift, nextRainWindow } from "./rain";
import type {
  CurrentWeather,
  DayPoint,
  Forecast,
  HourPoint,
  Place,
} from "./types";

type MetDetails = {
  air_pressure_at_sea_level?: number;
  air_temperature?: number;
  air_temperature_max?: number;
  air_temperature_min?: number;
  cloud_area_fraction?: number;
  dew_point_temperature?: number;
  relative_humidity?: number;
  ultraviolet_index_clear_sky?: number;
  wind_from_direction?: number;
  wind_speed?: number;
  wind_speed_of_gust?: number;
  precipitation_amount?: number;
};

type MetPoint = {
  time: string;
  data: {
    instant: { details: MetDetails };
    next_1_hours?: { summary?: { symbol_code?: string }; details?: MetDetails };
    next_6_hours?: { summary?: { symbol_code?: string }; details?: MetDetails };
    next_12_hours?: { summary?: { symbol_code?: string }; details?: MetDetails };
  };
};

type MetResponse = {
  properties: { timeseries: MetPoint[] };
};

function num(v: number | undefined, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function symbolToCode(symbol: string): number {
  const s = symbol.replace(/_day|_night|_polartwilight/g, "");
  if (s === "clearsky") return 0;
  if (s === "fair") return 1;
  if (s === "partlycloudy") return 2;
  if (s === "cloudy") return 3;
  if (s === "fog") return 45;
  if (s.includes("thunder")) return 95;
  if (s === "lightrainshowers") return 80;
  if (s === "rainshowers") return 81;
  if (s === "heavyrainshowers") return 82;
  if (s === "lightrain") return 61;
  if (s === "rain") return 63;
  if (s === "heavyrain") return 65;
  if (s.includes("sleet")) return 67;
  if (s.includes("snow") && s.includes("heavy")) return 75;
  if (s.includes("snow")) return 73;
  if (s.includes("rain")) return 63;
  return 2;
}

export function precipChance(mm: number, symbol: string): number {
  const s = symbol.replace(/_day|_night|_polartwilight/g, "");
  if (mm >= 2 || s.includes("heavy")) return 92;
  if (mm >= 0.6) return 78;
  if (mm >= 0.2) return 62;
  if (mm >= 0.05) return 48;
  if (/rain|sleet|snow|thunder|shower/.test(s)) return 42;
  if (s === "cloudy") return 18;
  if (s === "partlycloudy" || s === "fog") return 12;
  return 6;
}

function toLocalNaive(utcIso: string, timeZone: string): string {
  const d = new Date(utcIso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const g = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? "00";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

function hoursToClock(date: string, hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const hh = String(Math.floor(h)).padStart(2, "0");
  const mm = String(Math.round((h % 1) * 60)).padStart(2, "0");
  return `${date}T${hh}:${mm}`;
}

function solarTimes(lat: number, lon: number, date: string): {
  sunrise: string;
  sunset: string;
} {
  const [y, m, d] = date.split("-").map(Number);
  const n = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
  const decl = 23.44 * Math.sin(((360 / 365) * (n - 81) * Math.PI) / 180);
  const latR = (lat * Math.PI) / 180;
  const declR = (decl * Math.PI) / 180;
  const cosHa = -Math.tan(latR) * Math.tan(declR);
  const clamped = Math.min(1, Math.max(-1, cosHa));
  const hours = (Math.acos(clamped) * 180) / Math.PI / 15;
  const noon = 12 - lon / 15;
  return {
    sunrise: hoursToClock(date, noon - hours),
    sunset: hoursToClock(date, noon + hours),
  };
}

function pointMeta(p: MetPoint) {
  const instant = p.data.instant.details;
  const n1 = p.data.next_1_hours;
  const n6 = p.data.next_6_hours;
  const n12 = p.data.next_12_hours;
  const symbol =
    n1?.summary?.symbol_code ??
    n6?.summary?.symbol_code ??
    n12?.summary?.symbol_code ??
    "fair";
  const precipMm = num(n1?.details?.precipitation_amount, num(n6?.details?.precipitation_amount) / 6);
  return { instant, symbol, precipMm, isDay: !symbol.endsWith("_night") };
}

export function mapMetNoForecast(
  json: MetResponse,
  place: Place,
): Forecast {
  const timeZone = place.timezone || "UTC";
  const series = json.properties.timeseries;
  const now = Date.now();
  const startIdx = Math.max(
    0,
    series.findIndex((p) => new Date(p.time).getTime() >= now - 30 * 60 * 1000),
  );

  const allHours: HourPoint[] = series.map((p) => {
    const { instant, symbol, precipMm, isDay } = pointMeta(p);
    const tempC = num(instant.air_temperature);
    const humidity = num(instant.relative_humidity);
    const dewpointC = num(instant.dew_point_temperature, dewpointFromRh(tempC, humidity));
    const windDir = num(instant.wind_from_direction);
    const windSpeedKmh = num(instant.wind_speed) * 3.6;
    const cloudCover = num(instant.cloud_area_fraction);
    const modelChance = precipChance(precipMm, symbol);
    const localTime = toLocalNaive(p.time, timeZone);
    return {
      time: localTime,
      temperatureC: tempC,
      humidity,
      dewpointC,
      precipMm,
      modelChance,
      weatherCode: symbolToCode(symbol),
      cloudCover,
      windSpeedKmh,
      windGustKmh: num(instant.wind_speed_of_gust, num(instant.wind_speed) * 1.35) * 3.6,
      windDir,
      isDay,
      cape: 0,
      rain: estimateRain({
        modelProb: modelChance,
        rh: humidity,
        tempC,
        dewpointC,
        windDir,
        windSpeedKmh,
        cloudCover,
        cape: 0,
        latitude: place.latitude,
      }),
    };
  });

  const hourly = allHours.slice(startIdx, startIdx + 24);
  const currentHour = hourly[0] ?? allHours[0];
  const first = series[startIdx] ?? series[0];
  const { instant, symbol, precipMm, isDay } = pointMeta(first);
  const tempC = num(instant.air_temperature);
  const humidity = num(instant.relative_humidity);
  const dewpointC = num(instant.dew_point_temperature, dewpointFromRh(tempC, humidity));
  const windDir = num(instant.wind_from_direction);
  const windSpeedKmh = num(instant.wind_speed) * 3.6;
  const cloudCover = num(instant.cloud_area_fraction);
  const modelChance = precipChance(precipMm, symbol);

  const current: CurrentWeather = {
    time: currentHour?.time ?? toLocalNaive(first.time, timeZone),
    timezone: timeZone,
    temperatureC: tempC,
    apparentC: tempC,
    humidity,
    dewpointC,
    pressureHpa: num(instant.air_pressure_at_sea_level),
    cloudCover,
    precipitationMm: precipMm,
    weatherCode: symbolToCode(symbol),
    isDay,
    windSpeedKmh,
    windGustKmh: num(instant.wind_speed_of_gust, num(instant.wind_speed) * 1.35) * 3.6,
    windDir,
    rain: estimateRain({
      modelProb: modelChance,
      rh: humidity,
      tempC,
      dewpointC,
      windDir,
      windSpeedKmh,
      cloudCover,
      cape: 0,
      latitude: place.latitude,
    }),
  };

  const byDate = new Map<string, HourPoint[]>();
  for (const h of allHours) {
    const date = h.time.slice(0, 10);
    const list = byDate.get(date) ?? [];
    list.push(h);
    byDate.set(date, list);
  }
  const daily: DayPoint[] = [...byDate.entries()].slice(0, 7).map(([date, hours]) => {
    const temps = hours.map((h) => h.temperatureC);
    const peak = hours.reduce((m, h) => Math.max(m, h.rain.chance), 0);
    const wind = hours.reduce((m, h) => (h.windSpeedKmh > m.windSpeedKmh ? h : m), hours[0]);
    const precipMmDay = hours.reduce((s, h) => s + h.precipMm, 0);
    const uvMax = hours.reduce((m, h) => {
      const raw = series.find((p) => toLocalNaive(p.time, timeZone) === h.time);
      return Math.max(m, num(raw?.data.instant.details.ultraviolet_index_clear_sky));
    }, 0);
    const sample = hours[Math.floor(hours.length / 2)] ?? hours[0];
    const solar = solarTimes(place.latitude, place.longitude, date);
    const rain = estimateRain({
      modelProb: peak,
      rh: sample.humidity,
      tempC: Math.max(...temps),
      dewpointC: sample.dewpointC,
      windDir: wind.windDir,
      windSpeedKmh: wind.windSpeedKmh,
      cloudCover: sample.cloudCover,
      cape: 0,
      latitude: place.latitude,
    });
    rain.chance = Math.round(0.7 * peak + 0.3 * rain.chance);
    return {
      date,
      weatherCode: sample.weatherCode,
      tempMaxC: Math.max(...temps),
      tempMinC: Math.min(...temps),
      precipMm: precipMmDay,
      modelChance: peak,
      windSpeedKmh: wind.windSpeedKmh,
      windGustKmh: wind.windGustKmh,
      windDir: wind.windDir,
      sunrise: solar.sunrise,
      sunset: solar.sunset,
      uvMax,
      rain,
    };
  });

  return {
    place,
    current,
    hourly,
    daily,
    nextRain: nextRainWindow(hourly),
    windShift: detectWindShift(hourly),
  };
}
