import { useQuery } from "@tanstack/react-query";
import { Crosshair, Expand, Maximize2, Minus, Pause, Play, Plus, Radar, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HScroll } from "@/components/h-scroll";
import { Button } from "@/components/ui/button";
import { WindArrow } from "@/components/wind-arrow";
import {
  buildRadarTimeline,
  fetchMscRadar,
  fetchPrecipGrid,
  fetchRadarCatalog,
  fetchRadarNowcast,
  inMscDomain,
  mscGetMapUrl,
  nowFrameIndex,
  overlayLayer,
  viewBBox3857,
  type PrecipCell,
  type RadarFrame,
} from "@/lib/weather/radar";
import { localeTag, useT } from "@/lib/i18n";
import { arrivalCopy, formatEta } from "@/lib/weather/advection";
import { precipKind, precipWordCap } from "@/lib/weather/codes";
import { formatHour, formatSpeed } from "@/lib/weather/format";
import { fromThe, windLong } from "@/lib/weather/compass";
import type { Forecast, Units } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

const BASE = "https://basemaps.cartocdn.com/dark_all";
const MIN_Z = 4;
const MAX_Z = 10;
const okImg = new Map<string, HTMLImageElement>();

type ImgJob = {
  src: string;
  keep: boolean;
  cancelled: boolean;
  done: boolean;
  img: HTMLImageElement | null;
  resolve: (value: HTMLImageElement | null) => void;
};

const imgJobs = {
  inflight: new Set<ImgJob>(),
  queued: [] as ImgJob[],
  max: 2,
};

function pumpImgJobs() {
  while (imgJobs.inflight.size < imgJobs.max && imgJobs.queued.length) {
    const job = imgJobs.queued.shift();
    if (!job) break;
    if (job.cancelled) {
      job.resolve(null);
      continue;
    }
    const cached = okImg.get(job.src);
    if (cached) {
      job.resolve(cached);
      continue;
    }
    const img = new Image();
    job.img = img;
    imgJobs.inflight.add(job);
    img.crossOrigin = "anonymous";
    const finish = (value: HTMLImageElement | null) => {
      if (job.done) return;
      job.done = true;
      imgJobs.inflight.delete(job);
      if (!job.cancelled && value) okImg.set(job.src, value);
      job.resolve(job.cancelled ? null : value);
      pumpImgJobs();
    };
    img.onload = () => finish(img);
    img.onerror = () => finish(null);
    img.src = job.src;
  }
}

function cancelRadarLoads() {
  for (const job of imgJobs.queued) {
    if (job.keep) continue;
    job.cancelled = true;
  }
  imgJobs.queued = imgJobs.queued.filter((job) => job.keep && !job.cancelled);
  for (const job of imgJobs.inflight) {
    if (job.keep) continue;
    job.cancelled = true;
    if (job.img) job.img.src = "";
  }
}

function loadImg(src: string, keep = false): Promise<HTMLImageElement | null> {
  const cached = okImg.get(src);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve) => {
    const job: ImgJob = {
      src,
      keep,
      cancelled: false,
      done: false,
      img: null,
      resolve,
    };
    if (keep) imgJobs.queued.push(job);
    else imgJobs.queued.unshift(job);
    pumpImgJobs();
  });
}

function lon2tile(lon: number, z: number) {
  return ((lon + 180) / 360) * 2 ** z;
}
function lat2tile(lat: number, z: number) {
  const s = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 2 ** z;
}
function tile2lon(x: number, z: number) {
  return (x / 2 ** z) * 360 - 180;
}
function tile2lat(y: number, z: number) {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function hourStatus(
  h: {
    hereMm: number;
    fetchMm: number;
    chance: number;
    arriving: boolean;
  },
  raining: string,
  onTheWay: string,
  possible: string,
  dry: string,
): string {
  if (h.hereMm >= 0.15) return raining;
  if (h.arriving || h.fetchMm >= 0.12) return onTheWay;
  if (h.chance >= 45) return possible;
  return dry;
}

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function fbm(x: number, y: number): number {
  return (
    0.57 * hash2(x, y) +
    0.28 * hash2(x * 2.1 + 3.1, y * 2.03) +
    0.15 * hash2(x * 4.2, y * 3.9 + 1.7)
  );
}

function windAxes(deg: number): { ux: number; uy: number; px: number; py: number } {
  const to = ((deg + 180) * Math.PI) / 180;
  const ux = Math.sin(to);
  const uy = -Math.cos(to);
  return { ux, uy, px: -uy, py: ux };
}

function metersPerPixel(lat: number, z: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** z;
}

type RainTile = {
  dx: number;
  dy: number;
  rain: HTMLImageElement | null;
};

function paintRainLayer(
  tiles: RainTile[],
  originX: number,
  originY: number,
  tile: number,
  scale: number,
  cssW: number,
  cssH: number,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(cssW));
  c.height = Math.max(1, Math.round(cssH));
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return c;
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
  return c;
}

function paintOverlayImage(
  img: HTMLImageElement,
  cssW: number,
  cssH: number,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(cssW));
  c.height = Math.max(1, Math.round(cssH));
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, c.width, c.height);
  }
  return c;
}

type FlowGrid = {
  bs: number;
  cols: number;
  rows: number;
  vx: Float32Array;
  vy: Float32Array;
  ax: Float32Array;
  ay: Float32Array;
  g: Float32Array;
  ok: Uint8Array;
  omega: number;
};

function blockMean(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  x0: number,
  y0: number,
  bs: number,
): number {
  let s = 0;
  let n = 0;
  const x1 = Math.min(w, x0 + bs);
  const y1 = Math.min(h, y0 + bs);
  for (let y = Math.max(0, y0); y < y1; y += 1) {
    let i = (y * w + Math.max(0, x0)) * 4 + 3;
    for (let x = Math.max(0, x0); x < x1; x += 1) {
      s += data[i];
      n += 1;
      i += 4;
    }
  }
  return n ? s / n : 0;
}

