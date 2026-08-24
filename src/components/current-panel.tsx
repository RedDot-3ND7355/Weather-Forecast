import { Droplets, Eye, Gauge, Thermometer, Wind } from "lucide-react";
import { useT } from "@/lib/i18n";
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
  const { locale, t } = useT();
  const { current, place } = forecast;
  const Icon = weatherIcon(current.weatherCode, current.isDay);
  const stats = [
    {
      icon: Thermometer,
      label: t("feelsLike"),
      value: formatTemp(current.apparentC, units),
    },
    {
      icon: Droplets,
      label: t("humidity"),
      value: `${Math.round(current.humidity)}%`,
    },
    {
      icon: Eye,
      label: t("dewpoint"),
      value: formatTemp(current.dewpointC, units),
    },
    {
      icon: Gauge,
      label: t("pressure"),
      value: `${Math.round(current.pressureHpa)} hPa`,
    },
    {
      icon: Wind,
      label: t("gusts"),
      value: formatSpeed(current.windGustKmh, units),
    },
    {
      icon: Droplets,
      label: t("precipNow"),
      value: formatPrecip(current.precipitationMm, units),
    },
  ];

  return (
    <section className="min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
        {placeLabel(place)}
      </p>
      <p className="mt-1 text-sm text-muted">{formatLongDate(current.time, locale)}</p>
      <div className="mt-4 flex flex-wrap items-end gap-3 sm:gap-4">
        <p className="font-display text-5xl leading-none font-medium tracking-tight tabular-nums text-fg sm:text-7xl">
          {formatTemp(current.temperatureC, units)}
          <span className="ml-1 align-top font-sans text-base font-medium text-muted sm:text-lg">
            {tempUnit(units)}
          </span>
        </p>
        <div className="mb-1 flex items-center gap-2 text-muted">
          <Icon className="size-5 sm:size-6" />
          <span className="text-sm">{weatherLabel(current.weatherCode, locale)}</span>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-raised px-2.5 py-2.5 sm:px-3 sm:py-3">
            <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-faint">
              <s.icon className="size-3.5 shrink-0" />
              <span className="truncate">{s.label}</span>
            </dt>
            <dd className="mt-1 text-sm font-medium tabular-nums text-fg">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
