import { Droplets, Eye, Gauge, Thermometer, Wind } from "lucide-react";
import { weatherIcon, weatherLabel } from "@/lib/weather/codes";
import {
  formatLongDate,
  formatPrecip,
  formatSpeed,
  formatTemp,
  placeLabel,
  tempUnit,
} from "@/lib/weather/format";
import type { Forecast, Units } from "@/lib/weather/types";

export function CurrentPanel({
  forecast,
  units,
}: {
  forecast: Forecast;
  units: Units;
}) {
  const { current, place } = forecast;
  const Icon = weatherIcon(current.weatherCode, current.isDay);
  const stats = [
    {
      icon: Thermometer,
      label: "Feels like",
      value: formatTemp(current.apparentC, units),
    },
    {
      icon: Droplets,
      label: "Humidity",
      value: `${Math.round(current.humidity)}%`,
    },
    {
      icon: Eye,
      label: "Dewpoint",
      value: formatTemp(current.dewpointC, units),
    },
    {
      icon: Gauge,
      label: "Pressure",
      value: `${Math.round(current.pressureHpa)} hPa`,
    },
    {
      icon: Wind,
      label: "Gusts",
      value: formatSpeed(current.windGustKmh, units),
    },
    {
      icon: Droplets,
      label: "Precip now",
      value: formatPrecip(current.precipitationMm, units),
    },
  ];

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
        {placeLabel(place)}
      </p>
      <p className="mt-1 text-sm text-muted">{formatLongDate(current.time)}</p>
      <div className="mt-4 flex items-end gap-4">
        <p className="font-display text-6xl leading-none font-medium tracking-tight tabular-nums text-fg sm:text-7xl">
          {formatTemp(current.temperatureC, units)}
          <span className="ml-1 align-top font-sans text-lg font-medium text-muted">
            {tempUnit(units)}
          </span>
        </p>
        <div className="mb-1 flex items-center gap-2 text-muted">
          <Icon className="size-6" />
          <span className="text-sm">{weatherLabel(current.weatherCode)}</span>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-raised px-3 py-3">
            <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-faint">
              <s.icon className="size-3.5" />
              {s.label}
            </dt>
            <dd className="mt-1 text-sm font-medium tabular-nums text-fg">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