function blockSad(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  w: number,
  h: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  bs: number,
): number {
  let s = 0;
  for (let y = 0; y < bs; y += 2) {
    const ya = ay + y;
    const yb = by + y;
    if (ya < 0 || yb < 0 || ya >= h || yb >= h) {
      s += 80 * bs;
      continue;
    }
    let ia = (ya * w + ax) * 4 + 3;
    let ib = (yb * w + bx) * 4 + 3;
    for (let x = 0; x < bs; x += 2) {
      const xa = ax + x;
      const xb = bx + x;
      if (xa < 0 || xb < 0 || xa >= w || xb >= w) {
        s += 80;
        ia += 8;
        ib += 8;
        continue;
      }
      s += Math.abs(a[ia] - b[ib]);
      ia += 8;
      ib += 8;
    }
  }
  return s;
}

function measureFlow(
  prev: HTMLCanvasElement,
  next: HTMLCanvasElement,
  dtH: number,
  steerUx: number,
  steerUy: number,
  capPx: number,
): FlowGrid | null {
  const pctx = prev.getContext("2d", { willReadFrequently: true });
  const nctx = next.getContext("2d", { willReadFrequently: true });
  if (!pctx || !nctx) return null;
  const w = prev.width;
  const h = prev.height;
  if (w < 24 || h < 24) return null;
  const a = pctx.getImageData(0, 0, w, h).data;
  const b = nctx.getImageData(0, 0, w, h).data;
  const bs = 12;
  const cols = Math.ceil(w / bs);
  const rows = Math.ceil(h / bs);
  const grid: FlowGrid = {
    bs,
    cols,
    rows,
    vx: new Float32Array(cols * rows),
    vy: new Float32Array(cols * rows),
    ax: new Float32Array(cols * rows),
    ay: new Float32Array(cols * rows),
    g: new Float32Array(cols * rows),
    ok: new Uint8Array(cols * rows),
    omega: 0,
  };
  const search = 18;
  let hits = 0;
  let svx = 0;
  let svy = 0;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x0 = c * bs;
      const y0 = r * bs;
      const i0 = blockMean(a, w, h, x0, y0, bs);
      if (i0 < 10) continue;
      let best = Infinity;
      let bestDx = 0;
      let bestDy = 0;
      for (let dy = -search; dy <= search; dy += 2) {
        for (let dx = -search; dx <= search; dx += 2) {
          const sad = blockSad(a, b, w, h, x0, y0, x0 + dx, y0 + dy, bs);
          if (sad < best) {
            best = sad;
            bestDx = dx;
            bestDy = dy;
          }
        }
      }
      let vx = bestDx / dtH;
      let vy = bestDy / dtH;
      const sp = Math.hypot(vx, vy);
      if (sp > capPx) {
        vx = (vx / sp) * capPx;
        vy = (vy / sp) * capPx;
      }
      const i1 = blockMean(b, w, h, x0 + bestDx, y0 + bestDy, bs);
      const g = Math.max(-0.7, Math.min(1.05, (i1 - i0) / (i0 + 12) / dtH));
      const idx = r * cols + c;
      grid.vx[idx] = vx;
      grid.vy[idx] = vy;
      grid.g[idx] = g;
      grid.ok[idx] = 1;
      hits += 1;
      svx += vx;
      svy += vy;
    }
  }
  if (hits < 3) return null;
  const meanVx = svx / hits;
  const meanVy = svy / hits;
  grid.omega = 0;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const idx = r * cols + c;
      if (grid.ok[idx]) continue;
      let nvx = 0;
      let nvy = 0;
      let ng = 0;
      let n = 0;
      for (let rr = r - 1; rr <= r + 1; rr += 1) {
        for (let cc = c - 1; cc <= c + 1; cc += 1) {
          if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
          const j = rr * cols + cc;
          if (!grid.ok[j]) continue;
          nvx += grid.vx[j];
          nvy += grid.vy[j];
          ng += grid.g[j];
          n += 1;
        }
      }
      if (n) {
        grid.vx[idx] = nvx / n;
        grid.vy[idx] = nvy / n;
        grid.g[idx] = ng / n;
      } else {
        grid.vx[idx] = meanVx;
        grid.vy[idx] = meanVy;
      }
    }
  }
  return grid;
}

function heading(vx: number, vy: number): number {
  return Math.atan2(vy, vx);
}

