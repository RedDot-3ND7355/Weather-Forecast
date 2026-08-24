import { weatherIcon, weatherLabel } from "@/lib/weather/codes";
import { formatPrecip, formatTemp, formatWeekday } from "@/lib/weather/format";
import { compassPoint } from "@/lib/weather/compass";
import { useT } from "@/lib/i18n";
import type { DayPoint, Units } from "@/lib/weather/types";
import { WindArrow } from "@/components/wind-arrow";
import { cn } from "@/lib/utils";

export function DailyList({ days, units }: { days: DayPoint[]; units: Units }) {
  const { locale, t } = useT();
  return (
    <section className="min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
        {t("sevenDay")}
      </h2>
      <ul className="divide-y divide-border">
        {days.map((d, i) => {
          const Icon = weatherIcon(d.weatherCode, true);
          const wet = d.rain.chance >= 40;
          return (
            <li
              key={d.date}
              className="grid grid-cols-[minmax(0,4.25rem)_minmax(0,1fr)_auto] items-center gap-2 py-2.5 sm:grid-cols-[5rem_1.6rem_1fr_auto_auto] sm:gap-3 sm:py-3"
            >
              <p className="truncate text-sm font-medium text-fg">
                {i === 0 ? t("today") : formatWeekday(d.date, locale)}
              </p>
              <Icon className="hidden size-4 text-muted sm:block" />
              <div className="min-w-0">
                <p className="truncate text-sm text-muted">{weatherLabel(d.weatherCode, locale)}</p>
                <p className="mt-0.5 hidden text-xs text-faint sm:block">
                  {t("peakRain", { chance: d.rain.chance, dir: compassPoint(d.windDir) })}
                </p>
              </div>
              <div className="hidden items-center gap-1.5 text-xs tabular-nums text-muted sm:flex">
                <WindArrow deg={d.windDir} wet={wet} />
                <span className={wet ? "text-rain" : ""}>{d.rain.chance}%</span>
                <span className="text-faint">{formatPrecip(d.precipMm, units)}</span>
              </div>
              <div className="text-right">
                <p className="text-sm tabular-nums text-fg">
                  <span className="font-medium">{formatTemp(d.tempMaxC, units)}</span>
                  <span className="ml-1.5 text-muted sm:ml-2">
                    {formatTemp(d.tempMinC, units)}
                  </span>
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-xs tabular-nums sm:hidden",
                    wet ? "text-rain" : "text-muted",
                  )}
                >
                  {d.rain.chance}% · {formatPrecip(d.precipMm, units)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
