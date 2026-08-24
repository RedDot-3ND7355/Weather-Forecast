import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  FETCH_KM,
  arrivalCopy,
  formatEta,
  offsetKm,
  travelHours,
} from "./advection";
import { estimateRain } from "./rain";
import type { HourPoint } from "./types";

const UA = "Vane/1.0 (wind-aware weather forecast)";

export type PrecipCell = {
  latitude: number;
  longitude: number;
  precipMm: number;
  chance?: number;
};

export type RadarFrame = {
  time: number;
  kind: "observed" | "forecast";
  tileUrl?: string;
  cells?: PrecipCell[];
};

export function pickHalfHourFrames(
  frames: RadarFrame[],
  spanSec = 2 * 3600,
  stepSec = 30 * 60,
): RadarFrame[] {
  if (!frames.length) return [];
  const sorted = [...frames].sort((a, b) => a.time - b.time);
  const latest = sorted[sorted.length - 1].time;
  const oldest = sorted[0].time;
  const start = Math.max(oldest, latest - spanSec);
  const picked: RadarFrame[] = [];
  for (let t = start; t <= latest + 1; t += stepSec) {
    let best = sorted[0];
    let bestD = Math.abs(sorted[0].time - t);
    for (const f of sorted) {
      const d = Math.abs(f.time - t);
      if (d < bestD) {
        best = f;
        bestD = d;
      }
    }
    if (bestD <= stepSec / 2 && picked[picked.length - 1]?.time !== best.time) {
      picked.push(best);
    }
  }
  if (picked[picked.length - 1]?.time !== latest) {
    const last = sorted[sorted.length - 1];
    if (!picked.length || last.time - picked[picked.length - 1].time >= stepSec / 2) {
      picked.push(last);
    } else {
      picked[picked.length - 1] = last;
    }
  }
  return picked;
}

export function buildAdvectionFrames(args: {
  latitude: number;
  longitude: number;
  hours: HourPoint[];
}): RadarFrame[] {
  const { latitude, longitude, hours } = args;
  if (hours.length < 2) return [];
  const frames: RadarFrame[] = [];
  const steps = Math.min(6, hours.length - 1);
  for (let i = 1; i <= steps; i += 1) {
    for (const half of [0, 0.5]) {
      if (i === steps && half === 0.5) continue;
      const frac = i + half;
      const cells: PrecipCell[] = [];
      for (let j = 0; j < hours.length && j <= i + 5; j += 1) {
        const h = hours[j];
        const offsetH = j - frac;
        const intensity = Math.max(h.precipMm, h.rain.chance / 40);
        if (h.rain.chance < 14 && h.precipMm < 0.08) continue;
        const dist = Math.abs(offsetH) * Math.max(h.windSpeedKmh, 14);
        const bearing = offsetH >= 0 ? h.windDir : (h.windDir + 180) % 360;
        const pos = offsetKm(latitude, longitude, bearing, dist);
        cells.push({
          latitude: pos.latitude,
          longitude: pos.longitude,
          precipMm: intensity,
          chance: h.rain.chance,
        });
        if (intensity >= 0.45 && dist > 8) {
          const left = offsetKm(pos.latitude, pos.longitude, h.windDir + 90, 22);
          const right = offsetKm(pos.latitude, pos.longitude, h.windDir - 90, 22);
          cells.push(
            { ...left, precipMm: intensity * 0.55, chance: h.rain.chance },
            { ...right, precipMm: intensity * 0.55, chance: h.rain.chance },
          );
        }
      }
      const base = Math.floor(new Date(hours[i].time).getTime() / 1000);
      frames.push({
        time: base + half * 1800,
        kind: "forecast",
        cells,
      });
    }
  }
  return frames;
}

export type RadarCatalog = {
  host: string;
  frames: RadarFrame[];
};

export type FetchSample = {
  km: number;
  latitude: number;
  longitude: number;
  precipMm: number;
};

export type NowcastHour = {
  time: string;
  hereMm: number;
  fetchMm: number;
  chance: number;
  arriving: boolean;
};

export type RadarNowcast = {
  hours: NowcastHour[];
  samples: FetchSample[];
  arrival: {
    minutes: number;
    km: number;
    precipMm: number;
    label: string;
    copy: string;
  } | null;
};

type MinuteBlock = {
  time: string[];
  precipitation: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  relative_humidity_2m?: number[];
  temperature_2m?: number[];
  cloud_cover?: number[];
};

type MinuteLoc = {
  latitude: number;
  longitude: number;
  minutely_15?: MinuteBlock;
};

const catalogCache = { at: 0, value: null as RadarCatalog | null };
const nowcastCache = new Map<string, { at: number; value: RadarNowcast }>();

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { accept: "application/json", "user-agent": UA },
  });
  if (!res.ok) throw new Error(`Radar source returned ${res.status}`);
  return (await res.json()) as T;
}