function wrapAngle(a: number): number {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function mergeFlowPair(earlier: FlowGrid, later: FlowGrid, dtH: number): FlowGrid {
  const n = later.vx.length;
  const out: FlowGrid = {
    ...later,
    vx: new Float32Array(later.vx),
    vy: new Float32Array(later.vy),
    ax: new Float32Array(n),
    ay: new Float32Array(n),
    g: new Float32Array(later.g),
    ok: new Uint8Array(later.ok),
    omega: 0,
  };
  let mvx0 = 0;
  let mvy0 = 0;
  let mvx1 = 0;
  let mvy1 = 0;
  let nh = 0;
  for (let i = 0; i < n; i += 1) {
    if (earlier.ok[i] && later.ok[i]) {
      out.ax[i] = (later.vx[i] - earlier.vx[i]) / dtH;
      out.ay[i] = (later.vy[i] - earlier.vy[i]) / dtH;
      mvx0 += earlier.vx[i];
      mvy0 += earlier.vy[i];
      mvx1 += later.vx[i];
      mvy1 += later.vy[i];
      nh += 1;
    }
  }
  if (nh > 4) {
    out.omega = wrapAngle(heading(mvx1, mvy1) - heading(mvx0, mvy0)) / dtH;
  }
  return out;
}

function lookupFlow(
  grid: FlowGrid,
  x: number,
  y: number,
): { vx: number; vy: number; ax: number; ay: number; g: number } {
  const c = Math.max(0, Math.min(grid.cols - 1, Math.floor(x / grid.bs)));
  const r = Math.max(0, Math.min(grid.rows - 1, Math.floor(y / grid.bs)));
  const i = r * grid.cols + c;
  return {
    vx: grid.vx[i],
    vy: grid.vy[i],
    ax: grid.ax[i],
    ay: grid.ay[i],
    g: grid.g[i],
  };
}

function sampleBilinear(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  x: number,
  y: number,
): [number, number, number, number] {
  if (x < 0 || y < 0 || x >= w - 1 || y >= h - 1) return [0, 0, 0, 0];
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const i00 = (y0 * w + x0) * 4;
  const i10 = i00 + 4;
  const i01 = i00 + w * 4;
  const i11 = i01 + 4;
  const w00 = (1 - fx) * (1 - fy);
  const w10 = fx * (1 - fy);
  const w01 = (1 - fx) * fy;
  const w11 = fx * fy;
  return [
    data[i00] * w00 + data[i10] * w10 + data[i01] * w01 + data[i11] * w11,
    data[i00 + 1] * w00 + data[i10 + 1] * w10 + data[i01 + 1] * w01 + data[i11 + 1] * w11,
    data[i00 + 2] * w00 + data[i10 + 2] * w10 + data[i01 + 2] * w01 + data[i11 + 2] * w11,
    data[i00 + 3] * w00 + data[i10 + 3] * w10 + data[i01 + 3] * w01 + data[i11 + 3] * w11,
  ];
}

function evolveRain(
  source: HTMLCanvasElement,
  grid: FlowGrid,
  hours: number,
  _steerUx: number,
  _steerUy: number,
  _steerPx: number,
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  const sctx = source.getContext("2d", { willReadFrequently: true });
  const octx = out.getContext("2d");
  if (!sctx || !octx) return source;
  const src = sctx.getImageData(0, 0, source.width, source.height);
  const dst = octx.createImageData(source.width, source.height);
  const w = source.width;
  const h = source.height;
  const sd = src.data;
  const dd = dst.data;
  const steps = Math.max(2, Math.min(8, Math.ceil(hours / 0.28)));
  const dt = hours / steps;
  const fade =
    hours <= 0.75 ? 1 : Math.max(0.42, 1 - (hours - 0.75) * 0.16);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let px = x;
      let py = y;
      let tAcc = hours;
      for (let s = 0; s < steps; s += 1) {
        const fl = lookupFlow(grid, px, py);
        let vx = fl.vx + fl.ax * Math.max(0, tAcc - dt);
        let vy = fl.vy + fl.ay * Math.max(0, tAcc - dt);
        const ang = -grid.omega * dt;
        if (Math.abs(ang) > 1e-5) {
          const ca = Math.cos(ang);
          const sa = Math.sin(ang);
          const nvx = vx * ca - vy * sa;
          const nvy = vx * sa + vy * ca;
          vx = nvx;
          vy = nvy;
        }
        px -= vx * dt;
        py -= vy * dt;
        tAcc -= dt;
      }
      const [r, g, b, a] = sampleBilinear(sd, w, h, px, py);
      if (a < 10) continue;
      const fl = lookupFlow(grid, x, y);
      const grow =
        hours < 0.7 ? Math.max(0.94, Math.min(1.12, 1 + fl.g * hours * 0.22)) : 1;
      const i = (y * w + x) * 4;
      dd[i] = r;
      dd[i + 1] = g;
      dd[i + 2] = b;
      dd[i + 3] = Math.min(220, a * grow * fade);
    }
  }
  octx.putImageData(dst, 0, 0);
  return hours < 0.5 ? withSmoke(out) : out;
}

function blurAlpha(a: Uint16Array, w: number, h: number, radius: number): Float32Array {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const k = radius * 2 + 1;
  for (let y = 0; y < h; y += 1) {
    let sum = 0;
    for (let x = -radius; x <= radius; x += 1) {
      sum += a[y * w + Math.max(0, Math.min(w - 1, x))];
    }
    for (let x = 0; x < w; x += 1) {
      tmp[y * w + x] = sum / k;
      const add = a[y * w + Math.min(w - 1, x + radius + 1)];
      const sub = a[y * w + Math.max(0, x - radius)];
      sum += add - sub;
    }
  }
  for (let x = 0; x < w; x += 1) {
    let sum = 0;
    for (let y = -radius; y <= radius; y += 1) {
      sum += tmp[Math.max(0, Math.min(h - 1, y)) * w + x];
    }
    for (let y = 0; y < h; y += 1) {
      out[y * w + x] = sum / k;
      const add = tmp[Math.min(h - 1, y + radius + 1) * w + x];
      const sub = tmp[Math.max(0, y - radius) * w + x];
      sum += add - sub;
    }
  }
  return out;
}

function smokeFringe(data: Uint8ClampedArray, w: number, h: number) {
  const a = new Uint16Array(w * h);
  for (let p = 0, i = 3; i < data.length; i += 4, p += 1) a[p] = data[i];
  const mist = blurAlpha(a, w, h, 2);
  for (let p = 0, i = 0; i < data.length; i += 4, p += 1) {
    const srcA = a[p];
    if (srcA >= 22) continue;
    const fringe = mist[p];
    if (fringe < 14) continue;
    const t = Math.min(1, (fringe - 14) / 70);
    data[i] = 186;
    data[i + 1] = 214;
    data[i + 2] = 226;
    data[i + 3] = Math.min(72, 10 + fringe * 0.38 * t);
  }
}

function withSmoke(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  smokeFringe(img.data, w, h);
  ctx.putImageData(img, 0, 0);
  const wrap = document.createElement("canvas");
  wrap.width = w;
  wrap.height = h;
  const wctx = wrap.getContext("2d");
  if (!wctx) return canvas;
  wctx.imageSmoothingEnabled = true;
  wctx.filter = "blur(0.9px)";
  wctx.drawImage(canvas, 0, 0);
  wctx.filter = "none";
  wctx.globalAlpha = 0.88;
  wctx.drawImage(canvas, 0, 0);
  return wrap;
}

function rainCentroid(canvas: HTMLCanvasElement): { x: number; y: number; mass: number } | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { width, height } = canvas;
  if (width < 4 || height < 4) return null;
  const data = ctx.getImageData(0, 0, width, height).data;
  let mass = 0;
  let sx = 0;
  let sy = 0;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const a = data[(y * width + x) * 4 + 3];
      if (a < 28) continue;
      const w = a / 255;
      mass += w;
      sx += x * w;
      sy += y * w;
    }
  }
  if (mass < 12) return null;
  return { x: sx / mass, y: sy / mass, mass };
}

