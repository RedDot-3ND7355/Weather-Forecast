import { t, type Locale } from "@/lib/i18n";
import { angleDelta, windAdverb, windLong } from "./compass";
import type { HourPoint, RainDriver, RainEstimate } from "./types";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function dewpointFromRh(tempC: number, rh: number): number {
  const safeRh = clamp(rh, 1, 100);
  const a = 17.625;
  const b = 243.04;
  const gamma = Math.log(safeRh / 100) + (a * tempC) / (b + tempC);
  return (b * gamma) / (a - gamma);
}

export function estimateRain(input: {
  modelProb: number;
  rh: number;
  tempC: number;
  dewpointC: number;
  windDir: number;
  windSpeedKmh: number;
  cloudCover: number;
  cape?: number;
  latitude: number;
  locale?: Locale;
}): RainEstimate {
  const locale = input.locale ?? "en";
  const modelChance = clamp(Math.round(input.modelProb), 0, 100);
  const depression = Math.max(0, input.tempC - input.dewpointC);
  const satScore = clamp(1 - (depression - 0.4) / 10, 0, 1);
  const rhScore = clamp((input.rh - 32) / 58, 0, 1);
  const moisture = 0.58 * satScore + 0.42 * rhScore;

  const moistAzimuth = input.latitude >= 0 ? 180 : 0;
  const rad = ((input.windDir - moistAzimuth) * Math.PI) / 180;
  const dirScore = (Math.cos(rad) + 1) / 2;
  const speedFactor = clamp((input.windSpeedKmh - 3) / 32, 0, 1);
  const fetch = dirScore * (0.35 + 0.65 * speedFactor);

  const cloud = clamp(input.cloudCover / 100, 0, 1);
  const capeScore = clamp((input.cape ?? 0) / 1400, 0, 1);

  const physical =
    100 * (0.4 * moisture + 0.26 * fetch + 0.24 * cloud + 0.1 * capeScore);

  const confidence = Math.abs(modelChance - 50) / 50;
  const modelWeight = 0.48 + 0.26 * confidence;
  const chance = Math.round(
    clamp(modelWeight * modelChance + (1 - modelWeight) * physical, 0, 100),
  );

  const adverb = windAdverb(input.windDir, locale);
  const from = windLong(input.windDir, locale);
  const hemisphereFetch =
    input.latitude >= 0 ? t(locale, "sourceSouth") : t(locale, "sourceNorth");

  const drivers: RainDriver[] = [
    {
      id: "model",
      label: t(locale, "driverModel"),
      score: modelChance,
      note: t(locale, "driverModelNote", { n: modelChance }),
    },
    {
      id: "moisture",
      label: t(locale, "driverMoisture"),
      score: Math.round(moisture * 100),
      note:
        depression < 2.2
          ? t(locale, "driverMoistureWet", { n: depression.toFixed(1) })
          : t(locale, "driverMoistureDry", { n: depression.toFixed(1) }),
    },
    {
      id: "fetch",
      label: t(locale, "driverFetch"),
      score: Math.round(fetch * 100),
      note: t(locale, "driverFetchNote", { adverb, source: hemisphereFetch }),
    },
    {
      id: "cloud",
      label: t(locale, "driverCloud"),
      score: Math.round(cloud * 100),
      note: t(locale, "driverCloudNote", { n: Math.round(input.cloudCover) }),
    },
  ];

  if ((input.cape ?? 0) > 80) {
    drivers.push({
      id: "cape",
      label: t(locale, "driverCape"),
      score: Math.round(capeScore * 100),
      note: t(locale, "driverCapeNote", { n: Math.round(input.cape ?? 0) }),
    });
  }

  const headline = buildHeadline({
    chance,
    modelChance,
    adverb,
    fetch,
    moisture,
    windSpeedKmh: input.windSpeedKmh,
    depression,
    locale,
  });

  return {
    chance,
    modelChance,
    headline,
    fetchLabel: locale === "fr" ? adverb : capitalize(adverb),
    arrival: from,
    drivers,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildHeadline(args: {
  chance: number;
  modelChance: number;
  adverb: string;
  fetch: number;
  moisture: number;
  windSpeedKmh: number;
  depression: number;
  locale: Locale;
}): string {
  const { chance, adverb, fetch, moisture, windSpeedKmh, depression, locale } = args;
  const still = windSpeedKmh < 8;
  const spread = depression.toFixed(1);
  const sat = Math.round(moisture * 100);

  if (chance >= 70 && fetch > 0.55) {
    return t(locale, "headWetFetch", { adverb });
  }
  if (chance >= 70 && still) {
    return t(locale, "headWetStill");
  }
  if (chance >= 55) {
    return t(locale, "headLikely", { adverb: locale === "fr" ? adverb : capitalize(adverb), spread });
  }
  if (chance >= 35 && fetch > 0.5) {
    return t(locale, "headLoading", { adverb: locale === "fr" ? adverb : capitalize(adverb) });
  }
  if (chance >= 35 && still) {
    return t(locale, "headLocal");
  }
  if (chance < 20 && fetch < 0.35 && moisture < 0.45) {
    return t(locale, "headDraining", { adverb: locale === "fr" ? adverb : capitalize(adverb) });
  }
  if (chance < 25 && args.modelChance < 20) {
    return t(locale, "headDry", { adverb });
  }
  return t(locale, "headWatch", { adverb: locale === "fr" ? adverb : capitalize(adverb), sat });
}

export function detectWindShift(
  hours: HourPoint[],
): { from: number; to: number; hours: number } | null {
  if (hours.length < 4) return null;
  const start = hours[0].windDir;
  for (let i = 2; i < Math.min(hours.length, 8); i += 1) {
    const delta = angleDelta(start, hours[i].windDir);
    const rainUp = hours[i].rain.chance - hours[0].rain.chance;
    if (delta >= 55 && rainUp >= 8) {
      return { from: start, to: hours[i].windDir, hours: i };
    }
  }
  return null;
}

export function nextRainWindow(hours: HourPoint[]): HourPoint | null {
  return hours.find((h) => h.rain.chance >= 40 || h.precipMm >= 0.2) ?? null;
}
