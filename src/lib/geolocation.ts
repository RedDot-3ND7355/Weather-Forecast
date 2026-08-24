export class GeoError extends Error {
  constructor(
    message: string,
    readonly kind: "missing" | "denied" | "unavailable" | "timeout" | "inapp",
  ) {
    super(message);
    this.name = "GeoError";
  }
}

export function isAppleTouch(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iP(hone|od|ad)/.test(ua)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
  return navigator.vendor === "Apple Computer, Inc." && "ontouchend" in window;
}

function isInAppBrowser(): boolean {
  const ua = navigator.userAgent;
  return /FBAN|FBAV|Instagram|Twitter|Line\/|WhatsApp|Snapchat|GSA\//.test(ua);
}

function wrap(err: unknown): GeoError {
  const code =
    err && typeof err === "object" && "code" in err
      ? Number((err as GeolocationPositionError).code)
      : 0;
  if (isInAppBrowser()) {
    return new GeoError(
      "Open this page in Safari (not in-app), then tap locate.",
      "inapp",
    );
  }
  if (code === 1) {
    return new GeoError(
      "Location is blocked. iPhone: Settings → Privacy & Security → Location Services → Safari Websites → Allow, then reload.",
      "denied",
    );
  }
  if (code === 3) {
    return new GeoError(
      "Location timed out. Turn on Location Services / Wi-Fi and try again.",
      "timeout",
    );
  }
  return new GeoError(
    "Could not read your location. Check Location Services is on for Safari.",
    "unavailable",
  );
}

/**
 * Start GPS in the same tick as the tap. iOS Safari often ignores
 * getCurrentPosition timeouts and only delivers via watchPosition.
 */
export function readDevicePosition(): Promise<GeolocationPosition> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.reject(
      new GeoError("Location is not available in this browser.", "missing"),
    );
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const watches: number[] = [];

    const done = (fn: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(watchdog);
      window.clearTimeout(lowAcc);
      for (const id of watches) navigator.geolocation.clearWatch(id);
      fn();
    };

    const onOk = (pos: GeolocationPosition) => done(() => resolve(pos));
    const onDenied = (err: GeolocationPositionError) => {
      if (err.code === 1) done(() => reject(wrap(err)));
    };

    const high = {
      enableHighAccuracy: true,
      timeout: 60_000,
      maximumAge: 0,
    } as const;
    const low = {
      enableHighAccuracy: false,
      timeout: 25_000,
      maximumAge: 120_000,
    } as const;

    try {
      watches.push(navigator.geolocation.watchPosition(onOk, onDenied, high));
    } catch (err) {
      done(() => reject(wrap(err)));
      return;
    }
    navigator.geolocation.getCurrentPosition(onOk, onDenied, high);

    const lowAcc = window.setTimeout(() => {
      if (settled) return;
      navigator.geolocation.getCurrentPosition(onOk, onDenied, low);
      try {
        watches.push(navigator.geolocation.watchPosition(onOk, onDenied, low));
      } catch {
        /* ignore */
      }
    }, 2_800);

    const watchdog = window.setTimeout(() => {
      done(() => reject(wrap(Object.assign(new Error("timeout"), { code: 3 }))));
    }, 45_000);
  });
}
