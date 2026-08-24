import { useQuery } from "@tanstack/react-query";
import { Minus, Pause, Play, Plus, Radar } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { WindArrow } from "@/components/wind-arrow";
import { fetchRadarCatalog, fetchRadarNowcast, pickHalfHourFrames } from "@/lib/weather/radar";
import { formatHour, formatSpeed } from "@/lib/weather/format";
import { windLong } from "@/lib/weather/compass";
import type { Forecast, Units } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

const BASE = "https://basemaps.cartocdn.com/dark_all";
const MIN_Z = 5;
const MAX_Z = 7;
const imgCache = new Map<string, Promise<HTMLImageElement | null>>();

function lon2tile(lon: number, z: number) {
  return ((lon + 180) / 360) * 2 ** z;
}
function lat2tile(lat: number, z: number) {
  const s = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 2 ** z;
}

function loadImg(src: string): Promise<HTMLImageElement | null> {
  const hit = imgCache.get(src);
  if (hit) return hit;
  const pending = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  imgCache.set(src, pending);
  return pending;
}

function hourStatus(h: {
  hereMm: number;
  fetchMm: number;
  chance: number;
  arriving: boolean;
}): string {
  if (h.hereMm >= 0.15) return "Raining";
  if (h.arriving || h.fetchMm >= 0.12) return "On the way";
  if (h.chance >= 45) return "Possible";
  return "Dry";
}

function composeRadar(args: {
  cssW: number;
  cssH: number;
  dpr: number;
  tiles: {
    dx: number;
    dy: number;
    base: HTMLImageElement | null;
    rain: HTMLImageElement | null;
  }[];
  originX: number;
  originY: number;
  tile: number;
  scale: number;
  windDir: number;
}): HTMLCanvasElement {
  const { cssW, cssH, dpr, tiles, originX, originY, tile, scale, windDir } = args;
  const off = document.createElement("canvas");
  off.width = Math.round(cssW * dpr);
  off.height = Math.round(cssH * dpr);
  const ctx = off.getContext("2d");
  if (!ctx) return off;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const raised =
    getComputedStyle(document.documentElement).getPropertyValue("--color-raised").trim() ||
    "#131a21";
  ctx.fillStyle = raised;
  ctx.fillRect(0, 0, cssW, cssH);
  for (const t of tiles) {
    if (!t.base) continue;
    ctx.drawImage(
      t.base,
      originX + t.dx * tile * scale,
      originY + t.dy * tile * scale,
      tile * scale,
      tile * scale,
    );
  }
  ctx.globalAlpha = 0.9;
  for (const t of tiles) {
    if (!t.rain) continue;
    ctx.drawImage(
      t.rain,
      originX + t.dx * tile * scale,
      originY + t.dy * tile * scale,
      tile * scale,
      tile * scale,
    );
  }
  ctx.globalAlpha = 1;
  const root = getComputedStyle(document.documentElement);
  const rain = root.getPropertyValue("--color-rain").trim() || "#7eb4c6";
  const fg = root.getPropertyValue("--color-fg").trim() || "#e7eef4";
  const px = cssW / 2;
  const py = cssH / 2;
  const rad = ((windDir - 90) * Math.PI) / 180;
  ctx.save();
  ctx.strokeStyle = rain;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 5]);
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
  return off;
}

