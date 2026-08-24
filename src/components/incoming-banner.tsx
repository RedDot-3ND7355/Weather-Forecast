import { CloudRain, CloudSnow, X } from "lucide-react";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { formatEta } from "@/lib/weather/advection";
import { fromThe } from "@/lib/weather/compass";
import type { IncomingPrecip } from "@/lib/weather/incoming";
import { cn } from "@/lib/utils";

export function IncomingBanner({ incoming }: { incoming: IncomingPrecip }) {
  const { locale, t } = useT();
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const kind = incoming.kind === "snow" ? t("snowWord") : t("rainWord");
  const kindCap = kind.charAt(0).toUpperCase() + kind.slice(1);
  const from = fromThe(incoming.fromDir, locale);
  const eta = formatEta(incoming.minutes, locale);
  const Icon = incoming.kind === "snow" ? CloudSnow : CloudRain;
  const title =
    incoming.minutes <= 8
      ? t("incomingNow", { kind: kindCap })
      : t("incomingSoon", { kind: kindCap, eta, from });
  const copy =
    incoming.source === "radar"
      ? t("incomingCopyRadar", { kind, from })
      : incoming.source === "now"
        ? t("incomingCopyNow", { kind, from })
        : t("incomingCopyHourly", { kind, chance: incoming.chance });

  return (
    <div
      className={cn(
        "mb-4 flex items-start gap-2 rounded-2xl px-3 py-3 shadow-[var(--shadow-border)] sm:px-4",
        incoming.minutes <= 8 ? "bg-rain/18" : "bg-warn/16",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-rain" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
          {t("incomingLead")}
        </p>
        <p className="mt-0.5 text-sm font-medium text-fg">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{copy}</p>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-md p-1 text-muted hover:text-fg"
        aria-label={t("dismissAlert")}
        onClick={() => setHidden(true)}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
