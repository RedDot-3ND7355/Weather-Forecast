import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { _n as string, mn as object, pn as number } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-6KBaLsha.mjs";
import { t as authMiddleware } from "./middleware-IMSN0vNn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/places-Bd_MAD8U.js
var placeInput = object({
	name: string().trim().min(1).max(120),
	latitude: number().min(-90).max(90),
	longitude: number().min(-180).max(180),
	admin: string().nullable().optional(),
	country: string().nullable().optional()
});
var listPlaces_createServerFn_handler = createServerRpc({
	id: "081437df3557afbac2388d4b291357d3b99a142553e0e9e3a4d9a1077e1662f3",
	name: "listPlaces",
	filename: "src/lib/places.ts"
}, (opts) => listPlaces.__executeServer(opts));
var listPlaces = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listPlaces_createServerFn_handler, async ({ context }) => {
	return (await getSql())`
      select id, name, latitude, longitude, admin, country
      from saved_places
      where user_id = ${context.userId}
      order by created_at desc
    `;
});
var savePlace_createServerFn_handler = createServerRpc({
	id: "f66d8b6132ae1f1dd9832b327b21c23629a045fbbc1dd13c82f07361963325b3",
	name: "savePlace",
	filename: "src/lib/places.ts"
}, (opts) => savePlace.__executeServer(opts));
var savePlace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(placeInput).handler(savePlace_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const existing = await sql`
      select id, name, latitude, longitude, admin, country
      from saved_places
      where user_id = ${context.userId}
        and latitude = ${data.latitude}
        and longitude = ${data.longitude}
      limit 1
    `;
	if (existing[0]) return existing[0];
	return (await sql`
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
    `)[0];
});
var removePlace_createServerFn_handler = createServerRpc({
	id: "21ad410098f5212eb73a8072460c39308832d91ccaec66faff1ebc0abcda6bd9",
	name: "removePlace",
	filename: "src/lib/places.ts"
}, (opts) => removePlace.__executeServer(opts));
var removePlace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: number().int().positive() })).handler(removePlace_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      delete from saved_places
      where id = ${data.id} and user_id = ${context.userId}
    `;
	return { ok: true };
});
//#endregion
export { listPlaces_createServerFn_handler, removePlace_createServerFn_handler, savePlace_createServerFn_handler };
