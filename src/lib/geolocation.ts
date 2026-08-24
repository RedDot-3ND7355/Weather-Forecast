export class GeoError extends Error {
  constructor(
    message: string,
    readonly kind: "missing" | "denied" | "unavailable" | "timeout",
  ) {
    super(message);
    this.name = "GeoError";
  }
}

function once(
  high: boolean,
  timeout: number,
  maximumAge: number,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: high,
      timeout,
      maximumAge,
    });
  });
}

function watchOnce(timeout: number): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        if (settled) return;
        settled = true;
        navigator.geolocation.clearWatch(id);
        resolve(pos);
      },
      (err) => {
        if (settled) return;
        settled = true;
        navigator.geolocation.clearWatch(id);
        reject(err);
      },
      { enableHighAccuracy: true, timeout, maximumAge: 15_000 },
    );
    window.setTimeout(() => {
      if (settled) return;
      settled = true;
      navigator.geolocation.clearWatch(id);
      reject(Object.assign(new Error("timeout"), { code: 3 }));
    }, timeout + 500);
  });
}

function wrap(err: unknown): GeoError {
  const code =
    err && typeof err === "object" && "code" in err
      ? Number((err as GeolocationPositionError).code)
      : 0;
  if (code === 1) {
    return new GeoError(
      "Location is blocked. On iPhone: Settings → Safari → Location, then Allow.",
      "denied",
    );
  }
  if (code === 3) {
    return new GeoError("Location timed out. Try again outside or with Wi-Fi on.", "timeout");
  }
  return new GeoError("Could not read your location.", "unavailable");
}

export async function readDevicePosition(): Promise<GeolocationPosition> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new GeoError("Location is not available in this browser.", "missing");
  }
  try {
    return await once(true, 12_000, 30_000);
  } catch (first) {
    const code =
      first && typeof first === "object" && "code" in first
        ? Number((first as GeolocationPositionError).code)
        : 0;
    if (code === 1) throw wrap(first);
    try {
      return await once(false, 14_000, 60_000);
    } catch (second) {
      const code2 =
        second && typeof second === "object" && "code" in second
          ? Number((second as GeolocationPositionError).code)
          : 0;
      if (code2 === 1) throw wrap(second);
      try {
        return await watchOnce(16_000);
      } catch (third) {
        throw wrap(third);
      }
    }
  }
}
