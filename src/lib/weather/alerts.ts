import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const UA = "Vane/1.0 (wind-aware weather forecast)";

export type WeatherAlert = {
  id: string;
  type: "warning" | "watch" | "advisory" | "statement";
  name: string;
  area: string;
  text: string;
  expires: string | null;
};

const cache = new Map<string, { at: number; value: WeatherAlert[] }>();

function rank(type: WeatherAlert["type"]): number {
  if (type === "warning") return 0;
  if (type === "watch") return 1;
  if (type === "advisory") return 2;
  return 3;
}

function parseType(raw: string): WeatherAlert["type"] {
  const s = raw.toLowerCase();
  if (s.includes("warn")) return "warning";
  if (s.includes("watch")) return "watch";
  if (s.includes("advis")) return "advisory";
  return "statement";
}

type AlertProps = {
  feature_id?: string;
  alert_code?: string;
  alert_type?: string;
  alert_name_en?: string;
  alert_name_fr?: string;
  alert_text_en?: string;
  alert_text_fr?: string;
  feature_name_en?: string;
  feature_name_fr?: string;
  status_en?: string;
  expiration_datetime?: string;
};

export const fetchAlerts = createServerFn({ method: "GET" })
  .validator(
    z.object({
      latitude: z.number(),
      longitude: z.number(),
      language: z.enum(["en", "fr"]).optional(),
    }),
  )
  .handler(async ({ data }): Promise<WeatherAlert[]> => {
    const lang = data.language === "fr" ? "fr" : "en";
    const key = `${data.latitude.toFixed(2)},${data.longitude.toFixed(2)},${lang}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < 3 * 60 * 1000) return hit.value;

    const pad = 0.55;
    const bbox = [
      data.longitude - pad,
      data.latitude - pad,
      data.longitude + pad,
      data.latitude + pad,
    ].join(",");
    const url =
      `https://api.weather.gc.ca/collections/weather-alerts/items?f=json&limit=12&bbox=${bbox}`;
    try {
      const res = await fetch(url, {
        headers: { accept: "application/geo+json", "user-agent": UA },
      });
      if (!res.ok) {
        cache.set(key, { at: Date.now(), value: [] });
        return [];
      }
      const json = (await res.json()) as { features?: { properties?: AlertProps }[] };
      const now = Date.now();
      const value = (json.features ?? [])
        .map((f) => f.properties ?? {})
        .filter((p) => {
          const status = (p.status_en ?? "").toLowerCase();
          if (status === "ended" || status === "cancelled") return false;
          if (p.expiration_datetime && Date.parse(p.expiration_datetime) < now) return false;
          return Boolean(p.alert_name_en || p.alert_name_fr);
        })
        .map((p) => ({
          id: `${p.feature_id ?? ""}-${p.alert_code ?? ""}-${p.expiration_datetime ?? ""}`,
          type: parseType(p.alert_type ?? ""),
          name: (lang === "fr" ? p.alert_name_fr : p.alert_name_en) || p.alert_name_en || "",
          area:
            (lang === "fr" ? p.feature_name_fr : p.feature_name_en) ||
            p.feature_name_en ||
            "",
          text: ((lang === "fr" ? p.alert_text_fr : p.alert_text_en) || p.alert_text_en || "")
            .replace(/\s+/g, " ")
            .trim(),
          expires: p.expiration_datetime ?? null,
        }))
        .sort((a, b) => rank(a.type) - rank(b.type))
        .slice(0, 3);
      cache.set(key, { at: Date.now(), value });
      return value;
    } catch {
      cache.set(key, { at: Date.now(), value: [] });
      return [];
    }
  });
