import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Place, Units } from "@/lib/weather/types";

export type Locale = "en" | "fr";

type WeatherStore = {
  place: Place | null;
  units: Units;
  locale: Locale;
  hasLocale: boolean;
  recent: Place[];
  setPlace: (place: Place) => void;
  setUnits: (units: Units) => void;
  setLocale: (locale: Locale) => void;
  clearPlace: () => void;
};

function samePlace(a: Place, b: Place): boolean {
  return (
    Math.abs(a.latitude - b.latitude) < 0.0008 &&
    Math.abs(a.longitude - b.longitude) < 0.0008
  );
}

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();
  return lang.startsWith("fr") ? "fr" : "en";
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set) => ({
      place: null,
      units: "metric",
      locale: "en",
      hasLocale: false,
      recent: [],
      setPlace: (place) =>
        set((state) => ({
          place,
          recent: [
            place,
            ...state.recent.filter((p) => !samePlace(p, place)),
          ].slice(0, 8),
        })),
      setUnits: (units) => set({ units }),
      setLocale: (locale) => {
        if (typeof document !== "undefined") document.documentElement.lang = locale;
        set({ locale, hasLocale: true });
      },
      clearPlace: () => set({ place: null }),
    }),
    {
      name: "vane-weather",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.hasLocale) state.locale = detectLocale();
        if (typeof document !== "undefined") {
          document.documentElement.lang = state.locale;
        }
      },
    },
  ),
);
