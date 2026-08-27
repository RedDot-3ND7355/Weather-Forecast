import { precipKind } from "./codes";
import type { RadarNowcast } from "./radar";
import type { Forecast, HourPoint } from "./types";

export type IncomingPrecip = {
  kind: "rain" | "snow";
  minutes: number;
  /** Display chance — always derived from forecast model/Vane blend, never invented. */
  chance: number;
  fromDir: number;
  source: "radar" | "hourly" | "now";
};

/** Banner only cares about the next ~hour. */
const HOUR_MIN = 75;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Best Vane + model chance near a target time (ms). */
function chanceNearTime(forecast: Forecast, targetMs: number): number {
  let best = Math.max(
    forecast.current.rain.chance,
    forecast.current.rain.modelChance ?? 0,
  );
  for (const h of forecast.hourly.slice(0, 12)) {
    const t = new Date(h.time).getTime();
    if (Math.abs(t - targetMs) > 2.5 * 60 * 60 * 1000) continue;
    best = Math.max(best, h.rain.chance, h.modelChance ?? 0);
  }
  return clamp(Math.round(best), 0, 100);
}

function chanceForHour(h: HourPoint | null | undefined, fallback: number): number {
  if (!h) return fallback;
  return clamp(Math.round(Math.max(h.rain.chance, h.modelChance ?? 0, fallback)), 0, 100);
}

/**
 * Single “what’s coming” signal for the banner.
 *
 * Priority:
 * 1. Measurable precip at the station right now
 * 2. Radar nowcast arrival (timing from radar; % from forecast, not a fake formula)
 * 3. First nowcast hour marked arriving / wet at the point
 * 4. Next hourly window that already looks wet in the forecast
 */
export function incomingPrecip(
  forecast: Forecast,
  nowcast: RadarNowcast | null | undefined,
): IncomingPrecip | null {
  const next = forecast.nextRain;
  const code = next?.weatherCode ?? forecast.current.weatherCode;
  const kind = precipKind(code);
  const rainingNow = forecast.current.precipitationMm >= 0.08;

  if (rainingNow) {
    const observedFloor = forecast.current.precipitationMm >= 0.5 ? 65 : 45;
    const chance = Math.max(
      forecast.current.rain.chance,
      forecast.current.rain.modelChance ?? 0,
      observedFloor,
    );
    return {
      kind: precipKind(forecast.current.weatherCode),
      minutes: 0,
      chance: clamp(chance, 0, 100),
      fromDir: forecast.current.windDir,
      source: "now",
    };
  }

  const radar = nowcast?.arrival;
  if (radar && radar.minutes >= 0 && radar.minutes <= HOUR_MIN && radar.precipMm >= 0.08) {
    const etaMs = Date.now() + radar.minutes * 60_000;
    let chance = chanceNearTime(forecast, etaMs);
    if (chance < 40 && radar.precipMm >= 0.25) chance = Math.max(chance, 40);
    if (chance < 55 && radar.precipMm >= 0.6) chance = Math.max(chance, 55);
    return {
      kind,
      minutes: radar.minutes,
      chance: clamp(chance, 0, 100),
      fromDir: forecast.current.windDir,
      source: "radar",
    };
  }

  const hour0 = nowcast?.hours?.[0];
  if (hour0 && (hour0.arriving || hour0.hereMm >= 0.08 || hour0.fetchMm >= 0.12 || hour0.chance >= 40)) {
    return {
      kind,
      minutes: hour0.hereMm >= 0.08 ? 0 : 25,
      chance: clamp(Math.max(hour0.chance, chanceNearTime(forecast, Date.now())), 0, 100),
      fromDir: forecast.current.windDir,
      source: "radar",
    };
  }

  if (!next) return null;
  const mins = Math.round((new Date(next.time).getTime() - Date.now()) / 60_000);
  if (mins > HOUR_MIN || mins < -5) return null;
  if (next.rain.chance < 40 && next.precipMm < 0.2) return null;

  return {
    kind: precipKind(next.weatherCode),
    minutes: Math.max(0, mins),
    chance: chanceForHour(next, forecast.current.rain.chance),
    fromDir: next.windDir,
    source: "hourly",
  };
}
