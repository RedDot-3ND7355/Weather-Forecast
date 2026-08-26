import { useEffect } from "react";

const IGNORE =
  "input, textarea, select, [contenteditable], canvas, [data-no-smooth]";

function ignoreTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(IGNORE));
}

/** True only for phones/tablets that are primarily touch. Laptops with touchscreens still qualify for smooth wheel. */
function isTouchPrimary(): boolean {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function scrollRoot(): HTMLElement {
  const se = document.scrollingElement as HTMLElement | null;
  if (se) return se;
  return document.documentElement;
}

function maxY(root: HTMLElement): number {
  return Math.max(0, root.scrollHeight - root.clientHeight);
}

function clamp(root: HTMLElement, y: number): number {
  return Math.max(0, Math.min(maxY(root), y));
}

function readY(root: HTMLElement): number {
  return window.scrollY || root.scrollTop || 0;
}

function writeY(y: number) {
  window.scrollTo(0, y);
}

function deltaYPixels(e: WheelEvent): number {
  let dy = e.deltaY;
  if (e.deltaMode === 1) dy *= 16;
  if (e.deltaMode === 2) dy *= Math.max(1, window.innerHeight);
  return dy;
}

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
      const el = n as HTMLElement;
      if (dy < 0 && el.scrollTop > 0) return true;
      if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
    }
    n = n.parentElement;
  }
  return false;
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const html = document.documentElement;

    // Touch phones/tablets: leave compositor scrolling alone.
    if (isTouchPrimary()) {
      html.classList.add("vane-native-scroll");
      return () => html.classList.remove("vane-native-scroll");
    }

    html.classList.add("vane-smooth");

    let current = readY(scrollRoot());
    let target = current;
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
      const root = scrollRoot();
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      vel *= Math.pow(0.88, dt);
      target = clamp(root, target + vel);
      const k = 1 - Math.pow(1 - 0.35, dt);
      current += (target - current) * k;

      if (Math.abs(target - current) < 0.25 && Math.abs(vel) < 0.12) {
        current = target;
        vel = 0;
        coasting = false;
        driving = true;
        writeY(current);
        driving = false;
        raf = 0;
        return;
      }

      driving = true;
      writeY(current);
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
      if (e.ctrlKey) return;
      if (e.defaultPrevented) return;
      if (ignoreTarget(e.target)) return;

      const dy = deltaYPixels(e);
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (Math.abs(dy) < 0.01) return;
      if (nestedCanScroll(e.target, dy)) return;

      const root = scrollRoot();
      if (maxY(root) <= 0) return;

      e.preventDefault();

      if (!coasting && !driving) {
        current = readY(root);
        target = current;
        vel = 0;
      }

      coasting = true;
      target = clamp(root, target + dy);
      vel += dy * 0.1;
      kick();
    };

    const onScroll = () => {
      if (driving || coasting) return;
      current = readY(scrollRoot());
      target = current;
      vel = 0;
    };

    // Bubble phase, non-passive so preventDefault works in Chrome.
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      stop();
      html.classList.remove("vane-smooth");
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
