import { Sun } from "lucide-react";
import { useT } from "@/lib/i18n";
import { uvAdvice, uvToneClass, type UvLevel } from "@/lib/weather/uv";
import type { Forecast } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

function sceneFor(level: UvLevel): { glow: string; wash: string; ember: number } {
  switch (level) {
    case "low":
      return {
        glow: "radial-gradient(ellipse at 70% 20%, rgba(250,204,90,0.28), transparent 55%)",
        wash: "linear-gradient(180deg, rgba(20,28,36,0.15), rgba(11,16,20,0.55))",
        ember: 0.08,
      };
    case "moderate":
      return {
        glow: "radial-gradient(ellipse at 75% 12%, rgba(251,146,60,0.45), transparent 58%)",
        wash: "linear-gradient(180deg, rgba(70,32,10,0.25), rgba(11,16,20,0.5))",
        ember: 0.18,
      };
    case "high":
      return {
        glow: "radial-gradient(ellipse at 80% 8%, rgba(249,115,22,0.62), rgba(220,38,38,0.18) 42%, transparent 62%)",
        wash: "linear-gradient(180deg, rgba(90,22,8,0.4), rgba(11,16,20,0.45))",
        ember: 0.32,
      };
    case "veryHigh":
      return {
        glow: "radial-gradient(ellipse at 82% 0%, rgba(255,80,20,0.78), rgba(185,28,28,0.35) 40%, transparent 65%)",
        wash: "linear-gradient(180deg, rgba(120,18,4,0.55), rgba(11,16,20,0.4))",
        ember: 0.5,
      };
    default:
      return {
        glow: "radial-gradient(ellipse at 85% -5%, rgba(255,60,10,0.95), rgba(220,38,38,0.5) 38%, transparent 68%)",
        wash: "linear-gradient(180deg, rgba(160,12,0,0.65), rgba(11,16,20,0.35))",
        ember: 0.7,
      };
  }
}

function UvScene({ level }: { level: UvLevel }) {
  const s = sceneFor(level);
  const hot = level === "veryHigh" || level === "extreme";
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
      <div className="absolute inset-0" style={{ background: s.glow }} />
      <div className="absolute inset-0" style={{ background: s.wash }} />
      <div
        className={cn(
          "absolute -right-8 -top-10 size-40 rounded-full blur-2xl",
          hot ? "animate-pulse" : "",
        )}
        style={{
          background:
            level === "low"
              ? "rgba(250,204,90,0.35)"
              : level === "moderate"
                ? "rgba(251,146,60,0.5)"
                : "rgba(255,70,10,0.7)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: `linear-gradient(to top, rgba(255,80,20,${s.ember}), transparent)`,
        }}
      />
    </div>
  );
}

export function UvPanel({ forecast }: { forecast: Forecast }) {
  const { t } = useT();
  const now = uvAdvice(forecast.current.uvIndex);
  const peak = forecast.daily[0] ? uvAdvice(forecast.daily[0].uvMax) : null;
  const sceneLevel = peak && peak.index > now.index ? peak.level : now.level;

  return (
    <section className="relative min-w-0 overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <UvScene level={sceneLevel} />
      <div className="relative z-[1]">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-faint [text-shadow:0_1px_8px_#0b1014]">
          <Sun className="size-3.5" />
          {t("uvIndex")}
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <p className="font-display text-5xl leading-none font-medium tabular-nums text-fg [text-shadow:0_2px_16px_#0b1014]">
            {now.index}
          </p>
          <p className={cn("mb-1 text-sm font-medium [text-shadow:0_1px_8px_#0b1014]", uvToneClass(now.level))}>
            {t(now.labelKey)}
          </p>
        </div>
        {peak ? (
          <p className="mt-2 text-xs text-muted [text-shadow:0_1px_8px_#0b1014]">
            {t("uvTodayMax")} {peak.index} · {t(peak.labelKey)}
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed text-fg/90 [text-shadow:0_1px_8px_#0b1014]">
          {t(now.level === "low" && peak && peak.level !== "low" ? peak.adviceKey : now.adviceKey)}
        </p>
      </div>
    </section>
  );
}
