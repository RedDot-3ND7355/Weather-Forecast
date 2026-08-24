import { useEffect } from "react";
import { flickVelocity, pushFlick, type FlickSample } from "@/lib/flick";

const IGNORE =
  "input, textarea, select, [contenteditable], canvas, [data-h-scroll], [data-no-smooth]";

function ignore(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(IGNORE));
}

function maxY(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function clamp(y: number): number {
  return Math.max(0, Math.min(maxY(), y));
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const html = document.documentElement;
    html.classList.add("vane-smooth");

    let current = window.scrollY;
    let target = window.scrollY;
    let vel = 0;
    let raf = 0;
    let dragging = false;
    let coasting = false;
    let axis: "x" | "y" | null = null;
    let startY = 0;
    let startX = 0;
    let startScroll = 0;
    let samples: FlickSample[] = [];
    let driving = false;

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const tick = () => {
      if (dragging) {
        raf = requestAnimationFrame(tick);
        return;
      }
      vel *= 0.935;
      target = clamp(target + vel);
      current += (target - current) * 0.22;
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
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      if (ignore(e.target)) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      coasting = true;
      target = clamp(target + e.deltaY);
      vel += e.deltaY * 0.045;
      kick();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        axis = null;
        dragging = false;
        return;
      }
      if (ignore(e.target)) {
        axis = "x";
        return;
      }
      stop();
      vel = 0;
      coasting = false;
      axis = null;
      const t = e.touches[0];
      startY = t.clientY;
      startX = t.clientX;
      startScroll = window.scrollY;
      current = startScroll;
      target = startScroll;
      samples = [];
      pushFlick(samples, t.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || axis === "x") return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) + 2) {
          axis = "x";
          return;
        }
        if (Math.abs(dy) < 4) return;
        axis = "y";
        dragging = true;
      }
      if (axis !== "y") return;
      e.preventDefault();
      pushFlick(samples, t.clientY);
      current = clamp(startScroll - dy);
      target = current;
      driving = true;
      window.scrollTo(0, current);
      driving = false;
    };

    const onTouchEnd = () => {
      if (axis === "y") {
        vel = flickVelocity(samples);
        dragging = false;
        coasting = true;
        kick();
      }
      axis = null;
      dragging = false;
    };

    const onScroll = () => {
      if (driving || dragging || coasting) return;
      current = window.scrollY;
      target = current;
      vel = 0;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      stop();
      html.classList.remove("vane-smooth");
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
