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

const ADVERB: Record<CompassPoint, string> = {
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

const LONG: Record<CompassPoint, string> = {
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

export function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function compassPoint(deg: number): CompassPoint {
  const i = Math.round(normalizeDeg(deg) / 22.5) % 16;
  return POINTS[i];
}

export function windAdverb(deg: number): string {
  return ADVERB[compassPoint(deg)];
}

export function windLong(deg: number): string {
  return LONG[compassPoint(deg)];
}

export function angleDelta(a: number, b: number): number {
  const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
  return Math.min(d, 360 - d);
}
