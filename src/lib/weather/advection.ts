import { windAdverb, windLong } from "./compass";

const EARTH_KM = 6371;
export const FETCH_KM = [0, 25, 50, 90, 140, 200] as const;

export function offsetKm(
  lat: number,
  lon: number,
  bearingDeg: number,
  km: number,
): { latitude: number; longitude: number } {
  if (km === 0) return { latitude: lat, longitude: lon };
  const r = km / EARTH_KM;
  const b = (bearingDeg * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lon * Math.PI) / 180;
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(r) + Math.cos(φ1) * Math.sin(r) * Math.cos(b),
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(b) * Math.sin(r) * Math.cos(φ1),
      Math.cos(r) - Math.sin(φ1) * Math.sin(φ2),
    );
  return {
    latitude: (φ2 * 180) / Math.PI,
    longitude: ((((λ2 * 180) / Math.PI + 540) % 360) - 180),
  };
}

export function travelHours(km: number, speedKmh: number): number {
  return km / Math.max(speedKmh, 8);
}

export function formatEta(minutes: number): string {
  if (minutes <= 8) return "arriving now";
  if (minutes < 60) return `~${Math.round(minutes / 5) * 5} min`;
  const h = minutes / 60;
  if (h < 1.6) return "~1 hour";
  return `~${h < 10 ? h.toFixed(1) : Math.round(h)} hours`;
}

export function arrivalCopy(args: {
  minutes: number;
  km: number;
  windDir: number;
  windSpeedKmh: number;
  rainingHere: boolean;
}): string {
  const from = windLong(args.windDir);
  const adverb = windAdverb(args.windDir);
  if (args.rainingHere) {
    return `Rain is already overhead. ${capitalize(adverb)} flow will keep feeding it from the ${from}.`;
  }
  if (args.minutes > 12 * 60) {
    return `No wet cells on the ${adverb} fetch within 200 km. The next hours stay dry unless a new band forms.`;
  }
  return `A cell ${Math.round(args.km)} km upwind is riding ${Math.round(args.windSpeedKmh)} km/h ${adverb} air from the ${from}. ${capitalize(formatEta(args.minutes))} if the fetch holds.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
