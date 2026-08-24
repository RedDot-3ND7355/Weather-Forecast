import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeDeg } from "./compass";

export type HeadingStatus = "off" | "need" | "live" | "denied" | "missing";

type Orient = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

function screenAngle(): number {
  const o = window.screen?.orientation?.angle;
  if (typeof o === "number") return o;
  const legacy = (window as Window & { orientation?: number }).orientation;
  return typeof legacy === "number" ? legacy : 0;
}

function readHeading(e: Orient): number | null {
  if (
    typeof e.webkitCompassHeading === "number" &&
    Number.isFinite(e.webkitCompassHeading)
  ) {
    return normalizeDeg(e.webkitCompassHeading);
  }
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
    typeof (
      DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<string>;
      }
    ).requestPermission === "function"
  );
}

export function headingSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    (typeof DeviceOrientationEvent !== "undefined" ||
      "ondeviceorientationabsolute" in window)
  );
}

export function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [status, setStatus] = useState<HeadingStatus>("off");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [offer, setOffer] = useState(false);
  const target = useRef<number | null>(null);
  const shown = useRef<number | null>(null);
  const absSeen = useRef(false);

  useEffect(() => {
    if (!headingSupported()) {
      setStatus("missing");
      return;
    }
    const ios = canRequest();
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (ios) setStatus("need");
    setOffer(ios || coarse);
  }, []);

  useEffect(() => {
    if (status !== "live") return;
    absSeen.current = false;
    shown.current = null;
    target.current = null;

    const onOrient = (e: Event, abs: boolean) => {
      if (abs) absSeen.current = true;
      else if (absSeen.current) return;
      const ev = e as Orient;
      const h = readHeading(ev);
      if (h == null) return;
      target.current = h;
      if (typeof ev.webkitCompassAccuracy === "number") {
        setAccuracy(ev.webkitCompassAccuracy);
      }
    };
    const onAbs = (e: Event) => onOrient(e, true);
    const onRel = (e: Event) => onOrient(e, false);
    window.addEventListener("deviceorientationabsolute", onAbs);
    window.addEventListener("deviceorientation", onRel);

    let raf = 0;
    const loop = () => {
      const next = target.current;
      if (next != null) {
        shown.current =
          shown.current == null ? next : lerpAngle(shown.current, next, 0.22);
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

    return () => {
      window.removeEventListener("deviceorientationabsolute", onAbs);
      window.removeEventListener("deviceorientation", onRel);
      cancelAnimationFrame(raf);
    };
  }, [status]);

  const enable = useCallback(async () => {
    if (!headingSupported()) {
      setStatus("missing");
      return;
    }
    try {
      if (canRequest()) {
        const perm = await (
          DeviceOrientationEvent as typeof DeviceOrientationEvent & {
            requestPermission: () => Promise<string>;
          }
        ).requestPermission();
        if (perm !== "granted") {
          setStatus("denied");
          return;
        }
      }
      setStatus("live");
    } catch {
      setStatus("denied");
    }
  }, []);

  const disable = useCallback(() => {
    setHeading(null);
    setAccuracy(null);
    target.current = null;
    shown.current = null;
    setStatus(canRequest() ? "need" : "off");
  }, []);

  return { heading, status, accuracy, offer, enable, disable };
}
