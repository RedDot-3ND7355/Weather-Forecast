import { useEffect } from "react";

const IGNORE =
  "input, textarea, select, [contenteditable], canvas, [data-h-scroll], [data-no-smooth]";

function ignore(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(IGNORE));
}

function ignoreExceptStrip(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest("[data-h-scroll]")) return false;
  return ignore(target);
}

function maxY(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function clamp(y: number): number {
  return Math.max(0, Math.min(maxY(), y));
}

function isDesktopPointer(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const html = document.documentElement;

    // Phones / tablets: compositor-thread scrolling at the display rate (120 Hz+).
    // JS scrollTo + preventDefault cannot match that.
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
      vel *= Math.pow(0.935, dt);
      target = clamp(target + vel);
      const k = 1 - Math.pow(1 - 0.22, dt);
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.4 && Math.abs(vel) < 0.22) {
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
      if (e.ctrlKey) return;
      if (ignoreExceptStrip(e.target)) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      coasting = true;
      target = clamp(target + e.deltaY);
      vel += e.deltaY * 0.045;
      kick();
    };

    const onScroll = () => {
      if (driving || coasting) return;
      current = window.scrollY;
      target = current;
      vel = 0;
    };

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