export const fetchRadarCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<RadarCatalog> => {
    if (catalogCache.value && Date.now() - catalogCache.at < 2 * 60 * 1000) {
      return catalogCache.value;
    }
    const json = await getJson<{
      host: string;
      radar: {
        past: { time: number; path: string }[];
        nowcast: { time: number; path: string }[];
      };
    }>("https://api.rainviewer.com/public/weather-maps.json");
    const host = json.host.replace(/\/$/, "");
    const times = [...(json.radar.past ?? []), ...(json.radar.nowcast ?? [])];
    const frames: RadarFrame[] = times.map((f) => ({
      time: f.time,
      kind: "observed" as const,
      tileUrl: `${host}${f.path}/256/{z}/{x}/{y}/6/1_1.png`,
    }));
    const value = { host, frames };
    catalogCache.at = Date.now();
    catalogCache.value = value;
    return value;
  },
);

const gridCache = new Map<string, { at: number; value: RadarFrame[] }>();

function makeGrid(lat: number, lon: number, n = 4): { latitude: number; longitude: number }[] {
  const dLat = 1.35;
  const dLon = 1.35 / Math.max(0.35, Math.cos((lat * Math.PI) / 180));
  const pts: { latitude: number; longitude: number }[] = [];
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      pts.push({
        latitude: lat - dLat + ((2 * dLat) * i) / (n - 1),
        longitude: lon - dLon + ((2 * dLon) * j) / (n - 1),
      });
    }
  }
  return pts;
}

