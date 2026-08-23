import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatHour } from "@/lib/weather/format";
import type { HourPoint } from "@/lib/weather/types";

export function ChanceChart({ hours }: { hours: HourPoint[] }) {
  const data = hours.map((h, i) => ({
    label: i === 0 ? "Now" : formatHour(h.time),
    vane: h.rain.chance,
    model: h.modelChance,
  }));

  return (
    <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
          Rain chance
        </h2>
        <p className="text-xs text-muted">
          <span className="mr-3 inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rain" /> Vane
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-accent/50" /> Model
          </span>
        </p>
      </div>
      <div className="h-44 w-full sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="vaneFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-rain)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-rain)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--color-border)"
              vertical={false}
              strokeDasharray="3 6"
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--color-faint)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "var(--color-faint)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-raised)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                color: "var(--color-fg)",
                fontSize: 12,
              }}
              formatter={(value, name) => [
                `${value as number}%`,
                name === "vane" ? "Vane" : "Model",
              ]}
            />
            <Area
              type="monotone"
              dataKey="model"
              stroke="var(--color-accent)"
              strokeOpacity={0.55}
              fill="none"
              strokeWidth={1.5}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="vane"
              stroke="var(--color-rain)"
              fill="url(#vaneFill)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
