import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

type FsNode = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  webkitRequestFullScreen?: () => Promise<void> | void;
};

type FsDoc = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitCancelFullScreen?: () => void;
};

function currentFs(): Element | null {
  const d = document as FsDoc;
  return document.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}

function canOsFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.documentElement as FsNode;
  return Boolean(
    el.requestFullscreen || el.webkitRequestFullscreen || el.webkitRequestFullScreen,
  );
}

export function usePageFullscreen() {
  const [on, setOn] = useState(false);

  const sync = useCallback(() => {
    const os = Boolean(currentFs());
    const fill = document.documentElement.classList.contains("vane-page-fs");
    setOn(os || fill);
    if (!os && !fill) document.documentElement.classList.remove("vane-page-fs");
  }, []);

  useEffect(() => {
    sync();
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        document.documentElement.classList.remove("vane-page-fs");
        sync();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      window.removeEventListener("keydown", onKey);
    };
  }, [sync]);

  const toggle = useCallback(async () => {
    if (on) {
      const d = document as FsDoc;
      if (currentFs()) {
        const exit =
          document.exitFullscreen ?? d.webkitExitFullscreen ?? d.webkitCancelFullScreen;
        try {
          await Promise.resolve(exit?.call(document));
        } catch {
          /* already out */
        }
      }
      document.documentElement.classList.remove("vane-page-fs");
      setOn(false);
      return;
    }
    const el = document.documentElement as FsNode;
    const req =
      el.requestFullscreen ?? el.webkitRequestFullscreen ?? el.webkitRequestFullScreen;
    if (req && canOsFullscreen()) {
      try {
        await Promise.resolve(req.call(el));
        document.documentElement.classList.add("vane-page-fs");
        setOn(true);
        return;
      } catch {
        /* iPhone Safari rejects; fill the visual viewport instead */
      }
    }
    document.documentElement.classList.add("vane-page-fs");
    setOn(true);
  }, [on]);

  return { on, toggle };
}

export function PageFullscreenButton() {
  const { on, toggle } = usePageFullscreen();
  const { t } = useT();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={on ? t("exitFullscreen") : t("fullscreen")}
      aria-pressed={on}
      className="size-9 shrink-0 sm:size-11"
      title={on ? t("exitFullscreen") : t("fullscreen")}
      onClick={() => void toggle()}
    >
      {on ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
    </Button>
  );
}
