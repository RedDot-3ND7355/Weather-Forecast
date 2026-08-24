import { createFileRoute } from "@tanstack/react-router";
import { ForecastApp } from "@/components/forecast-app";

export type PlaceSearch = {
  q?: string;
  lat?: number;
  lon?: number;
  n?: string;
};

function num(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : undefined;
}

export const Route = createFileRoute("/")({
  validateSearch: (raw: Record<string, unknown>): PlaceSearch => ({
    q: typeof raw.q === "string" && raw.q.trim() ? raw.q.trim().slice(0, 80) : undefined,
    lat: num(raw.lat),
    lon: num(raw.lon),
    n: typeof raw.n === "string" && raw.n.trim() ? raw.n.trim().slice(0, 80) : undefined,
  }),
  component: Home,
});

function Home() {
  return <ForecastApp />;
}
