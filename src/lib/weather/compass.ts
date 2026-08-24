import type { Locale } from "@/lib/i18n";

const POINTS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

export type CompassPoint = (typeof POINTS)[number];

const ADVERB_EN: Record<CompassPoint, string> = {
  N: "northerly",
  NNE: "north-northeasterly",
  NE: "northeasterly",
  ENE: "east-northeasterly",
  E: "easterly",
  ESE: "east-southeasterly",
  SE: "southeasterly",
  SSE: "south-southeasterly",
  S: "southerly",
  SSW: "south-southwesterly",
  SW: "southwesterly",
  WSW: "west-southwesterly",
  W: "westerly",
  WNW: "west-northwesterly",
  NW: "northwesterly",
  NNW: "north-northwesterly",
};

const ADVERB_FR: Record<CompassPoint, string> = {
  N: "du nord",
  NNE: "du nord-nord-est",
  NE: "du nord-est",
  ENE: "de l'est-nord-est",
  E: "de l'est",
  ESE: "de l'est-sud-est",
  SE: "du sud-est",
  SSE: "du sud-sud-est",
  S: "du sud",
  SSW: "du sud-sud-ouest",
  SW: "du sud-ouest",
  WSW: "de l'ouest-sud-ouest",
  W: "de l'ouest",
  WNW: "de l'ouest-nord-ouest",
  NW: "du nord-ouest",
  NNW: "du nord-nord-ouest",
};

const LONG_EN: Record<CompassPoint, string> = {
  N: "north",
  NNE: "north-northeast",
  NE: "northeast",
  ENE: "east-northeast",
  E: "east",
  ESE: "east-southeast",
  SE: "southeast",
  SSE: "south-southeast",
  S: "south",
  SSW: "south-southwest",
  SW: "southwest",
  WSW: "west-southwest",
  W: "west",
  WNW: "west-northwest",
  NW: "northwest",
  NNW: "north-northwest",
};

const LONG_FR: Record<CompassPoint, string> = {
  N: "nord",
  NNE: "nord-nord-est",
  NE: "nord-est",
  ENE: "est-nord-est",
  E: "est",
  ESE: "est-sud-est",
  SE: "sud-est",
  SSE: "sud-sud-est",
  S: "sud",
  SSW: "sud-sud-ouest",
  SW: "sud-ouest",
  WSW: "ouest-sud-ouest",
  W: "ouest",
  WNW: "ouest-nord-ouest",
  NW: "nord-ouest",
  NNW: "nord-nord-ouest",
};

export function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function compassPoint(deg: number): CompassPoint {
  const i = Math.round(normalizeDeg(deg) / 22.5) % 16;
  return POINTS[i];
}

export function windAdverb(deg: number, locale: Locale = "en"): string {
  const p = compassPoint(deg);
  return locale === "fr" ? ADVERB_FR[p] : ADVERB_EN[p];
}

export function windLong(deg: number, locale: Locale = "en"): string {
  const p = compassPoint(deg);
  return locale === "fr" ? LONG_FR[p] : LONG_EN[p];
}

export function fromThe(deg: number, locale: Locale = "en"): string {
  const long = windLong(deg, locale);
  if (locale === "fr") {
    return long === "est" || long === "ouest" ? `de l'${long}` : `du ${long}`;
  }
  return `from the ${long}`;
}

export function angleDelta(a: number, b: number): number {
  const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
  return Math.min(d, 360 - d);
}
