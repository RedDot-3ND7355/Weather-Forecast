import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function snapLeft(el: HTMLElement): number {
  const kids = [...el.children] as HTMLElement[];
  if (!kids.length) return el.scrollLeft;
  let best = el.scrollLeft;
  let bestD = Infinity;
  for (const kid of kids) {
    const d = Math.abs(kid.offsetLeft - el.scrollLeft);
    if (d < bestD) {
      bestD = d;
      best = kid.offsetLeft;
    }
  }
  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  return Math.max(0, Math.min(max, best));
}

export function HScroll({
  children,
  className,
  contentClassName,
  label = "More items",
  fadeFrom = "from-surface",
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  label?: string;
  fadeFrom?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const skipClick = useRef(false);
  const motion = useRef({ raf: 0, vel: 0, dragging: false });
  const [edge, setEdge] = useState({ left: false, right: false });

  const stopCoast = () => {
    cancelAnimationFrame(motion.current.raf);
    motion.current.raf = 0;
  };

  const settle = () => {
    const el = scroller.current;
    if (!el) return;
    el.style.scrollBehavior = "smooth";
    el.scrollTo({ left: snapLeft(el), behavior: "smooth" });
  };

  const coast = () => {
    const el = scroller.current;
    if (!el) return;
    stopCoast();
    el.style.scrollBehavior = "auto";
    const tick = () => {
      if (motion.current.dragging) return;
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      motion.current.vel *= 0.92;
      el.scrollLeft += motion.current.vel;
      if (el.scrollLeft <= 0 || el.scrollLeft >= max) {
        el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft));
        motion.current.vel = 0;
      }
      if (Math.abs(motion.current.vel) < 0.35) {
        motion.current.vel = 0;
        settle();
        return;
      }
      motion.current.raf = requestAnimationFrame(tick);
    };
    motion.current.raf = requestAnimationFrame(tick);
  };

  const sync = () => {
    const el = scroller.current;
    if (!el) return;
    setEdge({
      left: el.scrollLeft > 6,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 6,
    });
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    el.addEventListener("scroll", sync, { passive: true });
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 4) return;
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY) && e.deltaX !== 0) return;
      e.preventDefault();
      stopCoast();
      const impulse = e.deltaMode === 1 ? e.deltaY * 10 : e.deltaY;
      motion.current.vel += impulse * 0.42;
      coast();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stopCoast();
      ro.disconnect();
      el.removeEventListener("scroll", sync);
      el.removeEventListener("wheel", onWheel);
    };
  }, [children]);

  const overflow = edge.left || edge.right;

  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        ref={scroller}
        className={cn(
          "relative flex min-w-0 touch-pan-x snap-x snap-proximity gap-1.5 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth scroll-px-2 pb-1.5 sm:gap-2",
          "[&>*]:snap-start [&>*]:shrink-0",
          "[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--color-fg)_28%,transparent)_transparent]",
          "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-track]:bg-transparent",
          "cursor-grab active:cursor-grabbing select-none",
          contentClassName,
        )}
        aria-label={label}
        data-h-scroll=""
        style={{ WebkitOverflowScrolling: "touch" }}
        onPointerDown={(e) => {
          if (e.pointerType === "touch") return;
          if (e.button !== 0) return;
          const el = scroller.current;
          if (!el) return;
          stopCoast();
          motion.current.dragging = true;
          motion.current.vel = 0;
          el.style.scrollBehavior = "auto";
          const startX = e.clientX;
          const startScroll = el.scrollLeft;
          let lastX = e.clientX;
          let lastT = performance.now();
          let moved = false;
          const move = (ev: PointerEvent) => {
            const dx = ev.clientX - startX;
            if (Math.abs(dx) < 6 && !moved) return;
            moved = true;
            skipClick.current = true;
            const now = performance.now();
            const dt = Math.max(8, now - lastT);
            motion.current.vel = ((lastX - ev.clientX) / dt) * 16.6;
            lastX = ev.clientX;
            lastT = now;
            el.scrollLeft = startScroll - dx;
          };
          const up = () => {
            motion.current.dragging = false;
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
            window.removeEventListener("pointercancel", up);
            if (moved) coast();
            else settle();
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", up);
          window.addEventListener("pointercancel", up);
        }}
        onClickCapture={(e) => {
          if (!skipClick.current) return;
          e.preventDefault();
          e.stopPropagation();
          skipClick.current = false;
        }}
      >
        {children}
      </div>
      {edge.left ? (
        <div className={cn("pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-linear-to-r to-transparent", fadeFrom)} />
      ) : null}
      {edge.right ? (
        <div className={cn("pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-linear-to-l to-transparent", fadeFrom)} />
      ) : null}
      {overflow ? (
        <>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute top-1/2 left-0 z-10 hidden size-8 -translate-y-1/2 sm:grid"
            disabled={!edge.left}
            aria-label="Scroll left"
            onClick={() =>
              scroller.current?.scrollBy({ left: -220, behavior: "smooth" })
            }
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute top-1/2 right-0 z-10 hidden size-8 -translate-y-1/2 sm:grid"
            disabled={!edge.right}
            aria-label="Scroll right"
            onClick={() =>
              scroller.current?.scrollBy({ left: 220, behavior: "smooth" })
            }
          >
            <ChevronRight className="size-4" />
          </Button>
        </>
      ) : null}
    </div>
  );
}
