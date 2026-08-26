import { Bell, BellOff, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import {
  currentPushEndpoint,
  ensureServiceWorker,
  loadNotifyPrefs,
  notificationSupported,
  permissionState,
  pushSupported,
  requestPermission,
  saveNotifyPrefs,
  subscribePush,
  unsubscribePush,
} from "@/lib/notifications/client";
import { getVapidPublicKey, removePushSubscription, savePushSubscription } from "@/lib/notifications/server";
import { useWeatherStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const iconBtn = "size-9 shrink-0 sm:size-11";

type Mode = "off" | "local" | "push";

function pushKeys(json: PushSubscriptionJSON | null): { endpoint: string; p256dh: string; auth: string } | null {
  const endpoint = json?.endpoint;
  const p256dh = json?.keys?.p256dh;
  const auth = json?.keys?.auth;
  if (!endpoint || !p256dh || !auth) return null;
  return { endpoint, p256dh, auth };
}

export function NotifyToggle() {
  const { t } = useT();
  const place = useWeatherStore((s) => s.place);
  const locale = useWeatherStore((s) => s.locale);
  const [mode, setMode] = useState<Mode>("off");
  const [busy, setBusy] = useState(false);
  const [pushAvailable, setPushAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const perm = permissionState();
      const prefs = loadNotifyPrefs();
      const endpoint = await currentPushEndpoint();
      const vapid = await getVapidPublicKey();
      if (cancelled) return;
      setPushAvailable(Boolean(vapid.publicKey) && pushSupported());
      if (endpoint && perm === "granted") setMode("push");
      else if (perm === "granted" && prefs.localEnabled) setMode("local");
      else setMode("off");
      if (pushSupported()) void ensureServiceWorker();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enableLocal() {
    setBusy(true);
    try {
      const perm = await requestPermission();
      if (perm !== "granted") {
        toast(t("notifyDenied"));
        setMode("off");
        return;
      }
      saveNotifyPrefs({ localEnabled: true, rain: true, uv: true });
      void ensureServiceWorker();
      setMode("local");
      toast(t("notifyLocalOn"));
    } finally {
      setBusy(false);
    }
  }

  async function enablePush() {
    setBusy(true);
    try {
      const { publicKey } = await getVapidPublicKey();
      if (!publicKey) {
        await enableLocal();
        toast(t("notifyPushUnavailable"));
        return;
      }
      const perm = await requestPermission();
      if (perm !== "granted") {
        toast(t("notifyDenied"));
        setMode("off");
        return;
      }
      const json = await subscribePush({
        vapidPublicKey: publicKey,
        latitude: place?.latitude,
        longitude: place?.longitude,
        placeName: place?.name,
        locale,
      });
      const keys = pushKeys(json);
      saveNotifyPrefs({ localEnabled: true, rain: true, uv: true });

      if (!keys) {
        // Permission granted; SW may still be finishing. Treat as local.
        setMode("local");
        toast(t("notifyLocalOn"));
        return;
      }

      setMode("push");
      try {
        await savePushSubscription({
          data: {
            endpoint: keys.endpoint,
            keys: { p256dh: keys.p256dh, auth: keys.auth },
            latitude: place?.latitude,
            longitude: place?.longitude,
            placeName: place?.name,
            locale,
            rainAlerts: true,
            uvAlerts: true,
          },
        });
        toast(t("notifyPushOn"));
      } catch {
        // Browser subscription is live; server table may be missing. Still "on".
        toast(t("notifyPushOn"));
      }
    } catch {
      const endpoint = await currentPushEndpoint();
      if (endpoint) {
        setMode("push");
        toast(t("notifyPushOn"));
        return;
      }
      toast(t("notifyPushFail"));
      saveNotifyPrefs({ localEnabled: true });
      setMode("local");
    } finally {
      setBusy(false);
    }
  }

  async function disableAll() {
    setBusy(true);
    try {
      const endpoint = await currentPushEndpoint();
      if (endpoint) {
        try {
          await removePushSubscription({ data: { endpoint } });
        } catch {
          /* ignore */
        }
        await unsubscribePush();
      }
      saveNotifyPrefs({ localEnabled: false });
      setMode("off");
      toast(t("notifyOff"));
    } finally {
      setBusy(false);
    }
  }

  async function onClick() {
    if (busy) return;
    if (!notificationSupported()) {
      toast(t("notifyUnsupported"));
      return;
    }
    if (mode === "off") {
      if (pushAvailable) await enablePush();
      else await enableLocal();
      return;
    }
    if (mode === "local" && pushAvailable) {
      await enablePush();
      return;
    }
    await disableAll();
  }

  useEffect(() => {
    if (mode !== "push" || !place) return;
    void (async () => {
      try {
        const { publicKey } = await getVapidPublicKey();
        if (!publicKey) return;
        const json = await subscribePush({
          vapidPublicKey: publicKey,
          latitude: place.latitude,
          longitude: place.longitude,
          placeName: place.name,
          locale,
        });
        const keys = pushKeys(json);
        if (!keys) return;
        await savePushSubscription({
          data: {
            endpoint: keys.endpoint,
            keys: { p256dh: keys.p256dh, auth: keys.auth },
            latitude: place.latitude,
            longitude: place.longitude,
            placeName: place.name,
            locale,
          },
        });
      } catch {
        /* ignore */
      }
    })();
  }, [mode, place?.latitude, place?.longitude, place?.name, locale]);

  if (!notificationSupported()) return null;

  const Icon = mode === "push" ? BellRing : mode === "local" ? Bell : BellOff;
  const label =
    mode === "push" ? t("notifyPushOn") : mode === "local" ? t("notifyLocalOn") : t("notifyOff");

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      className={cn(iconBtn, mode !== "off" && "text-accent")}
      disabled={busy}
      onClick={() => void onClick()}
      aria-label={label}
      title={label}
    >
      <Icon className="size-4" />
    </Button>
  );
}
