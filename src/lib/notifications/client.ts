/** Browser-side notifications: local (tab open) + Web Push subscribe. */

const SW_URL = "/vane-sw.js";
const PREFS_KEY = "vane-notify-prefs";
const DEDUPE_PREFIX = "vane-notify-dedupe:";

export type NotifyPrefs = {
  /** Show OS notifications while the app is open (no push required). */
  localEnabled: boolean;
  rain: boolean;
  uv: boolean;
};

const defaultPrefs: NotifyPrefs = {
  localEnabled: true,
  rain: true,
  uv: true,
};

export function loadNotifyPrefs(): NotifyPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...defaultPrefs };
    return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {
    return { ...defaultPrefs };
  }
}

export function saveNotifyPrefs(prefs: Partial<NotifyPrefs>): NotifyPrefs {
  const next = { ...loadNotifyPrefs(), ...prefs };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function notificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function permissionState(): NotificationPermission | "unsupported" {
  if (!notificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

/** Dedupe the same alert for a few hours (session + localStorage). */
function shouldDedupe(tag: string, ttlMs = 3 * 60 * 60 * 1000): boolean {
  try {
    const key = DEDUPE_PREFIX + tag;
    const prev = Number(localStorage.getItem(key) || 0);
    if (prev && Date.now() - prev < ttlMs) return true;
    localStorage.setItem(key, String(Date.now()));
    return false;
  } catch {
    return false;
  }
}

/**
 * Local / in-page notification (works without Web Push subscription).
 * Uses the Notification API when permission is granted; no-ops otherwise.
 */
export async function notifyLocal(args: {
  title: string;
  body: string;
  tag: string;
  url?: string;
}): Promise<boolean> {
  if (!notificationSupported()) return false;
  if (Notification.permission !== "granted") return false;
  const prefs = loadNotifyPrefs();
  if (!prefs.localEnabled) return false;
  if (shouldDedupe(args.tag)) return false;

  try {
    // Prefer SW registration so the same UI path works for push + local
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg?.showNotification) {
      await reg.showNotification(args.title, {
        body: args.body,
        icon: "/icons/vane-192.png",
        badge: "/icons/vane-32.png",
        tag: args.tag,
        data: { url: args.url || window.location.href },
      });
      return true;
    }
  } catch {
    /* fall through */
  }

  try {
    const n = new Notification(args.title, {
      body: args.body,
      icon: "/icons/vane-192.png",
      tag: args.tag,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null;
  try {
    return await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export async function subscribePush(args: {
  vapidPublicKey: string;
  latitude?: number;
  longitude?: number;
  placeName?: string;
  locale?: string;
}): Promise<PushSubscriptionJSON | null> {
  if (!pushSupported()) return null;
  const perm = await requestPermission();
  if (perm !== "granted") return null;

  const reg = await ensureServiceWorker();
  if (!reg) return null;
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(args.vapidPublicKey) as BufferSource,
    });
  }
  return sub.toJSON();
}

export async function unsubscribePush(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return true;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  return Boolean(endpoint);
}

export async function currentPushEndpoint(): Promise<string | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return sub?.endpoint ?? null;
}
