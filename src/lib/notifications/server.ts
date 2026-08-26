import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

function vapidPublic(): string | null {
  const k = process.env.VAPID_PUBLIC_KEY?.trim();
  return k || null;
}

export const getVapidPublicKey = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ publicKey: string | null }> => {
    return { publicKey: vapidPublic() };
  },
);

const subSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({
    p256dh: z.string().min(8).max(512),
    auth: z.string().min(4).max(256),
  }),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  placeName: z.string().max(120).optional(),
  locale: z.enum(["en", "fr"]).optional(),
  rainAlerts: z.boolean().optional(),
  uvAlerts: z.boolean().optional(),
  userId: z.string().max(128).optional(),
});

export const savePushSubscription = createServerFn({ method: "POST" })
  .validator(subSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    if (!vapidPublic()) {
      // Still store so enabling VAPID later does not require re-subscribe from every client
    }
    const sql = await getSql();
    await sql`
      insert into push_subscriptions (
        endpoint, p256dh, auth, user_id,
        latitude, longitude, place_name,
        rain_alerts, uv_alerts, locale, updated_at
      ) values (
        ${data.endpoint},
        ${data.keys.p256dh},
        ${data.keys.auth},
        ${data.userId ?? null},
        ${data.latitude ?? null},
        ${data.longitude ?? null},
        ${data.placeName ?? null},
        ${data.rainAlerts ?? true},
        ${data.uvAlerts ?? true},
        ${data.locale ?? "en"},
        now()
      )
      on conflict (endpoint) do update set
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        user_id = coalesce(excluded.user_id, push_subscriptions.user_id),
        latitude = coalesce(excluded.latitude, push_subscriptions.latitude),
        longitude = coalesce(excluded.longitude, push_subscriptions.longitude),
        place_name = coalesce(excluded.place_name, push_subscriptions.place_name),
        rain_alerts = excluded.rain_alerts,
        uv_alerts = excluded.uv_alerts,
        locale = excluded.locale,
        updated_at = now()
    `;
    return { ok: true };
  });

export const removePushSubscription = createServerFn({ method: "POST" })
  .validator(z.object({ endpoint: z.string().url().max(2048) }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`delete from push_subscriptions where endpoint = ${data.endpoint}`;
    return { ok: true };
  });
