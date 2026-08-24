export type FlickSample = { t: number; p: number };

export function pushFlick(buf: FlickSample[], p: number, windowMs = 140) {
  const t = performance.now();
  buf.push({ t, p });
  const cut = t - windowMs;
  while (buf.length > 2 && buf[0].t < cut) buf.shift();
}

/** Pixels per frame from the strongest slice in the last ~140ms. */
export function flickVelocity(buf: FlickSample[]): number {
  if (buf.length < 2) return 0;
  const end = buf[buf.length - 1];
  let best = 0;
  for (const s of buf) {
    const dt = end.t - s.t;
    if (dt < 20 || dt > 160) continue;
    const v = ((s.p - end.p) / dt) * 16.67;
    if (Math.abs(v) > Math.abs(best)) best = v;
  }
  return best;
}
