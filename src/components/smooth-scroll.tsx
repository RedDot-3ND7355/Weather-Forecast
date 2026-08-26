import { useEffect } from "react";

const IGNORE =
  "input, textarea, select, [contenteditable], canvas, [data-no-smooth]";

function ignoreTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(IGNORE));
}

function isDesktopPointer(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * With overflow-x: clip/hidden on body, some engines make body the vertical
 * scroller instead of documentElement. Always drive the element that actually moves.
 */
function scrollRoot(): HTMLElement {
  const doc = document.documentElement;
  const body = document.body;
  const se = document.scrollingElement as HTMLElement | null;

  const candidates = [se, doc, body].filter(Boolean) as HTMLElement[];
  let best = doc;
  let bestRoom = 0;
  for (const el of candidates) {
    const room = el.scrollHeight - el.clientHeight;
    if (room > bestRoom) {
      bestRoom = room;
      best = el;
    }
  }
  // Prefer scrollingElement when tied
  if (se && se.scrollHeight - se.clientHeight >= bestRoom - 1) return se;
  return best;
}

function maxY(root: HTMLElement): number {
  return Math.max(0, root.scrollHeight - root.clientHeight);
}

function clamp(root: HTMLElement, y: number): number {
  return Math.max(0, Math.min(maxY(root), y));
}

function readY(root: HTMLElement): number {
  if (root === document.body || root === document.documentElement) {
    return window.scrollY || root.scrollTop || 0;
  }
  return root.scrollTop;
}

function writeY(root: HTMLElement, y: number) {
  if (root === document.documentElement || root === document.body) {
    window.scrollTo(0, y);
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
    return;
  }
  root.scrollTop = y;
}

function deltaYPixels(e: WheelEvent): number {
  let dy = e.deltaY;
  if (e.deltaMode === 1) dy *= 16;
  if (e.deltaMode === 2) dy *= window.innerHeight;
  return dy;
}

function nestedCanScroll(target: EventTarget | null, dy: number): boolean {
  if (!(target instanceof Element)) return false;
  let n: Element | null = target;
  const root = scrollRoot();
  while (n && n !== document.body && n !== document.documentElement && n !== root) {
    const st = window.getComputedStyle(n);
    const oy = st.overflowY;
    if (
      (oy === "auto" || oy === "scroll" || oy === "overlay") &&
      n.scrollHeight > n.clientHeight + 1
    ) {
      if (dy < 0 && (n as HTMLElement).scrollTop > 0) return true;
      if (
        dy > 0 &&
        (n as HTMLElement).scrollTop + n.clientHeight < n.scrollHeight - 1
      ) {
        return true;
      }
    }
    n = n.parentElement;
  }
  return false;
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const html = document.documentElement;

    if (!isDesktopPointer()) {
      html.classList.add("vane-native-scroll");
      return () => html.classList.remove("vane-native-scroll");
    }

    html.classList.add("vane-smooth");

    let root = scrollRoot();
    let current = readY(root);
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
      root = scrollRoot();
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      vel *= Math.pow(0.9, dt);
      target = clamp(root, target + vel);
      const k = 1 - Math.pow(1 - 0.32, dt);
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.3 && Math.abs(vel) < 0.15) {
        current = target;
        vel = 0;
        coasting = false;
        driving = true;
        writeY(root, current);
        driving = false;
        raf = 0;
        return;
      }
      driving = true;
      writeY(root, current);
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
      if (ignoreTarget(e.target)) return;
      const dy = deltaYPixels(e);
      if (Math.abs(e.deltaX) > Math.abs(dy) && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }
      if (Math.abs(dy) < 0.01) return;
      if (nestedCanScroll(e.target, dy)) return;

      root = scrollRoot();
      if (maxY(root) <= 0) return;

      e.preventDefault();
      if (!coasting && !driving) {
        current = readY(root);
        target = current;
      }
      coasting = true;
      target = clamp(root, target + dy);
      vel += dy * 0.08;
      kick();
    };

    const onScroll = () => {
      if (driving || coasting) return;
      root = scrollRoot();
      current = readY(root);
      target = current;
      vel = 0;
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    return () => {
      stop();
      html.classList.remove("vane-smooth");
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  return null;
}