function integrateShift(args: {
  hours: number;
  vx: number;
  vy: number;
  steerUx: number;
  steerUy: number;
  steerPxPerHour: number;
}): { x: number; y: number } {
  const step = 0.25;
  let { vx, vy } = args;
  let x = 0;
  let y = 0;
  for (let t = 0; t < args.hours; ) {
    const dt = Math.min(step, args.hours - t);
    const sp = Math.hypot(vx, vy);
    const ux = sp > 0.4 ? vx / sp : args.steerUx;
    const uy = sp > 0.4 ? vy / sp : args.steerUy;
    const turn = Math.min(0.28, 0.1 + t * 0.045);
    const hx = ux * (1 - turn) + args.steerUx * turn;
    const hy = uy * (1 - turn) + args.steerUy * turn;
    const hn = Math.hypot(hx, hy) || 1;
    const speed = sp * (1 - turn * 0.65) + args.steerPxPerHour * (turn * 0.65);
    vx = (hx / hn) * speed;
    vy = (hy / hn) * speed;
    x += vx * dt;
    y += vy * dt;
    t += dt;
  }
  return { x, y };
}

function radarRgba(mm: number): [number, number, number, number] {
  const t = Math.min(1, Math.log2(1 + mm * 3.4) / 3.6);
  if (t < 0.4) {
    const u = t / 0.4;
    return [36 + u * 20, 110 + u * 70, 118 + u * 10, 22 + u * 90];
  }
  if (t < 0.72) {
    const u = (t - 0.4) / 0.32;
    return [70 + u * 150, 175 + u * 35, 70 - u * 35, 110 + u * 45];
  }
  const u = (t - 0.72) / 0.28;
  return [210 + u * 40, 200 - u * 130, 36, 155 + u * 50];
}

