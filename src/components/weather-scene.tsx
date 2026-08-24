import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Scene =
  | "clear"
  | "partly"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "shower"
  | "snow"
  | "snowshower"
  | "thunder";

type Density = "full" | "compact";

function sceneFor(code: number): Scene {
  if (code === 0 || code === 1) return "clear";
  if (code === 2) return "partly";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 80 && code <= 82) return "shower";
  if (code === 85 || code === 86) return "snowshower";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95) return "thunder";
  if (code >= 61 && code <= 67) return "rain";
  return "partly";
}

function intensity(code: number): 1 | 2 | 3 {
  if ([51, 56, 61, 66, 71, 80, 85].includes(code)) return 1;
  if ([55, 57, 65, 67, 75, 82, 86, 99].includes(code)) return 3;
  return 2;
}

function unit(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type SceneProps = {
  code: number;
  isDay: boolean;
  windKmh: number;
  idPrefix?: string;
  density?: Density;
  shape?: "circle" | "rect";
};

export function WeatherSceneGroup({
  code,
  isDay,
  windKmh,
  idPrefix = "wx",
  density = "full",
  shape = "circle",
}: SceneProps) {
  const scene = sceneFor(code);
  const level = intensity(code);
  const wind = Math.max(0, windKmh);
  const lean = Math.min(22, wind * 0.42);
  const gust = Math.min(1, wind / 48);
  const compact = density === "compact";
  const precip =
    scene === "drizzle" ||
    scene === "rain" ||
    scene === "shower" ||
    scene === "thunder";
  const snow = scene === "snow" || scene === "snowshower";
  const cloudy =
    scene === "partly" || scene === "overcast" || precip || snow || scene === "fog";
  const storm = scene === "thunder" || scene === "shower" || scene === "overcast";

  const sky = isDay
    ? storm
      ? ["#152028", "#0b1014"]
      : scene === "clear"
        ? ["#1c4454", "#0f1c24"]
        : ["#17323e", "#0c141a"]
    : storm
      ? ["#0c1014", "#07090c"]
      : ["#101820", "#080b0e"];

  const drops = precip ? (compact ? 4 + level * 2 : 8 + level * 8) : 0;
  const flakes = snow ? (compact ? 4 + level * 2 : 7 + level * 6) : 0;
  const clouds = cloudy
    ? compact
      ? scene === "partly"
        ? 1
        : 2
      : scene === "partly"
        ? 2
        : scene === "fog"
          ? 4
          : 3
    : 0;
  const stars = !isDay && scene === "clear" ? (compact ? 6 : 14) : !isDay ? (compact ? 3 : 7) : 0;
  const streaks = !compact && wind >= 14 ? 4 + Math.round(gust * 5) : 0;

  const clipId = `${idPrefix}-clip`;
  const skyId = `${idPrefix}-sky`;
  const scrimId = `${idPrefix}-scrim`;
  const R = 110;

  return (
    <g
      className="vane-wx"
      style={
        {
          "--wx-lean": `${lean}deg`,
          "--wx-gust": String(0.35 + gust * 0.9),
        } as CSSProperties
      }
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          {shape === "circle" ? (
            <circle cx="120" cy="120" r={R} />
          ) : (
            <rect x="0" y="0" width="240" height="240" rx="28" ry="28" />
          )}
        </clipPath>
        <radialGradient id={skyId} cx="50%" cy="42%" r="68%">
          <stop offset="0%" stopColor={sky[0]} />
          <stop offset="100%" stopColor={sky[1]} />
        </radialGradient>
        <radialGradient id={scrimId} cx="50%" cy="50%" r="46%">
          <stop offset="0%" stopColor="#0b1014" stopOpacity={compact ? 0.35 : 0.5} />
          <stop offset="70%" stopColor="#0b1014" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0b1014" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {shape === "circle" ? (
          <circle cx="120" cy="120" r={R} fill={`url(#${skyId})`} />
        ) : (
          <rect x="0" y="0" width="240" height="240" fill={`url(#${skyId})`} />
        )}

        {stars
          ? Array.from({ length: stars }, (_, i) => {
              const ang = unit(i, 1) * Math.PI * 2;
              const rad = 28 + unit(i, 2) * 72;
              const x = 120 + Math.cos(ang) * rad;
              const y = 120 + Math.sin(ang) * rad;
              const r = 0.5 + unit(i, 3) * 1.1;
              return (
                <circle
                  key={`s${i}`}
                  cx={x}
                  cy={y}
                  r={r}
                  fill="#e7eef4"
                  className="vane-wx-twinkle"
                  style={{
                    animationDelay: `${unit(i, 4) * 3}s`,
                    animationDuration: `${2.4 + unit(i, 5) * 2.2}s`,
                  }}
                />
              );
            })
          : null}

        {isDay && (scene === "clear" || scene === "partly") ? (
          <g className="vane-wx-sun" transform={`translate(120 ${compact ? 70 : 88})`}>
            <g className="vane-wx-rays">
              {Array.from({ length: 8 }, (_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={compact ? -12 : -18}
                  x2="0"
                  y2={compact ? -18 : -26}
                  stroke="#f5d76e"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.7"
                  transform={`rotate(${i * 45})`}
                />
              ))}
            </g>
            <circle cx="0" cy="0" r={compact ? 10 : 14} fill="#f5d76e" opacity="0.95" />
            <circle
              cx="0"
              cy="0"
              r={compact ? 14 : 20}
              fill="#f5d76e"
              opacity="0.16"
              className="vane-wx-glow"
            />
          </g>
        ) : null}

        {!isDay && (scene === "clear" || scene === "partly") ? (
          <g transform={`translate(120 ${compact ? 70 : 88})`}>
            <circle cx="0" cy="0" r={compact ? 10 : 13} fill="#d5dde4" opacity="0.92" />
            <circle cx={compact ? 5 : 6} cy={compact ? -2 : -3} r={compact ? 8 : 11} fill={sky[0]} />
          </g>
        ) : null}

        {clouds
          ? Array.from({ length: clouds }, (_, i) => {
              const x = 40 + unit(i, 6) * 120;
              const y = 55 + unit(i, 7) * 50;
              const s = (compact ? 0.45 : 0.65) + unit(i, 8) * 0.5;
              const dur = 18 + unit(i, 9) * 16 - gust * 8;
              return (
                <g key={`c${i}`} transform={`translate(${x} ${y}) scale(${s})`}>
                  <g
                    className="vane-wx-cloud"
                    style={{
                      animationDuration: `${Math.max(9, dur)}s`,
                      animationDelay: `${-unit(i, 10) * 12}s`,
                      opacity: scene === "fog" ? 0.35 : scene === "partly" ? 0.45 : 0.62,
                    }}
                  >
                    <ellipse cx="28" cy="10" rx="28" ry="12" fill="#c5d0d8" />
                    <ellipse cx="10" cy="12" rx="16" ry="10" fill="#c5d0d8" />
                    <ellipse cx="46" cy="13" rx="14" ry="9" fill="#c5d0d8" />
                    <ellipse cx="24" cy="0" rx="14" ry="11" fill="#dce4ea" />
                  </g>
                </g>
              );
            })
          : null}

        {scene === "fog" && !compact
          ? [0, 1, 2].map((i) => (
              <ellipse
                key={`f${i}`}
                cx="120"
                cy={95 + i * 24}
                rx={80 - i * 8}
                ry="14"
                fill="#c5d0d8"
                className="vane-wx-fog"
                style={{
                  animationDelay: `${i * 1.2}s`,
                  opacity: 0.22 + i * 0.06,
                }}
              />
            ))
          : null}

        {precip
          ? Array.from({ length: drops }, (_, i) => {
              const x = 30 + unit(i, 11) * 180;
              const delay = -unit(i, 12) * 1.8;
              const dur =
                (scene === "drizzle" ? 1.6 : scene === "shower" ? 0.85 : 1.15) -
                level * 0.12;
              const len = scene === "drizzle" ? 5 + level : 9 + level * 3;
              return (
                <line
                  key={`r${i}`}
                  x1={x}
                  y1={20}
                  x2={x}
                  y2={20 + len}
                  stroke="var(--color-rain)"
                  strokeWidth={scene === "drizzle" ? 0.8 : 1.15}
                  strokeLinecap="round"
                  opacity={0.35 + level * 0.12}
                  className="vane-wx-fall"
                  style={{
                    animationDelay: `${delay}s`,
                    animationDuration: `${Math.max(0.55, dur)}s`,
                  }}
                />
              );
            })
          : null}

        {snow
          ? Array.from({ length: flakes }, (_, i) => {
              const x = 28 + unit(i, 13) * 184;
              const r = 1.1 + unit(i, 14) * 1.8 * (level === 1 ? 1.15 : 1);
              const dur = 4.2 + unit(i, 15) * 3.4 - level * 0.4;
              return (
                <circle
                  key={`n${i}`}
                  cx={x}
                  cy={22}
                  r={r}
                  fill="#e7eef4"
                  opacity={0.55 + unit(i, 16) * 0.35}
                  className="vane-wx-fall vane-wx-flake"
                  style={{
                    animationDelay: `${-unit(i, 17) * 4}s`,
                    animationDuration: `${dur}s`,
                  }}
                />
              );
            })
          : null}

        {streaks
          ? Array.from({ length: streaks }, (_, i) => {
              const y = 50 + unit(i, 18) * 130;
              const w = 18 + unit(i, 19) * 36;
              return (
                <line
                  key={`w${i}`}
                  x1="20"
                  y1={y}
                  x2={20 + w}
                  y2={y}
                  stroke="#e7eef4"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity={0.12 + gust * 0.22}
                  className="vane-wx-streak"
                  style={{
                    animationDelay: `${-unit(i, 20) * 2}s`,
                    animationDuration: `${1.1 + unit(i, 21) * 1.2}s`,
                  }}
                />
              );
            })
          : null}

        {scene === "thunder" && !compact ? (
          <g>
            <rect x="10" y="10" width="220" height="220" fill="#e7eef4" className="vane-wx-flash" />
            <path
              d="M128 52 L108 108 L122 108 L112 164 L148 96 L130 96 L142 52 Z"
              fill="#f5d76e"
              className="vane-wx-bolt"
            />
          </g>
        ) : null}

        {shape === "circle" ? (
          <circle cx="120" cy="120" r={R} fill={`url(#${scrimId})`} />
        ) : (
          <rect x="0" y="0" width="240" height="240" fill={`url(#${scrimId})`} />
        )}
      </g>
    </g>
  );
}

export function WeatherBackdrop({
  code,
  isDay,
  windKmh,
  density = "full",
  className,
}: {
  code: number;
  isDay: boolean;
  windKmh: number;
  density?: Density;
  className?: string;
}) {
  const raw = useId().replace(/:/g, "");
  const idPrefix = `bd${raw}`;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <svg viewBox="0 0 240 240" className="size-full" preserveAspectRatio="xMidYMid slice">
        <WeatherSceneGroup
          code={code}
          isDay={isDay}
          windKmh={windKmh}
          idPrefix={idPrefix}
          density={density}
          shape="rect"
        />
      </svg>
    </div>
  );
}
