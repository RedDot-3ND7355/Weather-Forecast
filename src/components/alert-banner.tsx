import { TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import type { WeatherAlert } from "@/lib/weather/alerts";
import { cn } from "@/lib/utils";

function typeLabel(type: WeatherAlert["type"], t: (k: "alertWarning" | "alertWatch" | "alertAdvisory" | "alertStatement") => string) {
  if (type === "warning") return t("alertWarning");
  if (type === "watch") return t("alertWatch");
  if (type === "advisory") return t("alertAdvisory");
  return t("alertStatement");
}

export function AlertBanner({ alerts }: { alerts: WeatherAlert[] }) {
  const { t } = useT();
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const visible = alerts.filter((a) => !hidden[a.id]);
  if (!visible.length) return null;

  return (
    <div className="mb-4 grid gap-2">
      {visible.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "flex items-start gap-2 rounded-2xl px-3 py-3 shadow-[var(--shadow-border)] sm:px-4",
            alert.type === "warning"
              ? "bg-danger/15 text-fg"
              : alert.type === "watch"
                ? "bg-warn/15 text-fg"
                : "bg-accent/12 text-fg",
          )}
        >
          <TriangleAlert
            className={cn(
              "mt-0.5 size-4 shrink-0",
              alert.type === "warning" ? "text-danger" : alert.type === "watch" ? "text-warn" : "text-accent",
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
              {typeLabel(alert.type, t)}
              {alert.area ? ` · ${alert.area}` : ""}
            </p>
            <p className="mt-0.5 text-sm font-medium capitalize text-fg">{alert.name}</p>
            {alert.text ? (
              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">{alert.text}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md p-1 text-muted hover:text-fg"
            aria-label={t("dismissAlert")}
            onClick={() => setHidden((h) => ({ ...h, [alert.id]: true }))}
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
