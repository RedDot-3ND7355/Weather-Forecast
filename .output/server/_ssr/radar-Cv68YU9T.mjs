import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as windLong } from "./compass-BtdnyLVS.mjs";
import { r as estimateRain } from "./rain-CGpVhUJn.mjs";
import { mn as object, pn as number } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/radar-Cv68YU9T.js
var EARTH_KM = 6371;
var FETCH_KM = [
	0,
	25,
	50,
	90,
	140,
	200
];
function offsetKm(lat, lon, bearingDeg, km) {
	if (km === 0) return {
		latitude: lat,
		longitude: lon
	};
	const r = km / EARTH_KM;
	const b = bearingDeg * Math.PI / 180;
	const φ1 = lat * Math.PI / 180;
	const λ1 = lon * Math.PI / 180;
	const φ2 = Math.asin(Math.sin(φ1) * Math.cos(r) + Math.cos(φ1) * Math.sin(r) * Math.cos(b));
	const λ2 = λ1 + Math.atan2(Math.sin(b) * Math.sin(r) * Math.cos(φ1), Math.cos(r) - Math.sin(φ1) * Math.sin(φ2));
	return {
		latitude: φ2 * 180 / Math.PI,
		longitude: (λ2 * 180 / Math.PI + 540) % 360 - 180
	};
}
function travelHours(km, speedKmh) {
	return km / Math.max(speedKmh, 8);
}
function formatEta(minutes) {
	if (minutes <= 8) return "arriving now";
	if (minutes < 60) return `~${Math.round(minutes / 5) * 5} min`;
	const h = minutes / 60;
	if (h < 1.6) return "~1 hour";
	return `~${h < 10 ? h.toFixed(1) : Math.round(h)} hours`;
}
function arrivalCopy(args) {
	const from = windLong(args.windDir);
	if (args.rainingHere) return `It's raining here now. Wind from the ${from} is still feeding it.`;
	if (args.minutes > 720) return `No rain showing upwind of you. The next few hours look dry unless a new band forms.`;
	return `Rain about ${Math.round(args.km)} km away, coming from the ${from} at ${Math.round(args.windSpeedKmh)} km/h. ${capitalize(formatEta(args.minutes))} if the wind holds.`;
}
function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
var UA = "Vane/1.0 (wind-aware weather forecast)";
var catalogCache = {
	at: 0,
	value: null
};
var nowcastCache = /* @__PURE__ */ new Map();
async function getJson(url) {
	const res = await fetch(url, { headers: {
		accept: "application/json",
		"user-agent": UA
	} });
	if (!res.ok) throw new Error(`Radar source returned ${res.status}`);
	return await res.json();
}
var fetchRadarCatalog_createServerFn_handler = createServerRpc({
	id: "863a609e34c3563b807d29e784e5f4e9472c3185c8b5b5cffc6ffdc4f3f304e9",
	name: "fetchRadarCatalog",
	filename: "src/lib/weather/radar.ts"
}, (opts) => fetchRadarCatalog.__executeServer(opts));
var fetchRadarCatalog = createServerFn({ method: "GET" }).handler(fetchRadarCatalog_createServerFn_handler, async () => {
	if (catalogCache.value && Date.now() - catalogCache.at < 12e4) return catalogCache.value;
	const json = await getJson("https://api.rainviewer.com/public/weather-maps.json");
	const host = json.host.replace(/\/$/, "");
	const value = {
		host,
		frames: [...json.radar.past ?? [], ...json.radar.nowcast ?? []].map((f) => ({
			time: f.time,
			kind: "observed",
			tileUrl: `${host}${f.path}/256/{z}/{x}/{y}/6/1_1.png`
		}))
	};
	catalogCache.at = Date.now();
	catalogCache.value = value;
	return value;
});
var gridCache = /* @__PURE__ */ new Map();
function makeGrid(lat, lon, n = 5) {
	const dLat = 1.35;
	const dLon = 1.35 / Math.max(.35, Math.cos(lat * Math.PI / 180));
	const pts = [];
	for (let i = 0; i < n; i += 1) for (let j = 0; j < n; j += 1) pts.push({
		latitude: lat - dLat + 2 * dLat * i / (n - 1),
		longitude: lon - dLon + 2 * dLon * j / (n - 1)
	});
	return pts;
}
var fetchPrecipGrid_createServerFn_handler = createServerRpc({
	id: "a18c3671cbbca41ac752d67ab55ebc45fcd3d2935dffba314e0c7217c41206c5",
	name: "fetchPrecipGrid",
	filename: "src/lib/weather/radar.ts"
}, (opts) => fetchPrecipGrid.__executeServer(opts));
var fetchPrecipGrid = createServerFn({ method: "GET" }).validator(object({
	latitude: number().min(-90).max(90),
	longitude: number().min(-180).max(180)
})).handler(fetchPrecipGrid_createServerFn_handler, async ({ data }) => {
	const key = `${data.latitude.toFixed(2)},${data.longitude.toFixed(2)}`;
	const hit = gridCache.get(key);
	if (hit && Date.now() - hit.at < 48e4) return hit.value;
	const points = makeGrid(data.latitude, data.longitude);
	const params = new URLSearchParams({
		latitude: points.map((p) => p.latitude.toFixed(4)).join(","),
		longitude: points.map((p) => p.longitude.toFixed(4)).join(","),
		timezone: "GMT",
		forecast_days: "1",
		forecast_minutely_15: "24",
		minutely_15: "precipitation"
	});
	let raw;
	try {
		raw = await getJson(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
	} catch {
		gridCache.set(key, {
			at: Date.now(),
			value: []
		});
		return [];
	}
	if (raw && typeof raw === "object" && !Array.isArray(raw) && "error" in raw) {
		gridCache.set(key, {
			at: Date.now(),
			value: []
		});
		return [];
	}
	const locs = Array.isArray(raw) ? raw : [raw];
	const buckets = /* @__PURE__ */ new Map();
	locs.forEach((loc, i) => {
		const pt = points[i];
		if (!pt) return;
		const times = loc.minutely_15?.time ?? [];
		const precip = loc.minutely_15?.precipitation ?? [];
		times.forEach((iso, t) => {
			const unix = Math.floor(new Date(iso).getTime() / 1e3);
			if (!Number.isFinite(unix)) return;
			const bucket = Math.round(unix / 1800) * 1800;
			let grid = buckets.get(bucket);
			if (!grid) {
				grid = /* @__PURE__ */ new Map();
				buckets.set(bucket, grid);
			}
			const id = `${pt.latitude.toFixed(3)},${pt.longitude.toFixed(3)}`;
			const mm = num(precip[t]);
			const prev = grid.get(id);
			grid.set(id, {
				latitude: pt.latitude,
				longitude: pt.longitude,
				precipMm: Math.max(prev?.precipMm ?? 0, mm)
			});
		});
	});
	const now = Math.floor(Date.now() / 1e3);
	const frames = [...buckets.entries()].sort((a, b) => a[0] - b[0]).filter(([time]) => time > now + 480 && time <= now + 21600 + 60).map(([time, grid]) => ({
		time,
		kind: "forecast",
		cells: [...grid.values()]
	}));
	gridCache.set(key, {
		at: Date.now(),
		value: frames
	});
	return frames;
});
var fetchRadarNowcast_createServerFn_handler = createServerRpc({
	id: "15e2b9a1b9e19d4fce08228a67e0ab8734cdef8facc9972da8cad05b3efcba82",
	name: "fetchRadarNowcast",
	filename: "src/lib/weather/radar.ts"
}, (opts) => fetchRadarNowcast.__executeServer(opts));
var fetchRadarNowcast = createServerFn({ method: "GET" }).validator(object({
	latitude: number().min(-90).max(90),
	longitude: number().min(-180).max(180),
	windDir: number(),
	windSpeedKmh: number()
})).handler(fetchRadarNowcast_createServerFn_handler, async ({ data }) => {
	const key = `${data.latitude.toFixed(3)},${data.longitude.toFixed(3)},${Math.round(data.windDir)}`;
	const hit = nowcastCache.get(key);
	if (hit && Date.now() - hit.at < 48e4) return hit.value;
	const points = FETCH_KM.map((km) => ({
		km,
		...offsetKm(data.latitude, data.longitude, data.windDir, km)
	}));
	const params = new URLSearchParams({
		latitude: points.map((p) => p.latitude.toFixed(4)).join(","),
		longitude: points.map((p) => p.longitude.toFixed(4)).join(","),
		timezone: "auto",
		forecast_days: "1",
		past_minutely_15: "4",
		forecast_minutely_15: "24",
		minutely_15: [
			"precipitation",
			"wind_speed_10m",
			"wind_direction_10m",
			"relative_humidity_2m",
			"temperature_2m",
			"cloud_cover"
		].join(",")
	});
	let raw;
	try {
		raw = await getJson(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
	} catch {
		const empty = {
			hours: [],
			samples: [],
			arrival: null
		};
		nowcastCache.set(key, {
			at: Date.now(),
			value: empty
		});
		return empty;
	}
	if (raw && typeof raw === "object" && !Array.isArray(raw) && "error" in raw) {
		const empty = {
			hours: [],
			samples: [],
			arrival: null
		};
		nowcastCache.set(key, {
			at: Date.now(),
			value: empty
		});
		return empty;
	}
	const series = (Array.isArray(raw) ? raw : [raw]).map((loc, i) => {
		const block = loc.minutely_15;
		const rows = (block?.time ?? []).map((time, t) => ({
			time,
			precipMm: num(block?.precipitation[t]),
			windSpeedKmh: num(block?.wind_speed_10m[t], data.windSpeedKmh),
			windDir: num(block?.wind_direction_10m[t], data.windDir),
			rh: num(block?.relative_humidity_2m?.[t], 70),
			tempC: num(block?.temperature_2m?.[t], 12),
			cloud: num(block?.cloud_cover?.[t], 50)
		}));
		return {
			...points[i],
			rows
		};
	});
	const here = series[0];
	const latestHere = here?.rows.reduce((a, r) => new Date(r.time).getTime() <= Date.now() + 3e5 ? r : a);
	const rainingHere = (latestHere?.precipMm ?? 0) >= .15;
	const nowMs = Date.now();
	let arrival = rainingHere ? {
		minutes: 0,
		km: 0,
		precipMm: latestHere?.precipMm ?? 0,
		label: "raining now",
		copy: arrivalCopy({
			minutes: 0,
			km: 0,
			windDir: data.windDir,
			windSpeedKmh: data.windSpeedKmh,
			rainingHere: true
		})
	} : null;
	if (!arrival) for (const sample of series.slice(1)) {
		const latest = sample.rows.reduce((a, r) => new Date(r.time).getTime() <= Date.now() + 3e5 ? r : a);
		if (!latest || latest.precipMm < .15) continue;
		const speed = latest.windSpeedKmh || data.windSpeedKmh;
		const minutes = Math.round(travelHours(sample.km, speed) * 60);
		if (!arrival || minutes < arrival.minutes) arrival = {
			minutes,
			km: sample.km,
			precipMm: latest.precipMm,
			label: formatEta(minutes),
			copy: arrivalCopy({
				minutes,
				km: sample.km,
				windDir: latest.windDir || data.windDir,
				windSpeedKmh: speed,
				rainingHere: false
			})
		};
	}
	const hourStarts = [];
	for (let i = 0; i < 6; i += 1) {
		const d = new Date(nowMs);
		d.setMinutes(0, 0, 0);
		d.setHours(d.getHours() + i);
		hourStarts.push(d.getTime());
	}
	const value = {
		hours: hourStarts.map((start) => {
			const end = start + 36e5;
			const hereRows = (here?.rows ?? []).filter((r) => {
				const t = new Date(r.time).getTime();
				return t >= start && t < end;
			});
			const hereMm = hereRows.reduce((s, r) => s + r.precipMm, 0);
			let fetchMm = 0;
			for (const sample of series.slice(1)) for (const row of sample.rows) {
				if (row.precipMm < .08) continue;
				const speed = row.windSpeedKmh || data.windSpeedKmh;
				const arrive = new Date(row.time).getTime() + travelHours(sample.km, speed) * 36e5;
				if (arrive >= start && arrive < end) fetchMm = Math.max(fetchMm, row.precipMm);
			}
			const sampleRow = hereRows[0];
			const modelProb = Math.min(100, Math.round((hereMm > .2 ? 55 : 0) + fetchMm * 80 + (hereMm > 0 ? 20 : 0)));
			const rain = estimateRain({
				modelProb,
				rh: sampleRow?.rh ?? 70,
				tempC: sampleRow?.tempC ?? 12,
				dewpointC: (sampleRow?.tempC ?? 12) - (100 - (sampleRow?.rh ?? 70)) / 12,
				windDir: sampleRow?.windDir ?? data.windDir,
				windSpeedKmh: sampleRow?.windSpeedKmh ?? data.windSpeedKmh,
				cloudCover: sampleRow?.cloud ?? 50,
				latitude: data.latitude
			});
			return {
				time: new Date(start).toISOString(),
				hereMm,
				fetchMm,
				chance: rain.chance,
				arriving: fetchMm >= .12 && hereMm < .15
			};
		}),
		samples: series.map((s) => ({
			km: s.km,
			latitude: s.latitude,
			longitude: s.longitude,
			precipMm: s.rows.reduce((a, r) => new Date(r.time).getTime() <= Date.now() + 3e5 ? r : a)?.precipMm ?? 0
		})),
		arrival
	};
	nowcastCache.set(key, {
		at: Date.now(),
		value
	});
	return value;
});
function num(v, fallback = 0) {
	return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
//#endregion
export { fetchPrecipGrid_createServerFn_handler, fetchRadarCatalog_createServerFn_handler, fetchRadarNowcast_createServerFn_handler };
