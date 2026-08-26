import type { IncomingPrecip } from "@/lib/weather/incoming";
import type { Forecast } from "@/lib/weather/types";
import { loadNotifyPrefs, notifyLocal, permissionState } from "./client";

function etaLabel(minutes: number, locale: "en" | "fr"): string {
  if (minutes <= 0) return locale === "fr" ? "maintenant" : "now";
  if (minutes < 60) return locale === "fr" ? `~${minutes} min` : `~${minutes} min`;
  const h = Math.round(minutes / 60);
  return locale === "fr" ? `~${h} h` : `~${h} h`;
}

/**
 * Fire local OS notifications while the app is open.
 * Safe to call on every forecast/nowcast refresh; deduped inside notifyLocal.
 */
export async function watchLocalAlerts(args: {
  forecast: Forecast;
  incoming: IncomingPrecip | null;
  locale: "en" | "fr";
}): Promise<void> {
  if (permissionState() !== "granted") return;
  const prefs = loadNotifyPrefs();
  if (!prefs.localEnabled) return;

  const { forecast, incoming, locale } = args;
  const place = forecast.place.name;

  if (prefs.rain && incoming) {
    if (incoming.source === "now" || incoming.minutes <= 60) {
      const kind = incoming.kind === "snow" ? (locale === "fr" ? "Neige" : "Snow") : locale === "fr" ? "Pluie" : "Rain";
      const title =
        incoming.minutes <= 0
          ? locale === "fr"
            ? `${kind} ici — ${place}`
            : `${kind} here — ${place}`
          : locale === "fr"
            ? `${kind} dans ${etaLabel(incoming.minutes, locale)} — ${place}`
            : `${kind} in ${etaLabel(incoming.minutes, locale)} — ${place}`;
      const body =
        locale === "fr"
          ? `Probabilité ~${incoming.chance}%. Ouvrez Vane pour le radar.`
          : `About ${incoming.chance}% chance. Open Vane for the radar.`;
      await notifyLocal({
        title,
        body,
        tag: `rain-${incoming.source}-${Math.round(incoming.minutes / 15)}`,
      });
    }
  }

  if (prefs.uv) {
    const uv = forecast.current.uvIndex;
    const uvMax = forecast.daily[0]?.uvMax ?? 0;
    const peak = Math.max(uv, uvMax);
    if (peak >= 6) {
      const title =
        locale === "fr"
          ? `UV ${Math.round(peak)} — ${place}`
          : `UV ${Math.round(peak)} — ${place}`;
      const body =
        peak >= 8
          ? locale === "fr"
            ? "UV très élevé : FPS 30+, couvrez-vous, limitez le midi."
            : "Very high UV: SPF 30+, cover up, limit midday sun."
          : locale === "fr"
            ? "UV élevé : FPS 30+, chapeau, ombre à midi."
            : "High UV: SPF 30+, hat, and shade around midday.";
      await notifyLocal({
        title,
        body,
        tag: `uv-${forecast.daily[0]?.date ?? "today"}-${Math.floor(peak)}`,
      });
    }
  }
}