export function RadarMap({
  forecast,
  units,
}: {
  forecast: Forecast;
  units: Units;
}) {
  const { place, current } = forecast;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(6);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const lastBitmap = useRef<HTMLCanvasElement | null>(null);
  const fadeRaf = useRef(0);
  const readyRef = useRef(false);

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

  const frames = useMemo(
    () => pickHalfHourFrames(catalogQuery.data?.frames ?? []),
    [catalogQuery.data?.frames],
  );
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
  const spanHours =
    frames.length >= 2
      ? Math.max(1, Math.round((frames[frames.length - 1].time - frames[0].time) / 3600))
      : 2;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!frames.length) return;
    setFrame(frames.length - 1);
  }, [frames.length]);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const id = window.setInterval(() => {
      setFrame((i) => (i + 1) % frames.length);
    }, 1200);
    return () => window.clearInterval(id);
  }, [playing, frames.length]);

  const tilePlan = useMemo(() => {
    const z = zoom;
    return { z, cx: lon2tile(place.longitude, z), cy: lat2tile(place.latitude, z) };
  }, [place.latitude, place.longitude, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active || size.w < 8 || size.h < 8) return;
    const cssW = size.w;
    const cssH = size.h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelW = Math.round(cssW * dpr);
    const pixelH = Math.round(cssH * dpr);
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
      const ctx0 = canvas.getContext("2d");
      if (ctx0 && lastBitmap.current) {
        ctx0.setTransform(1, 0, 0, 1, 0, 0);
        ctx0.drawImage(lastBitmap.current, 0, 0, pixelW, pixelH);
      }
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    const { z, cx, cy } = tilePlan;
    const tile = 256;
    const scale = cssW / 2.15 / tile;
    const originX = cssW / 2 - (cx - Math.floor(cx - 1)) * tile * scale;
    const originY = cssH / 2 - (cy - Math.floor(cy - 1)) * tile * scale;
    const x0 = Math.floor(cx - 1);
    const y0 = Math.floor(cy - 1);

    const loadTiles = (frameUrl: string) => {
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
                frameUrl
                  .replace("{z}", String(z))
                  .replace("{x}", String(wx))
                  .replace("{y}", String(ty)),
              ),
            ]).then(([base, rain]) => ({ dx, dy, base, rain })),
          );
        }
      }
      return Promise.all(jobs);
    };

    void (async () => {
      const tiles = await loadTiles(active.tileUrl);
      if (cancelled) return;
      const next = composeRadar({
        cssW,
        cssH,
        dpr,
        tiles,
        originX,
        originY,
        tile,
        scale,
        windDir: current.windDir,
      });
      const prev = lastBitmap.current;
      lastBitmap.current = next;
      cancelAnimationFrame(fadeRaf.current);
      if (!prev || !readyRef.current) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.drawImage(next, 0, 0);
        readyRef.current = true;
        setReady(true);
        return;
      }
      const start = performance.now();
      const dur = 280;
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - (1 - t) * (1 - t);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.drawImage(prev, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = eased;
        ctx.drawImage(next, 0, 0);
        ctx.globalAlpha = 1;
        if (t < 1) fadeRaf.current = requestAnimationFrame(tick);
      };
      fadeRaf.current = requestAnimationFrame(tick);
    })();

    for (const f of frames) {
      if (f !== active) void loadTiles(f.tileUrl);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(fadeRaf.current);
    };
  }, [active, tilePlan, current.windDir, size.w, size.h, frames]);

  const stamp = active
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(active.time * 1000))
    : "—";
  const isLatest = frames.length > 0 && frame >= frames.length - 1;
  const from = windLong(current.windDir);
  const headline = arrival
    ? arrival.minutes === 0
      ? "Raining here now"
      : `Rain ${arrival.label}`
    : nowcast?.hours?.length
      ? "No rain headed this way"
      : `Watch the ${from}`;
  const copy =
    arrival?.copy ??
    `Wind is from the ${from}. Rain would arrive from that direction. Radar is shown every 30 minutes.`;

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)] lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
            <Radar className="size-3.5" />
            Rain radar
          </p>
          <h2 className="mt-1 font-display text-xl font-medium leading-tight text-fg">
            {headline}
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted">{copy}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-raised px-3 py-2">
          <WindArrow
            deg={current.windDir}
            wet={(arrival?.precipMm ?? current.rain.chance) > 40}
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-fg">From the {from}</p>
            <p className="text-[11px] text-muted">
              {formatSpeed(current.windSpeedKmh, units)}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative mt-3 h-[240px] w-full overflow-hidden bg-raised sm:h-[300px]"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          aria-label={`Precipitation radar for ${place.name}`}
        />
        {!ready && !catalogQuery.isError ? (
          <div className="absolute inset-0 animate-pulse bg-raised" />
        ) : null}
        {catalogQuery.isError ? (
          <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-muted">
            Radar is unavailable right now. The hourly estimate below still uses
            wind and the forecast model.
          </p>
        ) : null}
        <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-bg/75 px-2 py-1 text-[11px] text-fg backdrop-blur-sm">
          {place.name}
        </div>
        <div className="absolute right-3 top-3 flex gap-1">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="size-9"
            disabled={zoom <= MIN_Z}
            onClick={() => setZoom((z) => Math.max(MIN_Z, z - 1))}
            aria-label="Zoom out"
          >
            <Minus className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="size-9"
            disabled={zoom >= MAX_Z}
            onClick={() => setZoom((z) => Math.min(MAX_Z, z + 1))}
            aria-label="Zoom in"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <p className="rounded-md bg-bg/75 px-2 py-1 text-[11px] tabular-nums text-muted backdrop-blur-sm">
            {isLatest ? "Now" : stamp}
          </p>
          <p className="rounded-md bg-bg/75 px-2 py-1 text-[11px] text-muted backdrop-blur-sm">
            You are here · dashed line is wind
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 px-3"
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? "Pause" : "Play"}
        </Button>
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={Math.max(0, frames.length - 1)}
            step={1}
            value={Math.min(frame, Math.max(0, frames.length - 1))}
            onChange={(e) => {
              setPlaying(false);
              setFrame(Number(e.target.value));
            }}
            className="h-2 w-full accent-rain"
            aria-label="Radar time, 30 minute steps"
          />
          <div className="mt-1 flex justify-between text-[11px] text-faint">
            <span>
              {spanHours} hour{spanHours === 1 ? "" : "s"} ago · 30 min
            </span>
            <span>Now</span>
          </div>
        </div>
      </div>

      {hours.length ? (
        <div className="border-t border-border px-4 py-3 sm:px-5">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
            Next 6 hours
          </p>
          <div className="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {hours.map((h, i) => {
              const status = hourStatus(h);
              const wet = status !== "Dry";
              return (
                <div
                  key={h.time}
                  className={cn(
                    "flex w-[4.6rem] shrink-0 flex-col items-center gap-1 rounded-xl px-1 py-2",
                    i === 0 ? "bg-raised" : "",
                  )}
                >
                  <p className="text-[11px] font-medium text-muted">
                    {i === 0 ? "Now" : formatHour(h.time)}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      wet ? "text-rain" : "text-fg",
                    )}
                  >
                    {h.chance}%
                  </p>
                  <p className="text-center text-[10px] leading-tight text-faint">
                    {status}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
