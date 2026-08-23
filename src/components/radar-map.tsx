import { useQuery } from "@tanstack/react-query";
import { Pause, Play, Radar } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { WindArrow } from "@/components/wind-arrow";
import { fetchRadarCatalog, fetchRadarNowcast } from "@/lib/weather/radar";
import { formatHour } from "@/lib/weather/format";
import { windLong } from "@/lib/weather/compass";
import type { Forecast } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

const BASE = "https://basemaps.cartocdn.com/dark_all";

function lon2tile(lon: number, z: number) {
  return ((lon + 180) / 360) * 2 ** z;
}
function lat2tile(lat: number, z: number) {
  const s = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 2 ** z;
}

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function RadarMap({ forecast }: { forecast: Forecast }) {
  const { place, current } = forecast;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);

  const catalogQuery = useQuery({
    queryKey: ["radar-catalog"],
    queryFn: () => fetchRadarCatalog(),
    staleTime: 2 * 60 * 1000,
  });
  const nowcastQuery = useQuery({
    queryKey: [
      "radar-nowcast",
      place.latitude,
      place.longitude,
      Math.round(current.windDir),
    ],
    queryFn: () =>
      fetchRadarNowcast({
        data: {
          latitude: place.latitude,
          longitude: place.longitude,
          windDir: current.windDir,
          windSpeedKmh: current.windSpeedKmh,
        },
      }),
    staleTime: 8 * 60 * 1000,
  });

  const frames = catalogQuery.data?.frames ?? [];
  const nowcast = nowcastQuery.data;
  const hours =
    nowcast?.hours?.length
      ? nowcast.hours
      : forecast.hourly.slice(0, 6).map((h, i) => ({
          time: h.time,
          hereMm: h.precipMm,
          fetchMm: 0,
          chance: h.rain.chance,
          arriving:
            i > 0 &&
            h.rain.chance >= 40 &&
            forecast.hourly[0].precipMm < 0.15,
        }));
  const arrival = nowcast?.arrival ?? null;
  const active = frames[Math.min(frame, Math.max(0, frames.length - 1))];

  useEffect(() => {
    if (!frames.length) return;
    setFrame(frames.length - 1);
  }, [frames.length]);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const id = window.setInterval(() => {
      setFrame((i) => (i + 1) % frames.length);
    }, 700);
    return () => window.clearInterval(id);
  }, [playing, frames.length]);

  const tilePlan = useMemo(() => {
    const z = 8;
    const cx = lon2tile(place.longitude, z);
    const cy = lat2tile(place.latitude, z);
    return { z, cx, cy };
  }, [place.latitude, place.longitude]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !active) return;
    const cssW = wrap.clientWidth;
    const cssH = wrap.clientHeight;
    if (cssW < 8 || cssH < 8) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let cancelled = false;

    const { z, cx, cy } = tilePlan;
    const tile = 256;
    const scale = cssW / 2.4 / tile;
    const originX = cssW / 2 - (cx - Math.floor(cx - 1)) * tile * scale;
    const originY = cssH / 2 - (cy - Math.floor(cy - 1)) * tile * scale;
    const x0 = Math.floor(cx - 1);
    const y0 = Math.floor(cy - 1);

    void (async () => {
      const jobs: Promise<{
        dx: number;
        dy: number;
        base: HTMLImageElement | null;
        rain: HTMLImageElement | null;
      }>[] = [];
      for (let dx = 0; dx < 3; dx += 1) {
        for (let dy = 0; dy < 3; dy += 1) {
          const tx = x0 + dx;
          const ty = y0 + dy;
          const max = 2 ** z;
          if (ty < 0 || ty >= max) continue;
          const wx = ((tx % max) + max) % max;
          jobs.push(
            Promise.all([
              loadImg(`${BASE}/${z}/${wx}/${ty}@2x.png`),
              loadImg(
                active.tileUrl
                  .replace("{z}", String(z))
                  .replace("{x}", String(wx))
                  .replace("{y}", String(ty)),
              ),
            ]).then(([base, rain]) => ({ dx, dy, base, rain })),
          );
        }
      }
      const tiles = await Promise.all(jobs);
      if (cancelled) return;
      ctx.clearRect(0, 0, cssW, cssH);
      for (const t of tiles) {
        if (!t.base) continue;
        const x = originX + t.dx * tile * scale;
        const y = originY + t.dy * tile * scale;
        ctx.drawImage(t.base, x, y, tile * scale, tile * scale);
      }
      ctx.globalAlpha = 0.88;
      for (const t of tiles) {
        if (!t.rain) continue;
        const x = originX + t.dx * tile * scale;
        const y = originY + t.dy * tile * scale;
        ctx.drawImage(t.rain, x, y, tile * scale, tile * scale);
      }
      ctx.globalAlpha = 1;

      const root = getComputedStyle(document.documentElement);
      const rain = root.getPropertyValue("--color-rain").trim() || "#7eb4c6";
      const fg = root.getPropertyValue("--color-fg").trim() || "#e7eef4";
      const px = cssW / 2;
      const py = cssH / 2;
      const rad = ((current.windDir - 90) * Math.PI) / 180;
      ctx.save();
      ctx.strokeStyle = rain;
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(px - Math.cos(rad) * cssW, py - Math.sin(rad) * cssH);
      ctx.lineTo(px + Math.cos(rad) * cssW, py + Math.sin(rad) * cssH);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.fillStyle = fg;
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = rain;
      ctx.lineWidth = 2;
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.stroke();
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [active, tilePlan, current.windDir]);

  const stamp = active
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(active.time * 1000))
    : "—";

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)] lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
            <Radar className="size-3.5" />
            Radar + wind fetch
          </p>
          <h2 className="mt-1 font-display text-xl font-medium leading-tight text-fg">
            {arrival
              ? arrival.minutes === 0
                ? "Rain is on the vane"
                : `Rain ${arrival.label}`
              : nowcast?.hours?.length
                ? "No cells on this fetch"
                : `Watch the ${windLong(current.windDir)}`}
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted">
            {arrival?.copy ??
              `Looking ${windLong(current.windDir)} — the moist source for this bearing. Radar is the last two hours plus a short nowcast.`}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-raised px-3 py-2">
          <WindArrow deg={current.windDir} wet={(arrival?.precipMm ?? current.rain.chance) > 40} />
          <p className="text-xs text-muted">
            From the {windLong(current.windDir)}
          </p>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative mt-3 h-[220px] w-full overflow-hidden bg-raised sm:h-[280px]"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          aria-label="Precipitation radar"
        />
        {!ready && !catalogQuery.isError ? (
          <div className="absolute inset-0 animate-pulse bg-raised" />
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <p className="rounded-md bg-bg/70 px-2 py-1 text-[11px] tabular-nums text-muted backdrop-blur-sm">
            {stamp}
          </p>
          <p className="rounded-md bg-bg/70 px-2 py-1 text-[11px] text-muted backdrop-blur-sm">
            Dashed line is the fetch
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl bg-raised text-fg"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause radar" : "Play radar"}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(0, frames.length - 1)}
          value={Math.min(frame, Math.max(0, frames.length - 1))}
          onChange={(e) => {
            setPlaying(false);
            setFrame(Number(e.target.value));
          }}
          className="h-2 min-w-0 flex-1 accent-rain"
          aria-label="Radar time"
        />
      </div>

      {hours.length ? (
        <div className="border-t border-border px-4 py-3 sm:px-5">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
            Next 6 hours on this fetch
          </p>
          <div className="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {hours.map((h, i) => (
              <div
                key={h.time}
                className={cn(
                  "flex w-[4.4rem] shrink-0 flex-col items-center gap-1 rounded-xl px-1 py-2",
                  i === 0 ? "bg-raised" : "",
                )}
              >
                <p className="text-[11px] font-medium text-muted">
                  {i === 0 ? "Now" : formatHour(h.time)}
                </p>
                <p
                  className={cn(
                    "text-sm font-medium tabular-nums",
                    h.chance >= 40 ? "text-rain" : "text-fg",
                  )}
                >
                  {h.chance}%
                </p>
                <p className="text-center text-[10px] leading-tight text-faint">
                  {h.arriving
                    ? "blowing in"
                    : h.hereMm >= 0.15
                      ? "overhead"
                      : "quiet"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
