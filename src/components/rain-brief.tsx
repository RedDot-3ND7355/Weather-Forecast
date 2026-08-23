import { CloudRain, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { windLong } from "@/lib/weather/compass";
import { formatClock } from "@/lib/weather/format";
import type { Forecast } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

export function RainBrief({ forecast }: { forecast: Forecast }) {
  const { current, nextRain, windShift } = forecast;
  const rain = current.rain;
  const tone =
    rain.chance >= 60 ? "wet" : rain.chance >= 30 ? "maybe" : "dry";

  return (
    <section className="min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
            Vane estimate
          </p>
          <h2 className="mt-1 font-display text-xl font-medium leading-tight text-fg sm:text-2xl">
            Rain arriving from the {rain.arrival}
          </h2>
        </div>
        <Badge
          className="shrink-0"
          variant={tone === "wet" ? "rain" : tone === "maybe" ? "warn" : "default"}
        >
          {tone === "wet" ? "Likely" : tone === "maybe" ? "Watch" : "Quiet"}
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
              <p className="text-sm font-medium text-fg">Next wet window</p>
              <p className="text-sm text-muted">
                {formatClock(nextRain.time)} · {nextRain.rain.chance}% from the{" "}
                {nextRain.rain.arrival}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-xl bg-raised px-3 py-3">
            <CloudRain className="mt-0.5 size-4 text-muted" />
            <div>
              <p className="text-sm font-medium text-fg">Next 24 hours</p>
              <p className="text-sm text-muted">No wet window on this fetch.</p>
            </div>
          </div>
        )}
        {windShift ? (
          <div className="flex items-start gap-2 rounded-xl bg-raised px-3 py-3">
            <Info className="mt-0.5 size-4 text-accent" />
            <div>
              <p className="text-sm font-medium text-fg">Wind shift</p>
              <p className="text-sm text-muted">
                Backing from the {windLong(windShift.from)} toward the{" "}
                {windLong(windShift.to)} in about {windShift.hours}h. A front
                may be nearby.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-xl bg-raised px-3 py-3">
            <Info className="mt-0.5 size-4 text-accent" />
            <div>
              <p className="text-sm font-medium text-fg">Steady fetch</p>
              <p className="text-sm text-muted">
                Direction holds. Rain will keep arriving from the {rain.arrival}{" "}
                if it develops.
              </p>
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
