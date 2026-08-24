import { i as windLong } from "./compass-BtdnyLVS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/advection-Dpy-6hLP.js
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
function formatEta(minutes) {
	if (minutes <= 8) return "arriving now";
	if (minutes < 60) return `~${Math.round(minutes / 5) * 5} min`;
	const h = minutes / 60;
	if (h < 1.6) return "~1 hour";
	return `~${h < 10 ? h.toFixed(1) : Math.round(h)} hours`;
}
function arrivalCopy(args) {
	const from = windLong(args.windDir);
	if (args.rainingHere) return `It's raining here now. Wind from the ${from} is still feeding it.`;
	if (args.minutes > 720) return `No rain showing upwind of you. The next few hours look dry unless a new band forms.`;
	return `Rain about ${Math.round(args.km)} km away, coming from the ${from} at ${Math.round(args.windSpeedKmh)} km/h. ${capitalize(formatEta(args.minutes))} if the wind holds.`;
}
function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
//#endregion
export { travelHours as a, offsetKm as i, arrivalCopy as n, formatEta as r, FETCH_KM as t };
