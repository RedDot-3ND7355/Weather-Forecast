import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { hn as object, mn as number, sn as _enum } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/alerts-DYp8Asfm.js
var UA = "Vane/1.0 (wind-aware weather forecast)";
var cache = /* @__PURE__ */ new Map();
function rank(type) {
	if (type === "warning") return 0;
	if (type === "watch") return 1;
	if (type === "advisory") return 2;
	return 3;
}
function parseType(raw) {
	const s = raw.toLowerCase();
	if (s.includes("warn")) return "warning";
	if (s.includes("watch")) return "watch";
	if (s.includes("advis")) return "advisory";
	return "statement";
}
var fetchAlerts_createServerFn_handler = createServerRpc({
	id: "3bbc7d5fe7f101521c0524ab69abb21e3d70468eaa12be8cee8eee7731ec8064",
	name: "fetchAlerts",
	filename: "src/lib/weather/alerts.ts"
}, (opts) => fetchAlerts.__executeServer(opts));
var fetchAlerts = createServerFn({ method: "GET" }).validator(object({
	latitude: number(),
	longitude: number(),
	language: _enum(["en", "fr"]).optional()
})).handler(fetchAlerts_createServerFn_handler, async ({ data }) => {
	const lang = data.language === "fr" ? "fr" : "en";
	const key = `${data.latitude.toFixed(2)},${data.longitude.toFixed(2)},${lang}`;
	const hit = cache.get(key);
	if (hit && Date.now() - hit.at < 18e4) return hit.value;
	const pad = .55;
	const url = `https://api.weather.gc.ca/collections/weather-alerts/items?f=json&limit=12&bbox=${[
		data.longitude - pad,
		data.latitude - pad,
		data.longitude + pad,
		data.latitude + pad
	].join(",")}`;
	try {
		const res = await fetch(url, { headers: {
			accept: "application/geo+json",
			"user-agent": UA
		} });
		if (!res.ok) {
			cache.set(key, {
				at: Date.now(),
				value: []
			});
			return [];
		}
		const json = await res.json();
		const now = Date.now();
		const value = (json.features ?? []).map((f) => f.properties ?? {}).filter((p) => {
			const status = (p.status_en ?? "").toLowerCase();
			if (status === "ended" || status === "cancelled") return false;
			if (p.expiration_datetime && Date.parse(p.expiration_datetime) < now) return false;
			return Boolean(p.alert_name_en || p.alert_name_fr);
		}).map((p) => ({
			id: `${p.feature_id ?? ""}-${p.alert_code ?? ""}-${p.expiration_datetime ?? ""}`,
			type: parseType(p.alert_type ?? ""),
			name: (lang === "fr" ? p.alert_name_fr : p.alert_name_en) || p.alert_name_en || "",
			area: (lang === "fr" ? p.feature_name_fr : p.feature_name_en) || p.feature_name_en || "",
			text: ((lang === "fr" ? p.alert_text_fr : p.alert_text_en) || p.alert_text_en || "").replace(/\s+/g, " ").trim(),
			expires: p.expiration_datetime ?? null
		})).sort((a, b) => rank(a.type) - rank(b.type)).slice(0, 3);
		cache.set(key, {
			at: Date.now(),
			value
		});
		return value;
	} catch {
		cache.set(key, {
			at: Date.now(),
			value: []
		});
		return [];
	}
});
//#endregion
export { fetchAlerts_createServerFn_handler };
