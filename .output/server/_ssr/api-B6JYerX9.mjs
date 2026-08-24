import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as estimateRain, n as detectWindShift, o as nextRainWindow, r as dewpointFromRh } from "./rain-BTolBrM-.mjs";
import { _n as string, mn as object, pn as number } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-B6JYerX9.js
function num$1(v, fallback = 0) {
	return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
function symbolToCode(symbol) {
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
function precipChance(mm, symbol) {
	const s = symbol.replace(/_day|_night|_polartwilight/g, "");
	if (mm >= 2 || s.includes("heavy")) return 92;
	if (mm >= .6) return 78;
	if (mm >= .2) return 62;
	if (mm >= .05) return 48;
	if (/rain|sleet|snow|thunder|shower/.test(s)) return 42;
	if (s === "cloudy") return 18;
	if (s === "partlycloudy" || s === "fog") return 12;
	return 6;
}
function toLocalNaive(utcIso, timeZone) {
	const d = new Date(utcIso);
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).formatToParts(d);
	const g = (t) => parts.find((p) => p.type === t)?.value ?? "00";
	return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}
function hoursToClock(date, hour) {
	const h = (hour % 24 + 24) % 24;
	return `${date}T${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round(h % 1 * 60)).padStart(2, "0")}`;
}
function solarTimes(lat, lon, date) {
	const [y, m, d] = date.split("-").map(Number);
	const n = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 864e5);
	const decl = 23.44 * Math.sin(360 / 365 * (n - 81) * Math.PI / 180);
	const latR = lat * Math.PI / 180;
	const declR = decl * Math.PI / 180;
	const cosHa = -Math.tan(latR) * Math.tan(declR);
	const hours = Math.acos(Math.min(1, Math.max(-1, cosHa))) * 180 / Math.PI / 15;
	const noon = 12 - lon / 15;
	return {
		sunrise: hoursToClock(date, noon - hours),
		sunset: hoursToClock(date, noon + hours)
	};
}
function pointMeta(p) {
	const instant = p.data.instant.details;
	const n1 = p.data.next_1_hours;
	const n6 = p.data.next_6_hours;
	const n12 = p.data.next_12_hours;
	const symbol = n1?.summary?.symbol_code ?? n6?.summary?.symbol_code ?? n12?.summary?.symbol_code ?? "fair";
	return {
		instant,
		symbol,
		precipMm: num$1(n1?.details?.precipitation_amount, num$1(n6?.details?.precipitation_amount) / 6),
		isDay: !symbol.endsWith("_night")
	};
}
function mapMetNoForecast(json, place) {
	const timeZone = place.timezone || "UTC";
	const series = json.properties.timeseries;
	const now = Date.now();
	const startIdx = Math.max(0, series.findIndex((p) => new Date(p.time).getTime() >= now - 18e5));
	const allHours = series.map((p) => {
		const { instant, symbol, precipMm, isDay } = pointMeta(p);
		const tempC = num$1(instant.air_temperature);
		const humidity = num$1(instant.relative_humidity);
		const dewpointC = num$1(instant.dew_point_temperature, dewpointFromRh(tempC, humidity));
		const windDir = num$1(instant.wind_from_direction);
		const windSpeedKmh = num$1(instant.wind_speed) * 3.6;
		const cloudCover = num$1(instant.cloud_area_fraction);
		const modelChance = precipChance(precipMm, symbol);
		return {
			time: toLocalNaive(p.time, timeZone),
			temperatureC: tempC,
			humidity,
			dewpointC,
			precipMm,
			modelChance,
			weatherCode: symbolToCode(symbol),
			cloudCover,
			windSpeedKmh,
			windGustKmh: num$1(instant.wind_speed_of_gust, num$1(instant.wind_speed) * 1.35) * 3.6,
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
				latitude: place.latitude
			})
		};
	});
	const hourly = allHours.slice(startIdx, startIdx + 24);
	const currentHour = hourly[0] ?? allHours[0];
	const first = series[startIdx] ?? series[0];
	const { instant, symbol, precipMm, isDay } = pointMeta(first);
	const tempC = num$1(instant.air_temperature);
	const humidity = num$1(instant.relative_humidity);
	const dewpointC = num$1(instant.dew_point_temperature, dewpointFromRh(tempC, humidity));
	const windDir = num$1(instant.wind_from_direction);
	const windSpeedKmh = num$1(instant.wind_speed) * 3.6;
	const cloudCover = num$1(instant.cloud_area_fraction);
	const modelChance = precipChance(precipMm, symbol);
	const current = {
		time: currentHour?.time ?? toLocalNaive(first.time, timeZone),
		timezone: timeZone,
		temperatureC: tempC,
		apparentC: tempC,
		humidity,
		dewpointC,
		pressureHpa: num$1(instant.air_pressure_at_sea_level),
		cloudCover,
		precipitationMm: precipMm,
		weatherCode: symbolToCode(symbol),
		isDay,
		windSpeedKmh,
		windGustKmh: num$1(instant.wind_speed_of_gust, num$1(instant.wind_speed) * 1.35) * 3.6,
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
			latitude: place.latitude
		})
	};
	const byDate = /* @__PURE__ */ new Map();
	for (const h of allHours) {
		const date = h.time.slice(0, 10);
		const list = byDate.get(date) ?? [];
		list.push(h);
		byDate.set(date, list);
	}
	return {
		place,
		current,
		hourly,
		daily: [...byDate.entries()].slice(0, 7).map(([date, hours]) => {
			const temps = hours.map((h) => h.temperatureC);
			const peak = hours.reduce((m, h) => Math.max(m, h.rain.chance), 0);
			const wind = hours.reduce((m, h) => h.windSpeedKmh > m.windSpeedKmh ? h : m, hours[0]);
			const precipMmDay = hours.reduce((s, h) => s + h.precipMm, 0);
			const uvMax = hours.reduce((m, h) => {
				const raw = series.find((p) => toLocalNaive(p.time, timeZone) === h.time);
				return Math.max(m, num$1(raw?.data.instant.details.ultraviolet_index_clear_sky));
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
				latitude: place.latitude
			});
			rain.chance = Math.round(.7 * peak + .3 * rain.chance);
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
				rain
			};
		}),
		nextRain: nextRainWindow(hourly),
		windShift: detectWindShift(hourly)
	};
}
var UA = "Vane/1.0 (wind-aware weather forecast)";
var placeSchema = object({
	name: string(),
	latitude: number(),
	longitude: number(),
	admin: string().nullable().optional(),
	country: string().nullable().optional(),
	timezone: string().nullable().optional()
});
var forecastCache = /* @__PURE__ */ new Map();
var CACHE_MS = 6e5;
function cacheKey(place) {
	return `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
}
function num(v, fallback = 0) {
	return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
async function getJson(url) {
	const res = await fetch(url, { headers: {
		accept: "application/json",
		"user-agent": UA
	} });
	if (!res.ok) {
		const err = /* @__PURE__ */ new Error(`Weather service returned ${res.status}`);
		err.status = res.status;
		throw err;
	}
	return await res.json();
}
function hourIndexAt(times, iso) {
	const now = new Date(iso).getTime();
	let best = 0;
	for (let i = 0; i < times.length; i += 1) if (new Date(times[i]).getTime() <= now) best = i;
	else break;
	return best;
}
function mapHour(hourly, i, latitude) {
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
			latitude
		})
	};
}
function mapDay(daily, i, hours, latitude) {
	const date = daily.time[i];
	const dayHours = hours.filter((h) => h.time.startsWith(date));
	const peak = dayHours.reduce((m, h) => Math.max(m, h.rain.chance), num(daily.precipitation_probability_max[i]));
	const windDir = num(daily.wind_direction_10m_dominant[i]);
	const windSpeedKmh = num(daily.wind_speed_10m_max[i]);
	const sample = dayHours.find((h) => h.time.includes("T15:")) ?? dayHours[Math.floor(dayHours.length / 2)] ?? hours[0];
	const rain = estimateRain({
		modelProb: peak,
		rh: sample?.humidity ?? 60,
		tempC: num(daily.temperature_2m_max[i]),
		dewpointC: sample?.dewpointC ?? dewpointFromRh(num(daily.temperature_2m_max[i]), 60),
		windDir,
		windSpeedKmh,
		cloudCover: sample?.cloudCover ?? 50,
		cape: sample?.cape ?? 0,
		latitude
	});
	rain.chance = Math.round(.7 * peak + .3 * rain.chance);
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
		rain
	};
}
function mapOpenMeteo(json, data) {
	const allHours = json.hourly.time.map((_, i) => mapHour(json.hourly, i, data.latitude));
	const idx = hourIndexAt(json.hourly.time, json.current.time);
	const hourly = allHours.slice(idx, idx + 24);
	const daily = json.daily.time.map((_, i) => mapDay(json.daily, i, allHours, data.latitude));
	const currentHour = allHours[idx];
	const tempC = num(json.current.temperature_2m);
	const humidity = num(json.current.relative_humidity_2m);
	const dewpointC = currentHour?.dewpointC ?? dewpointFromRh(tempC, humidity);
	const windDir = num(json.current.wind_direction_10m);
	const windSpeedKmh = num(json.current.wind_speed_10m);
	const cloudCover = num(json.current.cloud_cover);
	const modelChance = currentHour?.modelChance ?? daily[0]?.modelChance ?? 0;
	return {
		place: data,
		current: {
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
				latitude: data.latitude
			})
		},
		hourly,
		daily,
		nextRain: nextRainWindow(hourly),
		windShift: detectWindShift(hourly)
	};
}
async function fetchOpenMeteo(data) {
	return mapOpenMeteo(await getJson(`https://api.open-meteo.com/v1/forecast?${new URLSearchParams({
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
			"wind_gusts_10m"
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
			"is_day"
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
			"wind_direction_10m_dominant"
		].join(",")
	}).toString()}`), data);
}
async function fetchMetNo(data) {
	return mapMetNoForecast(await getJson(`https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${data.latitude}&lon=${data.longitude}`), data);
}
var searchPlaces_createServerFn_handler = createServerRpc({
	id: "f5f33966c1a68a8e3cea1abd24a3eb1faef2991b2daf75449e1f34bc610df2de",
	name: "searchPlaces",
	filename: "src/lib/weather/api.ts"
}, (opts) => searchPlaces.__executeServer(opts));
var searchPlaces = createServerFn({ method: "GET" }).validator(object({ q: string().trim().min(1).max(80) })).handler(searchPlaces_createServerFn_handler, async ({ data }) => {
	return ((await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(data.q)}&count=7&language=en&format=json`)).results ?? []).map((r) => ({
		name: r.name,
		latitude: r.latitude,
		longitude: r.longitude,
		admin: r.admin1 ?? null,
		country: r.country ?? null,
		timezone: r.timezone ?? null
	}));
});
var reversePlace_createServerFn_handler = createServerRpc({
	id: "733f19c61804a32ffd9ab27261a4ea8a7347d8b360d88ca132caab1999ea02a5",
	name: "reversePlace",
	filename: "src/lib/weather/api.ts"
}, (opts) => reversePlace.__executeServer(opts));
var reversePlace = createServerFn({ method: "GET" }).validator(object({
	latitude: number().min(-90).max(90),
	longitude: number().min(-180).max(180)
})).handler(reversePlace_createServerFn_handler, async ({ data }) => {
	const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${data.latitude}&longitude=${data.longitude}&language=en&format=json`;
	try {
		const hit = (await getJson(url)).results?.[0];
		if (hit) return {
			name: hit.name,
			latitude: data.latitude,
			longitude: data.longitude,
			admin: hit.admin1 ?? null,
			country: hit.country ?? null,
			timezone: hit.timezone ?? null
		};
	} catch {}
	return {
		name: "Your location",
		latitude: data.latitude,
		longitude: data.longitude,
		admin: null,
		country: null
	};
});
var fetchForecast_createServerFn_handler = createServerRpc({
	id: "530522ada6bf8b03636e6c39ffd5c0ada5294f0a243012533f078ff63b368aae",
	name: "fetchForecast",
	filename: "src/lib/weather/api.ts"
}, (opts) => fetchForecast.__executeServer(opts));
var fetchForecast = createServerFn({ method: "GET" }).validator(placeSchema).handler(fetchForecast_createServerFn_handler, async ({ data }) => {
	const key = cacheKey(data);
	const hit = forecastCache.get(key);
	if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
	let forecast;
	try {
		forecast = await fetchOpenMeteo(data);
	} catch {
		forecast = await fetchMetNo(data);
	}
	forecastCache.set(key, {
		at: Date.now(),
		value: forecast
	});
	return forecast;
});
//#endregion
export { fetchForecast_createServerFn_handler, reversePlace_createServerFn_handler, searchPlaces_createServerFn_handler };