function drawForecastField(
  ctx: CanvasRenderingContext2D,
  cells: PrecipCell[],
  cssW: number,
  cssH: number,
  originX: number,
  originY: number,
  tile: number,
  scale: number,
  z: number,
  x0: number,
  y0: number,
  windDir: number,
  alpha = 0.85,
) {
  const seeds = cells
    .filter((c) => c.precipMm >= 0.04 || (c.chance ?? 0) >= 38)
    .map((c) => ({
      x: originX + (lon2tile(c.longitude, z) - x0) * tile * scale,
      y: originY + (lat2tile(c.latitude, z) - y0) * tile * scale,
      mm: Math.max(c.precipMm, 0.05),
      dir: c.windDir ?? windDir,
    }));
  if (!seeds.length) return;

  const pts: { x: number; y: number; mm: number; ux: number; uy: number }[] = [];
  for (const s of seeds) {
    const axes = windAxes(s.dir);
    const { ux, uy, px, py } = axes;
    pts.push({ x: s.x, y: s.y, mm: s.mm, ux, uy });
    for (const along of [-1.6, -0.9, -0.4, 0.45, 0.95, 1.55, 2.2]) {
      const fall = 1 - Math.min(0.72, Math.abs(along) * 0.26);
      pts.push({
        x: s.x + ux * along * 34,
        y: s.y + uy * along * 34,
        mm: s.mm * fall,
        ux,
        uy,
      });
    }
    pts.push({
      x: s.x + px * 11,
      y: s.y + py * 11,
      mm: s.mm * 0.38,
      ux,
      uy,
    });
    pts.push({
      x: s.x - px * 11,
      y: s.y - py * 11,
      mm: s.mm * 0.38,
      ux,
      uy,
    });
  }

  const step = 2;
  const w = Math.max(1, Math.ceil(cssW / step));
  const h = Math.max(1, Math.ceil(cssH / step));
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const octx = off.getContext("2d");
  if (!octx) return;
  const img = octx.createImageData(w, h);
  const data = img.data;
  const { ux: gux, uy: guy, px: gpx, py: gpy } = windAxes(windDir);

  for (let iy = 0; iy < h; iy += 1) {
    for (let ix = 0; ix < w; ix += 1) {
      const n0 = fbm(ix * 0.045, iy * 0.045);
      const n1 = fbm(ix * 0.11 + 4, iy * 0.1);
      const x = (ix + 0.5) * step + gux * (n0 - 0.5) * 38 + gpx * (n1 - 0.5) * 9;
      const y = (iy + 0.5) * step + guy * (n0 - 0.5) * 38 + gpy * (n1 - 0.5) * 9;
      let num = 0;
      let den = 0;
      for (const p of pts) {
        const dx = x - p.x;
        const dy = y - p.y;
        const along = dx * p.ux + dy * p.uy;
        const across = dx * -p.uy + dy * p.ux;
        const d2 = (along / 52) ** 2 + (across / 13) ** 2;
        if (d2 > 1.15) continue;
        const wt = (1 - d2) * (1 - d2);
        num += p.mm * wt;
        den += wt;
      }
      if (den <= 0) continue;
      const ragged = 0.42 + 0.58 * fbm(ix * 0.09 + 9, iy * 0.08);
      let mm = (num / den) * ragged;
      if (mm < 0.07) continue;
      const [r, g, b, a] = radarRgba(mm);
      const i = (iy * w + ix) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = Math.min(200, a * alpha);
    }
  }
  octx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(off, 0, 0, cssW, cssH);
  ctx.restore();
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
  z: number;
  x0: number;
  y0: number;
  hoursAhead: number;
  shiftX: number;
  shiftY: number;
  cells?: PrecipCell[];
  advectRain?: RainTile[];
  evolvedRain?: HTMLCanvasElement | null;
  overlay?: HTMLImageElement | null;
}): HTMLCanvasElement {
  const {
    cssW,
    cssH,
    dpr,
    tiles,
    originX,
    originY,
    tile,
    scale,
    windDir,
    z,
    x0,
    y0,
    hoursAhead,
    shiftX,
    shiftY,
    cells,
    advectRain,
    evolvedRain,
    overlay,
  } = args;
  const off = document.createElement("canvas");
  off.width = Math.round(cssW * dpr);
  off.height = Math.round(cssH * dpr);
  const ctx = off.getContext("2d");
  if (!ctx) return off;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const root = getComputedStyle(document.documentElement);
  const raised = root.getPropertyValue("--color-raised").trim() || "#131a21";
  const rain = root.getPropertyValue("--color-rain").trim() || "#7eb4c6";
  const fg = root.getPropertyValue("--color-fg").trim() || "#e7eef4";
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

  const radarAlpha = hoursAhead <= 0 ? 1 : Math.max(0.9, 1 - hoursAhead * 0.018);
  const modelAlpha = hoursAhead <= 0 ? 0 : Math.min(0.72, 0.08 + hoursAhead * 0.11);

  if (overlay) {
    ctx.save();
    ctx.globalAlpha = radarAlpha;
    ctx.drawImage(overlay, 0, 0, cssW, cssH);
    ctx.restore();
  } else if (evolvedRain && radarAlpha > 0.04) {
    ctx.save();
    ctx.globalAlpha = radarAlpha;
    ctx.drawImage(evolvedRain, 0, 0, cssW, cssH);
    ctx.restore();
  } else if (advectRain?.length && radarAlpha > 0.04) {
    ctx.save();
    ctx.globalAlpha = radarAlpha;
    for (const t of advectRain) {
      if (!t.rain) continue;
      ctx.drawImage(
        t.rain,
        originX + t.dx * tile * scale + shiftX,
        originY + t.dy * tile * scale + shiftY,
        tile * scale,
        tile * scale,
      );
    }
    ctx.restore();
  } else {
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
  }

  if (cells?.length && (hoursAhead > 0.05 || !evolvedRain)) {
    const hasRadar = Boolean(evolvedRain || advectRain?.some((t) => t.rain));
    drawForecastField(
      ctx,
      cells,
      cssW,
      cssH,
      originX,
      originY,
      tile,
      scale,
      z,
      x0,
      y0,
      windDir,
      hasRadar ? modelAlpha : Math.max(modelAlpha, 0.62),
    );
  }
  ctx.globalAlpha = 1;
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

type ViewMode = "inline" | "page" | "os";

export function RadarMap({
  forecast,
  units,
}: {
  forecast: Forecast;
  units: Units;
}) {
  const { locale, t } = useT();
  const { place, current } = forecast;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(6);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [visualPan, setVisualPan] = useState({ x: 0, y: 0 });
  const panRef = useRef(pan);
  panRef.current = pan;
  const panDrag = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [mode, setMode] = useState<ViewMode>("inline");
  const lastBitmap = useRef<HTMLCanvasElement | null>(null);
  const fadeRaf = useRef(0);
  const readyRef = useRef(false);
  const frameBitmaps = useRef(new Map<string, HTMLCanvasElement>());

  const catalogQuery = useQuery({
    queryKey: ["radar-catalog"],
    queryFn: () => fetchRadarCatalog(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  const mscQuery = useQuery({
    queryKey: ["msc-radar"],
    queryFn: () => fetchMscRadar(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: inMscDomain(place.latitude, place.longitude),
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
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  const gridQuery = useQuery({
    queryKey: ["precip-grid", place.latitude.toFixed(2), place.longitude.toFixed(2)],
    queryFn: () =>
      fetchPrecipGrid({
        data: { latitude: place.latitude, longitude: place.longitude },
      }),
    staleTime: 8 * 60 * 1000,
  });

  const frames = useMemo(
    () =>
      buildRadarTimeline({
        catalog: catalogQuery.data?.frames ?? [],
        grid: gridQuery.data ?? [],
        msc: inMscDomain(place.latitude, place.longitude)
          ? mscQuery.data
          : null,
        stepSec: 10 * 60,
        futureHours: 1,
      }),
    [
      catalogQuery.data?.frames,
      gridQuery.data,
      mscQuery.data,
      place.latitude,
      place.longitude,
    ],
  );
  const nowIdx = useMemo(() => nowFrameIndex(frames), [frames]);

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
  const sliderFrame: RadarFrame | undefined =
    frames[Math.min(frame, Math.max(0, frames.length - 1))];
  const active = sliderFrame;
  const hasForecast = frames.some((f) => f.kind === "forecast");
  const isForecast = sliderFrame?.kind === "forecast";

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("button, input, a, [data-no-pan]")) return;
      panDrag.current = {
        pid: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        ox: panRef.current.x,
        oy: panRef.current.y,
        moved: false,
      };
      try { el.setPointerCapture(e.pointerId); } catch {}
    };
    const onMove = (e: PointerEvent) => {
      const d = panDrag.current as any;
      if (!d || d.pid !== e.pointerId) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) < 4) return;
      d.moved = true;
      e.preventDefault();
      setVisualPan({ x: dx, y: dy });
    };
    const onUp = (e: PointerEvent) => {
      const d = panDrag.current as any;
      if (!d || d.pid !== e.pointerId) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      panDrag.current = null;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      if (!d.moved) {
        setVisualPan({ x: 0, y: 0 });
        return;
      }
      setPan({ x: d.ox + dx, y: d.oy + dy });
      setVisualPan({ x: 0, y: 0 });
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove, { passive: false });
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [mode]);

  useEffect(() => {
    if (!frames.length) return;
    setFrame(nowIdx);
  }, [frames, nowIdx]);

  useEffect(() => {
    setPan({ x: 0, y: 0 });
    setVisualPan({ x: 0, y: 0 });
  }, [place.latitude, place.longitude]);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const id = window.setInterval(() => {
      setFrame((i) => (i + 1) % frames.length);
    }, 420);
    return () => window.clearInterval(id);
  }, [playing, frames.length]);

  useEffect(() => {
    if (mode === "inline") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        void document.exitFullscreen?.();
        setMode("inline");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "os") return;
    const el = overlayRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> })
      | null;
    if (!el) return;
    const req = el.requestFullscreen ?? el.webkitRequestFullscreen;
    void Promise.resolve(req?.call(el)).catch(() => setMode("page"));
    const onFs = () => {
      if (!document.fullscreenElement) setMode((m) => (m === "os" ? "page" : m));
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [mode]);

  const tilePlan = useMemo(() => {
    const z = zoom;
    const w = size.w > 8 ? size.w : 320;
    const scale = w / 2.15 / 256;
    const cx = lon2tile(place.longitude, z) - pan.x / (256 * scale);
    const cy = lat2tile(place.latitude, z) - pan.y / (256 * scale);
    return { z, cx, cy };
  }, [place.latitude, place.longitude, zoom, pan.x, pan.y, size.w]);

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
    const { z, cx, cy } = tilePlan;
    cancelRadarLoads();
    let cancelled = false;
    const bitmapKey = `${active.time}-${cssW}x${cssH}-${z}-${cx.toFixed(3)}-${cy.toFixed(3)}-${active.overlay ?? active.kind}`;
    const cachedFrame = frameBitmaps.current.get(bitmapKey);
    if (cachedFrame) {
      lastBitmap.current = cachedFrame;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.drawImage(cachedFrame, 0, 0, pixelW, pixelH);
      readyRef.current = true;
      setReady(true);
      return;
    }

    const tile = 256;
    const scale = cssW / 2.15 / tile;
    const originX = cssW / 2 - (cx - Math.floor(cx - 2)) * tile * scale;
    const originY = cssH / 2 - (cy - Math.floor(cy - 2)) * tile * scale;
    const x0 = Math.floor(cx - 2);
    const y0 = Math.floor(cy - 2);

    const loadTiles = (f: RadarFrame) => {
      const jobs: Promise<{
        dx: number;
        dy: number;
        base: HTMLImageElement | null;
        rain: HTMLImageElement | null;
      }>[] = [];
      for (let dx = 0; dx < 5; dx += 1) {
        for (let dy = 0; dy < 5; dy += 1) {
          const tx = x0 + dx;
          const ty = y0 + dy;
          const max = 2 ** z;
          if (ty < 0 || ty >= max) continue;
          const wx = ((tx % max) + max) % max;
          const rainUrl = f.tileUrl
            ? f.tileUrl
                .replace("{z}", String(z))
                .replace("{x}", String(wx))
                .replace("{y}", String(ty))
            : "";
          jobs.push(
            Promise.all([
              loadImg(`${BASE}/${z}/${wx}/${ty}@2x.png`, true),
              rainUrl ? loadImg(rainUrl, false) : Promise.resolve(null),
            ]).then(([base, rain]) => ({ dx, dy, base, rain })),
          );
        }
      }
      return Promise.all(jobs);
    };

    void (async () => {
      const tiles = await loadTiles(active);
      if (cancelled) return;
      const bbox = viewBBox3857({
        lat: tile2lat(cy, z),
        lon: tile2lon(cx, z),
        z,
        cssW,
        cssH,
      });
      const overlayUrl = active.overlay
        ? mscGetMapUrl({
            layer: overlayLayer(active.overlay),
            time: active.time,
            bbox,
            width: cssW,
            height: cssH,
          })
        : "";
      const overlay = overlayUrl ? await loadImg(overlayUrl, false) : null;
      if (cancelled) return;
      const isFc = active.kind === "forecast";
      const mscObsFrames = frames.filter((f) => f.overlay === "msc-obs");
      const mscFcFrames = frames.filter((f) => f.overlay === "msc-fc");
      const mscSource = mscFcFrames.at(-1) ?? mscObsFrames.at(-1);
      const overlayFor = (f: RadarFrame | undefined, keep: boolean) => {
        if (!f?.overlay) return Promise.resolve(null as HTMLImageElement | null);
        return loadImg(
          mscGetMapUrl({
            layer: overlayLayer(f.overlay),
            time: f.time,
            bbox,
            width: cssW,
            height: cssH,
          }),
          keep,
        );
      };
      const withTiles = frames.filter((f) => f.tileUrl);
      const nowSec = Date.now() / 1000;
      const catalogPast = (catalogQuery.data?.frames ?? [])
        .filter((f) => f.tileUrl && f.time <= nowSec + 90)
        .slice()
        .sort((a, b) => a.time - b.time);
      const source = withTiles.at(-1);
      const nPast = catalogPast.length;
      const trackNow = catalogPast.at(-1);
      const trackMid =
        nPast >= 7 ? catalogPast[nPast - 7] : catalogPast.at(-Math.min(nPast, 4));
      const trackOld = nPast >= 3 ? catalogPast[0] : undefined;
      const skipTrack = Boolean(overlay);
      const useMsc = Boolean(!overlay && isFc && mscSource);
      const advectRain =
        !skipTrack && !useMsc && isFc && source && source !== active
          ? await loadTiles(source)
          : undefined;
      const [nowRain, midRain, oldRain] =
        skipTrack || useMsc
          ? [undefined, undefined, undefined]
          : await Promise.all([
              isFc && trackNow ? loadTiles(trackNow) : Promise.resolve(undefined),
              isFc && trackMid && trackMid !== trackNow
                ? loadTiles(trackMid)
                : Promise.resolve(undefined),
              isFc && trackOld && trackOld !== trackMid
                ? loadTiles(trackOld)
                : Promise.resolve(undefined),
            ]);
      if (cancelled) return;

      const hoursAhead =
        active.overlay === "msc-fc"
          ? 0
          : useMsc && mscSource
            ? Math.max(0, (active.time - mscSource.time) / 3600)
            : isFc && source
              ? Math.max(0, (active.time - source.time) / 3600)
              : 0;
      const { ux, uy } = windAxes(current.windDir);
      const mpp = metersPerPixel(place.latitude, z) / Math.max(scale, 0.2);
      const steerKmh = Math.max(current.windSpeedKmh * 1.85, 18);
      const steerPx = (steerKmh * 1000) / mpp;
      const cap = (140 * 1000) / mpp;
      let vx = ux * steerPx;
      let vy = uy * steerPx;
      let evolvedRain: HTMLCanvasElement | null = null;
      if (useMsc && mscSource) {
        const srcImg = await overlayFor(mscSource, true);
        const trackB = mscObsFrames.at(-1);
        const trackA =
          mscObsFrames.length >= 8 ? mscObsFrames.at(-8) : mscObsFrames[0];
        const [aImg, bImg] = await Promise.all([
          overlayFor(trackA, true),
          overlayFor(trackB, true),
        ]);
        if (cancelled) return;
        if (srcImg && aImg && bImg && trackA && trackB && trackA !== trackB) {
          const sourceC = paintOverlayImage(srcImg, cssW, cssH);
          const earlierC = paintOverlayImage(aImg, cssW, cssH);
          const laterC = paintOverlayImage(bImg, cssW, cssH);
          const dtH = Math.max(0.25, (trackB.time - trackA.time) / 3600);
          const flow = measureFlow(earlierC, laterC, dtH, ux, uy, cap);
          if (flow) {
            evolvedRain = evolveRain(sourceC, flow, hoursAhead, ux, uy, steerPx);
            let mvx = 0;
            let mvy = 0;
            let n = 0;
            for (let i = 0; i < flow.ok.length; i += 1) {
              if (!flow.ok[i]) continue;
              mvx += flow.vx[i];
              mvy += flow.vy[i];
              n += 1;
            }
            if (n) {
              vx = mvx / n;
              vy = mvy / n;
            }
          }
        }
      } else if (!overlay && nowRain && midRain && trackNow && trackMid && advectRain) {
        const laterC = paintRainLayer(
          nowRain,
          originX,
          originY,
          tile,
          scale,
          cssW,
          cssH,
        );
        const midC = paintRainLayer(
          midRain,
          originX,
          originY,
          tile,
          scale,
          cssW,
          cssH,
        );
        const sourceC = paintRainLayer(
          advectRain,
          originX,
          originY,
          tile,
          scale,
          cssW,
          cssH,
        );
        const dtLate = Math.max(0.25, (trackNow.time - trackMid.time) / 3600);
        const flowLate = measureFlow(midC, laterC, dtLate, ux, uy, cap);
        let flow = flowLate;
        if (flowLate && oldRain && trackOld) {
          const oldC = paintRainLayer(
            oldRain,
            originX,
            originY,
            tile,
            scale,
            cssW,
            cssH,
          );
          const dtEarly = Math.max(0.25, (trackMid.time - trackOld.time) / 3600);
          const flowEarly = measureFlow(oldC, midC, dtEarly, ux, uy, cap);
          if (flowEarly) {
            flow = mergeFlowPair(
              flowEarly,
              flowLate,
              Math.max(0.25, (dtEarly + dtLate) / 2),
            );
          }
        }
        if (flow) {
          evolvedRain = evolveRain(sourceC, flow, hoursAhead, ux, uy, steerPx);
          let mvx = 0;
          let mvy = 0;
          let n = 0;
          for (let i = 0; i < flow.ok.length; i += 1) {
            if (!flow.ok[i]) continue;
            mvx += flow.vx[i];
            mvy += flow.vy[i];
            n += 1;
          }
          if (n) {
            vx = mvx / n;
            vy = mvy / n;
          }
        }
      }
      if (!evolvedRain) {
        const drift = integrateShift({
          hours: hoursAhead,
          vx,
          vy,
          steerUx: ux,
          steerUy: uy,
          steerPxPerHour: steerPx,
        });
        vx = drift.x;
        vy = drift.y;
      }
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
        z,
        x0,
        y0,
        hoursAhead,
        shiftX: evolvedRain ? 0 : vx,
        shiftY: evolvedRain ? 0 : vy,
        cells: isFc && !overlay ? active.cells : undefined,
        advectRain: overlay ? undefined : advectRain,
        evolvedRain: overlay ? null : evolvedRain,
        overlay,
      });
      if (cancelled) return;
      frameBitmaps.current.set(bitmapKey, next);
      if (frameBitmaps.current.size > 48) {
        const first = frameBitmaps.current.keys().next().value;
        if (first) frameBitmaps.current.delete(first);
      }
      const prev = lastBitmap.current;
      lastBitmap.current = next;
      cancelAnimationFrame(fadeRaf.current);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      if (!prev || !readyRef.current || !playing) {
        ctx.drawImage(next, 0, 0);
        readyRef.current = true;
        setReady(true);
        return;
      }
      const start = performance.now();
      const dur = 180;
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

    return () => {
      cancelled = true;
      cancelRadarLoads();
      cancelAnimationFrame(fadeRaf.current);
    };
  }, [active, tilePlan, current.windDir, current.windSpeedKmh, place.latitude, size.w, size.h, frames, catalogQuery.data?.frames, playing]);

  const stamp = sliderFrame
    ? new Intl.DateTimeFormat(localeTag(locale), {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(sliderFrame.time * 1000))
    : "—";
  const from = fromThe(current.windDir, locale);
  const fromWord = windLong(current.windDir, locale);
  const etaLabel = arrival ? formatEta(arrival.minutes, locale) : "";
  const snow = precipKind(current.weatherCode) === "snow";
  const kindCap = precipWordCap(current.weatherCode, locale);
  const headline = arrival
    ? arrival.minutes === 0
      ? t(snow ? "snowingNow" : "rainingNow")
      : t("rainEta", { kind: kindCap, label: etaLabel })
    : nowcast?.hours?.length
      ? t(snow ? "noSnowHeaded" : "noRainHeaded")
      : t("watchThe", { from });
  const copy = arrival
    ? arrivalCopy({
        minutes: arrival.minutes,
        km: arrival.km,
        windDir: current.windDir,
        windSpeedKmh: current.windSpeedKmh,
        rainingHere: arrival.minutes === 0,
        locale,
        weatherCode: current.weatherCode,
      })
    : t("radarCopy", { from });

  function closeView() {
    if (document.fullscreenElement) void document.exitFullscreen();
    setMode("inline");
  }

  const panel = (
    <section
      className={cn(
        "min-w-0 overflow-hidden bg-surface",
        mode === "inline"
          ? "rounded-2xl shadow-[var(--shadow-border)] lg:col-span-2"
          : "flex h-full min-h-0 flex-col rounded-none",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
            <Radar className="size-3.5" />
            {t("radar")}
          </p>
          <h2 className="mt-1 font-display text-xl font-medium leading-tight text-fg">
            {headline}
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted">{copy}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-raised px-3 py-2">
            <WindArrow
              deg={current.windDir}
              wet={(arrival?.precipMm ?? current.rain.chance) > 40}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-fg">{t("fromThe", { from: fromWord })}</p>
              <p className="text-[11px] text-muted">
                {formatSpeed(current.windSpeedKmh, units)}
              </p>
            </div>
          </div>
          {mode === "inline" ? (
            <>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-9"
                onClick={() => setMode("page")}
                aria-label={t("fillPage")}
                title={t("fillPage")}
              >
                <Maximize2 className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-9"
                onClick={() => setMode("os")}
                aria-label={t("fullscreen")}
                title={t("fullscreen")}
              >
                <Expand className="size-4" />
              </Button>
            </>
          ) : (
            <>
              {mode === "page" ? (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="size-9"
                  onClick={() => setMode("os")}
                  aria-label="Fullscreen"
                  title="Fullscreen"
                >
                  <Expand className="size-4" />
                </Button>
              ) : null}
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-9"
                onClick={closeView}
                aria-label={t("close")}
              >
                <X className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div
        ref={wrapRef}
        data-no-smooth=""
        className={cn(
          "relative mt-3 w-full overflow-hidden bg-raised touch-none",
          "cursor-grab active:cursor-grabbing select-none",
          mode === "inline" ? "h-[240px] sm:h-[300px]" : "min-h-0 flex-1",
        )}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          style={{
            transform: `translate(${visualPan.x}px, ${visualPan.y}px)`,
            willChange: visualPan.x || visualPan.y ? "transform" : "auto",
          }}
          aria-label={t("radarAria", { name: place.name })}
        />
        {!ready && !catalogQuery.isError ? (
          <div className="absolute inset-0 animate-pulse bg-raised" />
        ) : null}
        {catalogQuery.isError && !frames.length ? (
          <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-muted">
            {t("radarUnavailable")}
          </p>
        ) : null}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1">
          <p className="rounded-md bg-bg/75 px-2 py-1 text-[11px] text-fg backdrop-blur-sm">
            {place.name}
          </p>
          <p
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-medium backdrop-blur-sm",
              isForecast ? "bg-accent text-accent-fg" : "bg-bg/75 text-muted",
            )}
          >
            {isForecast ? t("forecastStamp", { stamp }) : stamp}
          </p>
        </div>
        <div className="absolute right-3 top-3 flex gap-1" data-no-pan="">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="size-9"
            disabled={pan.x === 0 && pan.y === 0}
            onClick={() => { setPan({ x: 0, y: 0 }); setVisualPan({ x: 0, y: 0 }); }}
            aria-label={t("youAreHere")}
            title={t("youAreHere")}
          >
            <Crosshair className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="size-9"
            disabled={zoom <= MIN_Z}
            onClick={() => setZoom((z) => Math.max(MIN_Z, z - 1))}
            aria-label={t("zoomOut")}
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
            aria-label={t("zoomIn")}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <p className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-bg/75 px-2 py-1 text-[11px] text-muted backdrop-blur-sm">
          {t("youAreHere")}
        </p>
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-bg/75 px-2 py-1 text-[11px] text-muted backdrop-blur-sm">
          <span>{t("radarLight")}</span>
          <span
            className="h-1.5 w-14 rounded-full sm:w-16"
            style={{
              background:
                "linear-gradient(90deg,#7eb4c6 0%,#3dd68c 38%,#f5d76e 68%,#e07a3d 86%,#c17a6a 100%)",
            }}
          />
          <span>{t("radarHeavy")}</span>
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
          {playing ? t("pause") : t("play")}
        </Button>
        <div className="min-w-0 flex-1">
          <div className="relative">
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
              aria-label={t("radarTimeAria")}
            />
            {frames.length > 1 ? (
              <span
                className="pointer-events-none absolute top-0 h-2 w-px bg-fg/70"
                style={{
                  left: `${(nowIdx / Math.max(1, frames.length - 1)) * 100}%`,
                }}
                aria-hidden
              />
            ) : null}
          </div>
          <div className="relative mt-1 h-4 text-[11px] text-faint">
            <span className="absolute left-0">
              -{Math.max(1, Math.round(((frames[nowIdx]?.time ?? 0) - (frames[0]?.time ?? 0)) / 3600))}h
            </span>
            <span
              className="absolute -translate-x-1/2 text-muted"
              style={{
                left: `${frames.length > 1 ? (nowIdx / (frames.length - 1)) * 100 : 50}%`,
              }}
            >
              {t("now")}
            </span>
            {hasForecast ? <span className="absolute right-0">+1h</span> : null}
          </div>
        </div>
      </div>

      {hours.length && mode === "inline" ? (
        <div className="border-t border-border px-4 py-3 sm:px-5">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
            {t("next6")}
          </p>
          <HScroll label={t("next6")}>
            {hours.map((h, i) => {
              const dryLabel = t("statusDry");
              const status = hourStatus(
                h,
                snow ? t("statusSnowing") : t("statusRaining"),
                t("statusOnTheWay"),
                t("statusPossible"),
                dryLabel,
              );
              const wet = status !== dryLabel;
              return (
                <div
                  key={h.time}
                  className={cn(
                    "flex w-[4.6rem] shrink-0 flex-col items-center gap-1 rounded-xl px-1 py-2",
                    i === 0 ? "bg-raised" : "",
                  )}
                >
                  <p className="text-[11px] font-medium text-muted">
                    {i === 0 ? t("now") : formatHour(h.time, locale)}
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
          </HScroll>
        </div>
      ) : null}
    </section>
  );

  if (mode === "inline") return panel;
  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-bg">
      {panel}
    </div>,
    document.body,
  );
}
