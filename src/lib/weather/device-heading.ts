import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeDeg } from "./compass";

export type HeadingStatus = "off" | "need" | "live" | "denied" | "missing";
export type HeadingHint = "move" | "calibrate" | "settings" | null;

type Orient = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

type PermCtor = {
  requestPermission?: () => Promise<string>;
};

function screenAngle(): number {
  const o = window.screen?.orientation?.angle;
  if (typeof o === "number") return o;
  const legacy = (window as Window & { orientation?: number }).orientation;
  return typeof legacy === "number" ? legacy : 0;
}

function isAppleTouch(): boolean {
  const ua = navigator.userAgent;
  if (/iP(hone|od|ad)/.test(ua)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
  return navigator.vendor === "Apple Computer, Inc." && "ontouchend" in window;
}

function readHeading(e: Orient, apple: boolean): number | null {
  const webkit = e.webkitCompassHeading;
  if (typeof webkit === "number" && Number.isFinite(webkit)) {
    return normalizeDeg(webkit);
  }
  if (apple) return null;
  if (e.absolute === false) return null;
  if (typeof e.alpha !== "number" || !Number.isFinite(e.alpha)) return null;
  return normalizeDeg(-e.alpha + screenAngle());
}

function lerpAngle(from: number, to: number, t: number): number {
  const d = ((to - from + 540) % 360) - 180;
  return normalizeDeg(from + d * t);
}

function canRequest(): boolean {
  return (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as unknown as PermCtor).requestPermission ===
      "function"
  );
}

export function headingSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    (typeof DeviceOrientationEvent !== "undefined" ||
      "ondeviceorientationabsolute" in window)
  );
}

async function requestMotion(): Promise<boolean> {
  const orient = DeviceOrientationEvent as unknown as PermCtor;
  if (typeof orient.requestPermission !== "function") return true;
  const state = await orient.requestPermission();
  if (state !== "granted") return false;
  const motion = DeviceMotionEvent as unknown as PermCtor;
  if (typeof motion.requestPermission === "function") {
    try {
      await motion.requestPermission();
    } catch {
      /* orientation grant is enough */
    }
  }
  return true;
}

export function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [status, setStatus] = useState<HeadingStatus>("off");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [offer, setOffer] = useState(false);
  const [hint, setHint] = useState<HeadingHint>(null);
  const target = useRef<number | null>(null);
  const shown = useRef<number | null>(null);
  const absOk = useRef(false);
  const stop = useRef<(() => void) | null>(null);

  const startListening = useCallback(() => {
    stop.current?.();
    absOk.current = false;
    shown.current = null;
    target.current = null;
    setHint(null);
    const appleNow = isAppleTouch();

    const apply = (e: Event, fromAbsolute: boolean) => {
      const ev = e as Orient;
      const h = readHeading(ev, appleNow);
      if (h == null) return;
      if (fromAbsolute) absOk.current = true;
      else if (absOk.current && !appleNow) return;
      target.current = h;
      if (typeof ev.webkitCompassAccuracy === "number") {
        setAccuracy(ev.webkitCompassAccuracy);
        if (ev.webkitCompassAccuracy < 0) setHint("calibrate");
      }
    };

    const onAbs = (e: Event) => {
      if (appleNow) return;
      apply(e, true);
    };
    const onRel = (e: Event) => apply(e, false);
    const onCalibrate = () => setHint("calibrate");

    window.addEventListener("deviceorientation", onRel, true);
    if (!appleNow) {
      window.addEventListener("deviceorientationabsolute", onAbs, true);
    }
    window.addEventListener("compassneedscalibration", onCalibrate);

    let raf = 0;
    const loop = () => {
      const next = target.current;
      if (next != null) {
        shown.current =
          shown.current == null ? next : lerpAngle(shown.current, next, 0.28);
        const s = shown.current;
        setHeading((prev) => {
          if (prev == null) return s;
          const d = Math.abs(((s - prev + 540) % 360) - 180);
          return d < 0.35 ? prev : s;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const silent = window.setTimeout(() => {
      if (target.current == null) setHint("move");
    }, 1600);
    const stuck = window.setTimeout(() => {
      if (target.current == null) setHint("settings");
    }, 4500);

    stop.current = () => {
      window.removeEventListener("deviceorientation", onRel, true);
      window.removeEventListener("deviceorientationabsolute", onAbs, true);
      window.removeEventListener("compassneedscalibration", onCalibrate);
      cancelAnimationFrame(raf);
      window.clearTimeout(silent);
      window.clearTimeout(stuck);
    };
  }, []);

  useEffect(() => {
    if (!headingSupported()) {
      setStatus("missing");
      return;
    }
    const ios = canRequest() || isAppleTouch();
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (ios) setStatus("need");
    setOffer(ios || coarse);
    return () => stop.current?.();
  }, []);

  const enable = useCallback(async () => {
    if (!headingSupported()) {
      setStatus("missing");
      return;
    }
    try {
      const ok = await requestMotion();
      if (!ok) {
        setStatus("denied");
        return;
      }
      startListening();
      setStatus("live");
    } catch {
      setStatus("denied");
    }
  }, [startListening]);

  const disable = useCallback(() => {
    stop.current?.();
    stop.current = null;
    setHeading(null);
    setAccuracy(null);
    setHint(null);
    target.current = null;
    shown.current = null;
    absOk.current = false;
    setStatus(canRequest() || isAppleTouch() ? "need" : "off");
  }, []);

  return { heading, status, accuracy, offer, hint, enable, disable };
}
