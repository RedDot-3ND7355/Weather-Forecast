import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Place } from "@/lib/weather/types";

export type SavedPlace = Place & { id: number };

const placeInput = z.object({
  name: z.string().trim().min(1).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  admin: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

export const listPlaces = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SavedPlace[]> => {
    const sql = await getSql();
    return sql<SavedPlace>`
      select id, name, latitude, longitude, admin, country
      from saved_places
      where user_id = ${context.userId}
      order by created_at desc
    `;
  });

export const savePlace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(placeInput)
  .handler(async ({ context, data }): Promise<SavedPlace> => {
    const sql = await getSql();
    const existing = await sql<SavedPlace>`
      select id, name, latitude, longitude, admin, country
      from saved_places
      where user_id = ${context.userId}
        and latitude = ${data.latitude}
        and longitude = ${data.longitude}
      limit 1
    `;
    if (existing[0]) return existing[0];
    const rows = await sql<SavedPlace>`
      insert into saved_places (user_id, name, latitude, longitude, admin, country)
      values (
        ${context.userId},
        ${data.name},
        ${data.latitude},
        ${data.longitude},
        ${data.admin ?? null},
        ${data.country ?? null}
      )
      returning id, name, latitude, longitude, admin, country
    `;
    return rows[0];
  });

export const removePlace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`
      delete from saved_places
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true };
  });