export const fetchPrecipGrid = createServerFn({ method: "GET" })
  .validator(
    z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  )
  .handler(async ({ data }): Promise<RadarFrame[]> => {
    const key = `${data.latitude.toFixed(2)},${data.longitude.toFixed(2)}`;
    const hit = gridCache.get(key);
    if (hit && Date.now() - hit.at < 8 * 60 * 1000) return hit.value;

    const points = makeGrid(data.latitude, data.longitude);
    const params = new URLSearchParams({
      latitude: points.map((p) => p.latitude.toFixed(4)).join(","),
      longitude: points.map((p) => p.longitude.toFixed(4)).join(","),
      timezone: "GMT",
      forecast_hours: "12",
      hourly: "precipitation,precipitation_probability",
    });
    type HourLoc = {
      latitude?: number;
      longitude?: number;
      hourly?: {
        time: string[];
        precipitation: number[];
        precipitation_probability: number[];
      };
      error?: boolean;
    };
    let raw: HourLoc | HourLoc[];
    try {
      raw = await getJson<HourLoc | HourLoc[]>(
        `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      );
    } catch {
      gridCache.set(key, { at: Date.now(), value: [] });
      return [];
    }
    if (raw && typeof raw === "object" && !Array.isArray(raw) && raw.error) {
      gridCache.set(key, { at: Date.now(), value: [] });
      return [];
    }
    const locs = Array.isArray(raw) ? raw : [raw];
    const buckets = new Map<number, Map<string, PrecipCell>>();
    locs.forEach((loc, i) => {
      const pt = points[i];
      if (!pt) return;
      const times = loc.hourly?.time ?? [];
      const precip = loc.hourly?.precipitation ?? [];
      const chance = loc.hourly?.precipitation_probability ?? [];
      times.forEach((iso, t) => {
        const unix = Math.floor(new Date(iso).getTime() / 1000);
        if (!Number.isFinite(unix)) return;
        let grid = buckets.get(unix);
        if (!grid) {
          grid = new Map();
          buckets.set(unix, grid);
        }
        const id = `${pt.latitude.toFixed(3)},${pt.longitude.toFixed(3)}`;
        const mm = num(precip[t]);
        const pct = num(chance[t]);
        grid.set(id, {
          latitude: pt.latitude,
          longitude: pt.longitude,
          precipMm: Math.max(mm, pct / 40),
          chance: pct,
        });
      });
    });
    const now = Math.floor(Date.now() / 1000);
    const frames: RadarFrame[] = [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .filter(([time]) => time > now + 8 * 60 && time <= now + 6 * 3600 + 120)
      .map(([time, grid]) => ({
        time,
        kind: "forecast" as const,
        cells: [...grid.values()],
      }));
    gridCache.set(key, { at: Date.now(), value: frames });
    return frames;
  });

export const fetchRadarNowcast = createServerFn({ method: "GET" })
  .validator(
    z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      windDir: z.number(),
      windSpeedKmh: z.number(),
    }),
  )
  .handler(async ({ data }): Promise<RadarNowcast> => {
    const key = `${data.latitude.toFixed(3)},${data.longitude.toFixed(3)},${Math.round(data.windDir)}`;
    const hit = nowcastCache.get(key);
    if (hit && Date.now() - hit.at < 8 * 60 * 1000) return hit.value;

    const points = FETCH_KM.map((km) => ({
      km,
      ...offsetKm(data.latitude, data.longitude, data.windDir, km),
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
        "cloud_cover",
      ].join(","),
    });
    let raw: MinuteLoc | MinuteLoc[];
    try {
      raw = await getJson<MinuteLoc | MinuteLoc[]>(
        `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      );
    } catch {
      const empty: RadarNowcast = { hours: [], samples: [], arrival: null };
      nowcastCache.set(key, { at: Date.now(), value: empty });
      return empty;
    }
    if (raw && typeof raw === "object" && !Array.isArray(raw) && "error" in raw) {
      const empty: RadarNowcast = { hours: [], samples: [], arrival: null };
      nowcastCache.set(key, { at: Date.now(), value: empty });
      return empty;
    }
    const locs = Array.isArray(raw) ? raw : [raw];

    const series = locs.map((loc, i) => {
      const block = loc.minutely_15;
      const times = block?.time ?? [];
      const rows = times.map((time, t) => ({
        time,
        precipMm: num(block?.precipitation[t]),
        windSpeedKmh: num(block?.wind_speed_10m[t], data.windSpeedKmh),
        windDir: num(block?.wind_direction_10m[t], data.windDir),
        rh: num(block?.relative_humidity_2m?.[t], 70),
        tempC: num(block?.temperature_2m?.[t], 12),
        cloud: num(block?.cloud_cover?.[t], 50),
      }));
      return { ...points[i], rows };
    });

    const here = series[0];
    const latestHere = here?.rows.reduce((a, r) =>
      new Date(r.time).getTime() <= Date.now() + 5 * 60 * 1000 ? r : a,
    );
    const rainingHere = (latestHere?.precipMm ?? 0) >= 0.15;
    const nowMs = Date.now();

    let arrival: RadarNowcast["arrival"] = rainingHere
      ? {
          minutes: 0,
          km: 0,
          precipMm: latestHere?.precipMm ?? 0,
          label: "raining now",
          copy: arrivalCopy({
            minutes: 0,
            km: 0,
            windDir: data.windDir,
            windSpeedKmh: data.windSpeedKmh,
            rainingHere: true,
          }),
        }
      : null;

    if (!arrival) {
      for (const sample of series.slice(1)) {
        const latest = sample.rows.reduce((a, r) =>
          new Date(r.time).getTime() <= Date.now() + 5 * 60 * 1000 ? r : a,
        );
        if (!latest || latest.precipMm < 0.15) continue;
        const speed = latest.windSpeedKmh || data.windSpeedKmh;
        const minutes = Math.round(travelHours(sample.km, speed) * 60);
        if (!arrival || minutes < arrival.minutes) {
          arrival = {
            minutes,
            km: sample.km,
            precipMm: latest.precipMm,
            label: formatEta(minutes),
            copy: arrivalCopy({
              minutes,
              km: sample.km,
              windDir: latest.windDir || data.windDir,
              windSpeedKmh: speed,
              rainingHere: false,
            }),
          };
        }
      }
    }

    const hourStarts: number[] = [];
    for (let i = 0; i < 6; i += 1) {
      const d = new Date(nowMs);
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() + i);
      hourStarts.push(d.getTime());
    }

    const hours: NowcastHour[] = hourStarts.map((start) => {
      const end = start + 60 * 60 * 1000;
      const hereRows = (here?.rows ?? []).filter((r) => {
        const t = new Date(r.time).getTime();
        return t >= start && t < end;
      });
      const hereMm = hereRows.reduce((s, r) => s + r.precipMm, 0);
      let fetchMm = 0;
      for (const sample of series.slice(1)) {
        for (const row of sample.rows) {
          if (row.precipMm < 0.08) continue;
          const speed = row.windSpeedKmh || data.windSpeedKmh;
          const arrive =
            new Date(row.time).getTime() + travelHours(sample.km, speed) * 3600000;
          if (arrive >= start && arrive < end) {
            fetchMm = Math.max(fetchMm, row.precipMm);
          }
        }
      }
      const sampleRow = hereRows[0];
      const modelProb = Math.min(
        100,
        Math.round((hereMm > 0.2 ? 55 : 0) + fetchMm * 80 + (hereMm > 0 ? 20 : 0)),
      );
      const rain = estimateRain({
        modelProb,
        rh: sampleRow?.rh ?? 70,
        tempC: sampleRow?.tempC ?? 12,
        dewpointC: (sampleRow?.tempC ?? 12) - (100 - (sampleRow?.rh ?? 70)) / 12,
        windDir: sampleRow?.windDir ?? data.windDir,
        windSpeedKmh: sampleRow?.windSpeedKmh ?? data.windSpeedKmh,
        cloudCover: sampleRow?.cloud ?? 50,
        latitude: data.latitude,
      });
      return {
        time: new Date(start).toISOString(),
        hereMm,
        fetchMm,
        chance: rain.chance,
        arriving: fetchMm >= 0.12 && hereMm < 0.15,
      };
    });

    const value: RadarNowcast = {
      hours,
      samples: series.map((s) => ({
        km: s.km,
        latitude: s.latitude,
        longitude: s.longitude,
        precipMm: s.rows.reduce((a, r) =>
          new Date(r.time).getTime() <= Date.now() + 5 * 60 * 1000 ? r : a,
        )?.precipMm ?? 0,
      })),
      arrival,
    };
    nowcastCache.set(key, { at: Date.now(), value });
    return value;
  });

function num(v: number | null | undefined, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
