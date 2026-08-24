import { precipKind } from "./codes";
import type { RadarNowcast } from "./radar";
import type { Forecast } from "./types";

export type IncomingPrecip = {
  kind: "rain" | "snow";
  minutes: number;
  chance: number;
  fromDir: number;
  source: "radar" | "hourly" | "now";
};

const HOUR_MIN = 75;

export function incomingPrecip(
  forecast: Forecast,
  nowcast: RadarNowcast | null | undefined,
): IncomingPrecip | null {
  const next = forecast.nextRain;
  const code = next?.weatherCode ?? forecast.current.weatherCode;
  const kind = precipKind(code);
  const rainingNow = forecast.current.precipitationMm >= 0.15;

  if (rainingNow) {
    return {
      kind: precipKind(forecast.current.weatherCode),
      minutes: 0,
      chance: Math.max(forecast.current.rain.chance, 70),
      fromDir: forecast.current.windDir,
      source: "now",
    };
  }

  const radar = nowcast?.arrival;
  if (radar && radar.minutes > 0 && radar.minutes <= HOUR_MIN && radar.precipMm >= 0.12) {
    return {
      kind,
      minutes: radar.minutes,
      chance: Math.min(95, Math.round(50 + radar.precipMm * 40)),
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
    chance: next.rain.chance,
    fromDir: next.windDir,
    source: "hourly",
  };
}
