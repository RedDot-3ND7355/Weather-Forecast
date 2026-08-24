import { precipWord } from "@/lib/weather/codes";
import { compassPoint, fromThe, windLong } from "@/lib/weather/compass";
import { useDeviceHeading } from "@/lib/weather/device-heading";
import { WeatherSceneGroup } from "@/components/weather-scene";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CompassProps = {
  windDir: number;
  windSpeedLabel: string;
  windKmh?: number;
  chance: number;
  weatherCode?: number;
  isDay?: boolean;
  className?: string;
};

export function Compass({
  windDir,
  windSpeedLabel,
  windKmh = 0,
  chance,
  weatherCode = 61,
  isDay = true,
  className,
}: CompassProps) {
  const { locale, t } = useT();
  const wet = chance >= 35;
  const ticks = Array.from({ length: 72 }, (_, i) => i);
  const rainLines = Array.from({ length: 7 }, (_, i) => i - 3);
  const from = fromThe(windDir, locale);
  const fromWord = windLong(windDir, locale);
  const point = compassPoint(windDir);
  const { heading, status, accuracy, offer, hint, enable, disable } =
    useDeviceHeading();
  const live = status === "live" && heading != null;
  const rose = live ? -heading : 0;
  const facing = live ? compassPoint(heading) : null;
  const uncalibrated = live && accuracy != null && accuracy < 0;
  const hdg = heading ?? 0;

  return (
    <div className={cn("mx-auto w-full max-w-64 sm:max-w-80", className)}>
      <div className="relative aspect-square w-full">
        <svg
          viewBox="0 0 240 240"
          className="size-full"
          role="img"
          aria-label={
            live
              ? t("compassLive", {
                  facing: facing ?? "",
                  from,
                  speed: windSpeedLabel,
                  chance,
                })
              : t("compassStatic", { from, speed: windSpeedLabel, chance })
          }
        >
          <defs>
            <linearGradient id="vane-needle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-fg)" />
              <stop offset="100%" stopColor="var(--color-accent)" />
            </linearGradient>
          </defs>

          <WeatherSceneGroup
            code={weatherCode}
            isDay={isDay}
            windKmh={windKmh}
            idPrefix="compass"
            shape="circle"
          />

          <circle
            cx="120"
            cy="120"
            r="108"
            fill="none"
            stroke="var(--color-border-strong)"
            strokeWidth="1.2"
          />
          <circle
            cx="120"
            cy="120"
            r="86"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="1"
          />

          {live ? (
            <polygon points="120,6 126,18 114,18" fill="var(--color-accent)" />
          ) : null}

          <g
            style={{
              transform: `rotate(${rose}deg)`,
              transformOrigin: "120px 120px",
              transition: live
                ? undefined
                : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {wet ? (
              <path
                d={sectorPath(120, 120, 104, windDir - 18, windDir + 18)}
                fill="var(--color-rain)"
                opacity="0.16"
              />
            ) : null}

            {ticks.map((i) => {
              const deg = i * 5;
              const major = deg % 30 === 0;
              const card = deg % 90 === 0;
              const inner = card ? 78 : major ? 80 : 83;
              const outer = 104;
              const a = ((deg - 90) * Math.PI) / 180;
              const x1 = 120 + inner * Math.cos(a);
              const y1 = 120 + inner * Math.sin(a);
              const x2 = 120 + outer * Math.cos(a);
              const y2 = 120 + outer * Math.sin(a);
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--color-muted)"
                  strokeWidth={card ? 1.8 : major ? 1.2 : 0.6}
                  opacity={card ? 0.9 : major ? 0.55 : 0.28}
                />
              );
            })}

            {(["N", "E", "S", "W"] as const).map((label, i) => {
              const shown = locale === "fr" && label === "W" ? "O" : label;
              const deg = i * 90;
              const a = ((deg - 90) * Math.PI) / 180;
              const r = 66;
              const x = 120 + r * Math.cos(a);
              const y = 120 + r * Math.sin(a);
              return (
                <text
                  key={label}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--color-fg)"
                  fontSize="11"
                  fontWeight="600"
                  letterSpacing="0.08em"
                  transform={live ? `rotate(${hdg} ${x} ${y})` : undefined}
                >
                  {shown}
                </text>
              );
            })}

            {wet
              ? rainLines.map((offset) => {
                  const deg = windDir + offset * 5.5;
                  const a = ((deg - 90) * Math.PI) / 180;
                  const x1 = 120 + 100 * Math.cos(a);
                  const y1 = 120 + 100 * Math.sin(a);
                  const x2 = 120 + 38 * Math.cos(a);
                  const y2 = 120 + 38 * Math.sin(a);
                  return (
                    <line
                      key={offset}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="var(--color-rain)"
                      strokeWidth={offset === 0 ? 2 : 1.1}
                      strokeLinecap="round"
                      opacity={offset === 0 ? 0.85 : 0.4}
                      strokeDasharray="5 7"
                      className="origin-center motion-safe:animate-pulse"
                    />
                  );
                })
              : null}

            <g
              style={{
                transform: `rotate(${windDir}deg)`,
                transformOrigin: "120px 120px",
                transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <polygon
                points="120,28 126,120 120,108 114,120"
                fill="url(#vane-needle)"
              />
              <polygon
                points="120,198 126.5,120 120,132 113.5,120"
                fill="var(--color-accent)"
              />
              <circle
                cx="120"
                cy="120"
                r="7"
                fill="var(--color-bg)"
                stroke="var(--color-accent)"
                strokeWidth="2"
              />
            </g>
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-3xl font-medium tabular-nums leading-none tracking-tight text-fg [text-shadow:0_1px_12px_#0b1014] sm:text-4xl">
            {chance}
            <span className="text-lg text-muted">%</span>
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-faint [text-shadow:0_1px_8px_#0b1014]">
            {precipWord(weatherCode, locale)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 text-sm">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
            {t("from")}
          </p>
          <p className="font-medium capitalize text-fg">{fromWord}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
            {point}
          </p>
          <p className="font-medium tabular-nums text-fg">{windSpeedLabel}</p>
        </div>
      </div>

      {offer || status === "live" || status === "denied" ? (
        <div className="mt-3 flex items-center justify-between gap-2">
          {status === "live" ? (
            <>
              <p className="text-xs text-muted">
                {hint === "calibrate" || uncalibrated
                  ? t("wavePhone")
                  : hint === "settings"
                    ? t("safariMotion")
                    : hint === "move"
                      ? t("turnPhone")
                      : live
                        ? t("facing", { dir: facing ?? "" })
                        : t("findingNorth")}
              </p>
              <Button type="button" size="sm" variant="ghost" onClick={disable}>
                {t("northUp")}
              </Button>
            </>
          ) : status === "denied" ? (
            <p className="text-xs text-muted">{t("compassDenied")}</p>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={() => void enable()}
            >
              {t("useCompass")}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function sectorPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y} Z`;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
