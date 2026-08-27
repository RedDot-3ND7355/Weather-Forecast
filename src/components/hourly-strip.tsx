import { HScroll } from "@/components/h-scroll";
import { WeatherBackdrop } from "@/components/weather-scene";
import { WindArrow } from "@/components/wind-arrow";
import { useT } from "@/lib/i18n";
import { formatHour, formatPrecip, formatTemp } from "@/lib/weather/format";
import type { HourPoint, Units } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

export function HourlyStrip({
  hours,
  units,
}: {
  hours: HourPoint[];
  units: Units;
}) {
  const { locale, t } = useT();
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
          {t("next24")}
        </h2>
        <p className="text-xs text-muted">{t("swipeOrDrag")}</p>
      </div>
      <HScroll label={t("next24")}>
        {hours.map((h, i) => {
          const wet = h.rain.chance >= 40 || h.precipMm >= 0.2;
          return (
            <div
              key={h.time}
              className={cn(
                "relative flex w-14 shrink-0 flex-col items-center gap-1 overflow-hidden rounded-xl px-1 py-2 sm:w-[4.4rem] sm:px-1.5 sm:py-2.5",
                i === 0 ? "bg-raised/55 ring-1 ring-inset ring-accent/30" : "",
              )}
            >
              <WeatherBackdrop
                code={h.weatherCode}
                isDay={h.isDay}
                windKmh={h.windSpeedKmh}
                density="compact"
                className="rounded-xl opacity-90"
              />
              <div className="relative z-[1] flex w-full flex-col items-center gap-1">
                <p className="text-[11px] font-medium text-muted [text-shadow:0_1px_6px_#0b1014]">
                  {i === 0 ? t("now") : formatHour(h.time, locale)}
                </p>
                <WindArrow deg={h.windDir} wet={wet} className="size-5 drop-shadow" />
                <p
                  className={cn(
                    "text-sm font-medium tabular-nums [text-shadow:0_1px_6px_#0b1014]",
                    wet ? "text-rain" : "text-fg",
                  )}
                >
                  {h.rain.chance}%
                </p>
                <div className="h-9 w-1.5 overflow-hidden rounded-full bg-bg/40">
                  <div
                    className={cn("w-full rounded-full", wet ? "bg-rain" : "bg-accent/70")}
                    style={{
                      height: `${Math.max(8, h.rain.chance)}%`,
                      marginTop: `${100 - Math.max(8, h.rain.chance)}%`,
                    }}
                  />
                </div>
                <p
                  className={cn(
                    "text-[10px] tabular-nums [text-shadow:0_1px_6px_#0b1014]",
                    h.precipMm >= 0.2 ? "text-rain" : "text-faint",
                  )}
                >
                  {formatPrecip(h.precipMm, units)}
                </p>
                <p className="text-xs tabular-nums text-muted [text-shadow:0_1px_6px_#0b1014]">
                  {formatTemp(h.temperatureC, units)}
                </p>
              </div>
            </div>
          );
        })}
      </HScroll>
    </section>
  );
}
