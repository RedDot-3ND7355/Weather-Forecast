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

const UA = "Vane/1.0 (wind-aware weather forecast)";

export type RadarFrame = {
  time: number;
  tileUrl: string;
};

export function pickHalfHourFrames(
  frames: RadarFrame[],
  spanSec = 5 * 3600,
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
      tileUrl: `${host}${f.path}/256/{z}/{x}/{y}/6/1_1.png`,
    }));
    const value = { host, frames };
    catalogCache.at = Date.now();
    catalogCache.value = value;
    return value;
  },
);

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
