import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { presenceHeartbeat } from "@/lib/presence";

const KEY = "vane-presence-id";

function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing && existing.length >= 8) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(KEY, id);
    return id;
  } catch {
    return `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function LivePresenceFooter() {
  const { t } = useT();
  // null until mounted so SSR HTML matches the first client paint (fixes React #418)
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const id = sessionId();

    const beat = () => {
      void presenceHeartbeat({ data: { id } })
        .then((res) => {
          if (alive && typeof res.count === "number") setCount(Math.max(1, res.count));
        })
        .catch(() => {
          if (alive) setCount((c) => c ?? 1);
        });
    };

    setCount(1);
    beat();
    const timer = window.setInterval(beat, 15_000);
    const onVis = () => {
      if (document.visibilityState === "visible") beat();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Render nothing on server + first client frame (identical markup)
  if (count === null) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.4rem,env(safe-area-inset-bottom))]"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-surface/92 px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted shadow-[0_-4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <span
          className="size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)] motion-safe:animate-pulse"
          aria-hidden
        />
        <span className="tabular-nums text-fg">{count}</span>
        <span>{count === 1 ? t("liveOne") : t("liveMany")}</span>
      </div>
    </div>
  );
}
