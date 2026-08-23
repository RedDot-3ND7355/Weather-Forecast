import { weatherIcon, weatherLabel } from "@/lib/weather/codes";
import { formatPrecip, formatTemp, formatWeekday } from "@/lib/weather/format";
import { compassPoint } from "@/lib/weather/compass";
import type { DayPoint, Units } from "@/lib/weather/types";
import { WindArrow } from "@/components/wind-arrow";

export function DailyList({ days, units }: { days: DayPoint[]; units: Units }) {
  return (
    <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
        Seven-day outlook
      </h2>
      <ul className="divide-y divide-border">
        {days.map((d, i) => {
          const Icon = weatherIcon(d.weatherCode, true);
          const wet = d.rain.chance >= 40;
          return (
            <li
              key={d.date}
              className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 py-3 sm:grid-cols-[5rem_1.6rem_1fr_auto_auto]"
            >
              <p className="text-sm font-medium text-fg">
                {i === 0 ? "Today" : formatWeekday(d.date)}
              </p>
              <Icon className="hidden size-4 text-muted sm:block" />
              <div className="min-w-0">
                <p className="truncate text-sm text-muted">{weatherLabel(d.weatherCode)}</p>
                <p className="mt-0.5 hidden text-xs text-faint sm:block">
                  Peak rain {d.rain.chance}% · {compassPoint(d.windDir)} fetch
                </p>
              </div>
              <div className="hidden items-center gap-1.5 text-xs tabular-nums text-muted sm:flex">
                <WindArrow deg={d.windDir} wet={wet} />
                <span className={wet ? "text-rain" : ""}>{d.rain.chance}%</span>
                <span className="text-faint">{formatPrecip(d.precipMm, units)}</span>
              </div>
              <p className="text-right text-sm tabular-nums text-fg">
                <span className="font-medium">{formatTemp(d.tempMaxC, units)}</span>
                <span className="ml-2 text-muted">{formatTemp(d.tempMinC, units)}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
