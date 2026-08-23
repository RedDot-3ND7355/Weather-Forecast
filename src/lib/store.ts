import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Place, Units } from "@/lib/weather/types";

type WeatherStore = {
  place: Place | null;
  units: Units;
  recent: Place[];
  setPlace: (place: Place) => void;
  setUnits: (units: Units) => void;
  clearPlace: () => void;
};

function samePlace(a: Place, b: Place): boolean {
  return (
    Math.abs(a.latitude - b.latitude) < 0.0008 &&
    Math.abs(a.longitude - b.longitude) < 0.0008
  );
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set) => ({
      place: null,
      units: "metric",
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
      clearPlace: () => set({ place: null }),
    }),
    { name: "vane-weather" },
  ),
);
