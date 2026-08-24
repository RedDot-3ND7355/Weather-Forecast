import { localeTag, t, type Locale } from "@/lib/i18n";
import type { Units } from "./types";

export function formatTemp(c: number, units: Units): string {
  const v = units === "imperial" ? c * (9 / 5) + 32 : c;
  return `${Math.round(v)}°`;
}

export function formatTempValue(c: number, units: Units): number {
  return Math.round(units === "imperial" ? c * (9 / 5) + 32 : c);
}

export function tempUnit(units: Units): string {
  return units === "imperial" ? "F" : "C";
}

export function formatSpeed(kmh: number, units: Units): string {
  const v = units === "imperial" ? kmh * 0.621371 : kmh;
  const unit = units === "imperial" ? "mph" : "km/h";
  return `${Math.round(v)} ${unit}`;
}

export function formatPrecip(mm: number, units: Units): string {
  if (mm < 0.05) return units === "imperial" ? "0 in" : "0 mm";
  if (units === "imperial") {
    const inches = mm / 25.4;
    return `${inches < 0.1 ? inches.toFixed(2) : inches.toFixed(1)} in`;
  }
  return `${mm < 1 ? mm.toFixed(1) : Math.round(mm)} mm`;
}

export function formatHour(iso: string, locale: Locale = "en"): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(localeTag(locale), { hour: "numeric" }).format(d);
}

export function formatWeekday(iso: string, locale: Locale = "en"): string {
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  return new Intl.DateTimeFormat(localeTag(locale), { weekday: "short" }).format(d);
}

export function formatLongDate(iso: string, locale: Locale = "en"): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(localeTag(locale), {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatClock(iso: string, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function placeLabel(place: {
  name: string;
  admin?: string | null;
  country?: string | null;
}): string {
  const bits = [place.name];
  if (place.admin && place.admin !== place.name) bits.push(place.admin);
  if (place.country) bits.push(place.country);
  return bits.join(", ");
}

export function formatUpdated(ts: number, locale: Locale): string {
  const min = Math.max(0, Math.round((Date.now() - ts) / 60_000));
  if (min < 1) return t(locale, "updatedJust");
  if (min === 1) return t(locale, "updatedMin");
  return t(locale, "updatedMins", { n: min });
}
