import { n as t } from "./i18n-Dc3QW1KM.mjs";
import { a as fromThe } from "./rain-BS5ArbSx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/advection-DJZa-R4a.js
var EARTH_KM = 6371;
var FETCH_KM = [
	0,
	25,
	50,
	90,
	140,
	200
];
function offsetKm(lat, lon, bearingDeg, km) {
	if (km === 0) return {
		latitude: lat,
		longitude: lon
	};
	const r = km / EARTH_KM;
	const b = bearingDeg * Math.PI / 180;
	const φ1 = lat * Math.PI / 180;
	const λ1 = lon * Math.PI / 180;
	const φ2 = Math.asin(Math.sin(φ1) * Math.cos(r) + Math.cos(φ1) * Math.sin(r) * Math.cos(b));
	const λ2 = λ1 + Math.atan2(Math.sin(b) * Math.sin(r) * Math.cos(φ1), Math.cos(r) - Math.sin(φ1) * Math.sin(φ2));
	return {
		latitude: φ2 * 180 / Math.PI,
		longitude: (λ2 * 180 / Math.PI + 540) % 360 - 180
	};
}
function travelHours(km, speedKmh) {
	return km / Math.max(speedKmh, 8);
}
function formatEta(minutes, locale = "en") {
	if (minutes <= 8) return t(locale, "etaNow");
	if (minutes < 60) return t(locale, "etaMin", { n: Math.round(minutes / 5) * 5 });
	const h = minutes / 60;
	if (h < 1.6) return t(locale, "etaHour");
	return t(locale, "etaHours", { n: h < 10 ? h.toFixed(1) : Math.round(h) });
}
function arrivalCopy(args) {
	const locale = args.locale ?? "en";
	const from = fromThe(args.windDir, locale);
	if (args.rainingHere) return t(locale, "rainNowCopy", { from });
	if (args.minutes > 720) return t(locale, "rainFarCopy");
	const eta = formatEta(args.minutes, locale);
	const etaLabel = locale === "fr" ? eta.charAt(0).toUpperCase() + eta.slice(1) : capitalize(eta);
	return t(locale, "rainComingCopy", {
		km: Math.round(args.km),
		from,
		speed: Math.round(args.windSpeedKmh),
		eta: etaLabel
	});
}
function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
//#endregion
export { travelHours as a, offsetKm as i, arrivalCopy as n, formatEta as r, FETCH_KM as t };
