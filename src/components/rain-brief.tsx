import { useMemo } from "react";
import { CloudRain, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n";
import { precipWordCap } from "@/lib/weather/codes";
import { fromThe } from "@/lib/weather/compass";
import { formatClock } from "@/lib/weather/format";
import { estimateRain } from "@/lib/weather/rain";
import type { Forecast } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

export function RainBrief({ forecast }: { forecast: Forecast }) {
  const { locale, t } = useT();
  const { current, nextRain, windShift, place } = forecast;
  const rain = useMemo(
    () =>
      estimateRain({
        modelProb: current.rain.modelChance,
        rh: current.humidity,
        tempC: current.temperatureC,
        dewpointC: current.dewpointC,
        windDir: current.windDir,
        windSpeedKmh: current.windSpeedKmh,
        cloudCover: current.cloudCover,
        latitude: place.latitude,
        locale,
        weatherCode: current.weatherCode,
      }),
    [current, place.latitude, locale],
  );
  const tone =
    rain.chance >= 60 ? "wet" : rain.chance >= 30 ? "maybe" : "dry";
  const from = fromThe(current.windDir, locale);

  return (
    <section className="min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
            {t("estimate")}
          </p>
          <h2 className="mt-1 font-display text-xl font-medium leading-tight text-fg sm:text-2xl">
            {t("rainFrom", { from, kind: precipWordCap(current.weatherCode, locale) })}
          </h2>
        </div>
        <Badge
          className="shrink-0"
          variant={tone === "wet" ? "rain" : tone === "maybe" ? "warn" : "default"}
        >
          {tone === "wet" ? t("likely") : tone === "maybe" ? t("watch") : t("quiet")}
        </Badge>
      </div>

      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
        {rain.headline}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {nextRain ? (
          <div className="flex items-start gap-2 rounded-xl bg-raised px-3 py-3">
            <CloudRain className="mt-0.5 size-4 text-rain" />
            <div>
              <p className="text-sm font-medium text-fg">{t("nextWet")}</p>
              <p className="text-sm text-muted">
                {formatClock(nextRain.time, locale)} · {nextRain.rain.chance}% {fromThe(nextRain.windDir, locale)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-xl bg-raised px-3 py-3">
            <CloudRain className="mt-0.5 size-4 text-muted" />
            <div>
              <p className="text-sm font-medium text-fg">{t("next24short")}</p>
              <p className="text-sm text-muted">{t("nextWetNone")}</p>
            </div>
          </div>
        )}
        {windShift ? (
          <div className="flex items-start gap-2 rounded-xl bg-raised px-3 py-3">
            <Info className="mt-0.5 size-4 text-accent" />
            <div>
              <p className="text-sm font-medium text-fg">{t("windShift")}</p>
              <p className="text-sm text-muted">
                {t("windShiftCopy", {
                  from: fromThe(windShift.from, locale),
                  to: fromThe(windShift.to, locale),
                  hours: windShift.hours,
                })}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-xl bg-raised px-3 py-3">
            <Info className="mt-0.5 size-4 text-accent" />
            <div>
              <p className="text-sm font-medium text-fg">{t("steadyFetch")}</p>
              <p className="text-sm text-muted">{t("steadyCopy", { from })}</p>
            </div>
          </div>
        )}
      </div>

      <ul className="mt-5 space-y-2.5">
        {rain.drivers.map((d) => (
          <li key={d.id}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-faint">
                {d.label}
              </span>
              <span className="text-xs tabular-nums text-muted">{d.score}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-raised">
              <div
                className={cn(
                  "h-full rounded-full",
                  d.id === "fetch" || d.id === "model" ? "bg-rain" : "bg-accent",
                )}
                style={{ width: `${d.score}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted">{d.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
