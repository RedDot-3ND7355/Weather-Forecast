import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { flickVelocity, pushFlick, type FlickSample } from "@/lib/flick";
import { cn } from "@/lib/utils";

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
      if (Math.abs(motion.current.vel) < 0.28) {
        motion.current.vel = 0;
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

    let pointer = -1;
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    let samples: FlickSample[] = [];

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      stopCoast();
      pointer = e.pointerId;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      moved = false;
      samples = [];
      pushFlick(samples, e.clientX);
      motion.current.dragging = true;
      motion.current.vel = 0;
      el.style.scrollBehavior = "auto";
      el.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < 4) return;
      moved = true;
      skipClick.current = true;
      e.preventDefault();
      pushFlick(samples, e.clientX);
      el.scrollLeft = startScroll - dx;
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      pointer = -1;
      motion.current.dragging = false;
      motion.current.vel = flickVelocity(samples);
      if (moved) coast();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove, { passive: false });
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    return () => {
      stopCoast();
      ro.disconnect();
      el.removeEventListener("scroll", sync);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [children]);

  const overflow = edge.left || edge.right;

  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        ref={scroller}
        className={cn(
          "relative flex min-w-0 gap-1.5 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-3 pb-1.5 sm:gap-2",
          "[touch-action:pan-x_pan-y] [-webkit-overflow-scrolling:touch]",
          "[&>*]:shrink-0",
          "[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--color-fg)_28%,transparent)_transparent]",
          "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-track]:bg-transparent",
          "cursor-grab active:cursor-grabbing select-none",
          overflow ? "sm:px-9" : "px-0.5",
          contentClassName,
        )}
        aria-label={label}
        data-h-scroll=""
        style={{ WebkitOverflowScrolling: "touch" }}
        onClickCapture={(e) => {
          if (!skipClick.current) return;
          // Never suppress real UI controls (bookmarks, remove, links)
          const t = e.target as HTMLElement | null;
          if (t?.closest?.("button, a, input, [data-allow-click]")) {
            skipClick.current = false;
            return;
          }
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
      {edge.left ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute top-1/2 left-0 z-10 hidden size-8 -translate-y-1/2 sm:grid"
          aria-label="Scroll left"
          onClick={() =>
            scroller.current?.scrollBy({ left: -220, behavior: "smooth" })
          }
        >
          <ChevronLeft className="size-4" />
        </Button>
      ) : null}
      {edge.right ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute top-1/2 right-0 z-10 hidden size-8 -translate-y-1/2 sm:grid"
          aria-label="Scroll right"
          onClick={() =>
            scroller.current?.scrollBy({ left: 220, behavior: "smooth" })
          }
        >
          <ChevronRight className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
