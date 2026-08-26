import { useEffect } from "react";

const IGNORE =
  "input, textarea, select, [contenteditable], canvas, [data-no-smooth]";

function ignoreTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(IGNORE));
}

function scrollingEl(): Element {
  return (document.scrollingElement as Element) || document.documentElement;
}

function maxY(): number {
  const el = scrollingEl();
  return Math.max(0, el.scrollHeight - window.innerHeight);
}

function clamp(y: number): number {
  return Math.max(0, Math.min(maxY(), y));
}

function isDesktopPointer(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Wheel delta to CSS pixels (mouse wheels often use LINE mode). */
function deltaYPixels(e: WheelEvent): number {
  let dy = e.deltaY;
  if (e.deltaMode === 1) dy *= 16; // lines
  if (e.deltaMode === 2) dy *= window.innerHeight; // pages
  return dy;
}

/** Let nested overflow:auto regions keep native scroll when they can move. */
function nestedCanScroll(target: EventTarget | null, dy: number): boolean {
  if (!(target instanceof Element)) return false;
  let n: Element | null = target;
  while (n && n !== document.body && n !== document.documentElement) {
    const st = window.getComputedStyle(n);
    const oy = st.overflowY;
    if (
      (oy === "auto" || oy === "scroll" || oy === "overlay") &&
      n.scrollHeight > n.clientHeight + 1
    ) {
      if (dy < 0 && n.scrollTop > 0) return true;
      if (dy > 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
    }
    n = n.parentElement;
  }
  return false;
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const html = document.documentElement;

    // Phones / tablets: native compositor scrolling.
    if (!isDesktopPointer()) {
      html.classList.add("vane-native-scroll");
      return () => html.classList.remove("vane-native-scroll");
    }

    html.classList.add("vane-smooth");

    let current = window.scrollY;
    let target = window.scrollY;
    let vel = 0;
    let raf = 0;
    let last = performance.now();
    let coasting = false;
    let driving = false;

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const tick = (now: number) => {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      vel *= Math.pow(0.92, dt);
      target = clamp(target + vel);
      const k = 1 - Math.pow(1 - 0.28, dt);
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.35 && Math.abs(vel) < 0.2) {
        current = target;
        vel = 0;
        coasting = false;
        driving = true;
        window.scrollTo(0, current);
        driving = false;
        raf = 0;
        return;
      }
      driving = true;
      window.scrollTo(0, current);
      driving = false;
      raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // browser zoom
      if (ignoreTarget(e.target)) return;
      const dy = deltaYPixels(e);
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (Math.abs(dy) < 0.01) return;
      if (nestedCanScroll(e.target, dy)) return;
      if (maxY() <= 0) return;

      e.preventDefault();
      // Resync if something else moved the page
      if (!coasting && !driving) {
        current = window.scrollY;
        target = current;
      }
      coasting = true;
      target = clamp(target + dy);
      vel += dy * 0.06;
      kick();
    };

    const onScroll = () => {
      if (driving || coasting) return;
      current = window.scrollY;
      target = current;
      vel = 0;
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      stop();
      html.classList.remove("vane-smooth");
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
