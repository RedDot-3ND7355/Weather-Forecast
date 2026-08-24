import { useEffect } from "react";

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
    let axis: "x" | "y" | null = null;
    let startY = 0;
    let startX = 0;
    let startScroll = 0;
    let lastY = 0;
    let lastT = 0;
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
      vel *= 0.925;
      target = clamp(target + vel);
      current += (target - current) * 0.18;
      if (Math.abs(target - current) < 0.35 && Math.abs(vel) < 0.18) {
        current = target;
        vel = 0;
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
      target = clamp(target + e.deltaY);
      vel += e.deltaY * 0.04;
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
      axis = null;
      const t = e.touches[0];
      startY = t.clientY;
      startX = t.clientX;
      lastY = t.clientY;
      lastT = performance.now();
      startScroll = window.scrollY;
      current = startScroll;
      target = startScroll;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || axis === "x") return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) + 4) {
          axis = "x";
          return;
        }
        if (Math.abs(dy) < 8) return;
        axis = "y";
        dragging = true;
      }
      if (axis !== "y") return;
      e.preventDefault();
      const now = performance.now();
      const dt = Math.max(8, now - lastT);
      vel = ((lastY - t.clientY) / dt) * 16.6;
      lastY = t.clientY;
      lastT = now;
      current = clamp(startScroll - dy);
      target = current;
      driving = true;
      window.scrollTo(0, current);
      driving = false;
    };

    const onTouchEnd = () => {
      if (axis === "y") {
        dragging = false;
        target = clamp(target + vel * 8);
        kick();
      }
      axis = null;
      dragging = false;
    };

    const onScroll = () => {
      if (driving || dragging) return;
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
