import { WindArrow } from "@/components/wind-arrow";
import { formatHour, formatTemp } from "@/lib/weather/format";
import type { HourPoint, Units } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

export function HourlyStrip({
  hours,
  units,
}: {
  hours: HourPoint[];
  units: Units;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
          Next 24 hours
        </h2>
        <p className="hidden text-xs text-muted sm:block">Arrow points into the wind</p>
      </div>
      <div className="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2">
        {hours.map((h, i) => {
          const wet = h.rain.chance >= 40;
          return (
            <div
              key={h.time}
              className={cn(
                "flex w-14 shrink-0 flex-col items-center gap-1.5 rounded-xl px-1 py-2 sm:w-[4.4rem] sm:px-1.5 sm:py-2.5",
                i === 0 ? "bg-raised" : "",
              )}
            >
              <p className="text-[11px] font-medium text-muted">
                {i === 0 ? "Now" : formatHour(h.time)}
              </p>
              <WindArrow deg={h.windDir} wet={wet} className="size-5" />
              <p
                className={cn(
                  "text-sm font-medium tabular-nums",
                  wet ? "text-rain" : "text-fg",
                )}
              >
                {h.rain.chance}%
              </p>
              <div className="h-10 w-1.5 overflow-hidden rounded-full bg-raised">
                <div
                  className={cn("w-full rounded-full", wet ? "bg-rain" : "bg-accent/70")}
                  style={{
                    height: `${Math.max(8, h.rain.chance)}%`,
                    marginTop: `${100 - Math.max(8, h.rain.chance)}%`,
                  }}
                />
              </div>
              <p className="text-xs tabular-nums text-muted">
                {formatTemp(h.temperatureC, units)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
