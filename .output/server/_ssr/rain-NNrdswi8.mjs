import { n as t } from "./i18n-DOJG_y5Q.mjs";
import { A as CloudSnow, M as CloudLightning, N as CloudFog, O as Cloud, P as CloudDrizzle, j as CloudRain, k as CloudSun, p as Moon, s as Sun } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rain-NNrdswi8.js
function precipKind(code) {
	if (code >= 71 && code <= 77 || code === 85 || code === 86) return "snow";
	return "rain";
}
function precipWord(code, locale = "en") {
	return precipKind(code) === "snow" ? t(locale, "snowWord") : t(locale, "rainWord");
}
function precipWordCap(code, locale = "en") {
	const w = precipWord(code, locale);
	return w.charAt(0).toUpperCase() + w.slice(1);
}
function weatherLabel(code, locale = "en") {
	if (code === 0) return t(locale, "wx0");
	if (code === 1) return t(locale, "wx1");
	if (code === 2) return t(locale, "wx2");
	if (code === 3) return t(locale, "wx3");
	if (code === 45 || code === 48) return t(locale, "wx45");
	if (code >= 51 && code <= 57) return t(locale, "wx51");
	if (code >= 61 && code <= 67) return t(locale, "wx61");
	if (code >= 71 && code <= 77) return t(locale, "wx71");
	if (code >= 80 && code <= 82) return t(locale, "wx80");
	if (code === 85 || code === 86) return t(locale, "wx85");
	if (code >= 95) return t(locale, "wx95");
	return t(locale, "wxMix");
}
function weatherIcon(code, isDay) {
	if (code === 0) return isDay ? Sun : Moon;
	if (code === 1 || code === 2) return isDay ? CloudSun : Cloud;
	if (code === 3) return Cloud;
	if (code === 45 || code === 48) return CloudFog;
	if (code >= 51 && code <= 57) return CloudDrizzle;
	if (code >= 61 && code <= 67) return CloudRain;
	if (code >= 71 && code <= 77) return CloudSnow;
	if (code >= 80 && code <= 82) return CloudRain;
	if (code === 85 || code === 86) return CloudSnow;
	if (code >= 95) return CloudLightning;
	return Cloud;
}
var POINTS = [
	"N",
	"NNE",
	"NE",
	"ENE",
	"E",
	"ESE",
	"SE",
	"SSE",
	"S",
	"SSW",
	"SW",
	"WSW",
	"W",
	"WNW",
	"NW",
	"NNW"
];
var ADVERB_EN = {
	N: "northerly",
	NNE: "north-northeasterly",
	NE: "northeasterly",
	ENE: "east-northeasterly",
	E: "easterly",
	ESE: "east-southeasterly",
	SE: "southeasterly",
	SSE: "south-southeasterly",
	S: "southerly",
	SSW: "south-southwesterly",
	SW: "southwesterly",
	WSW: "west-southwesterly",
	W: "westerly",
	WNW: "west-northwesterly",
	NW: "northwesterly",
	NNW: "north-northwesterly"
};
var ADVERB_FR = {
	N: "du nord",
	NNE: "du nord-nord-est",
	NE: "du nord-est",
	ENE: "de l'est-nord-est",
	E: "de l'est",
	ESE: "de l'est-sud-est",
	SE: "du sud-est",
	SSE: "du sud-sud-est",
	S: "du sud",
	SSW: "du sud-sud-ouest",
	SW: "du sud-ouest",
	WSW: "de l'ouest-sud-ouest",
	W: "de l'ouest",
	WNW: "de l'ouest-nord-ouest",
	NW: "du nord-ouest",
	NNW: "du nord-nord-ouest"
};
var LONG_EN = {
	N: "north",
	NNE: "north-northeast",
	NE: "northeast",
	ENE: "east-northeast",
	E: "east",
	ESE: "east-southeast",
	SE: "southeast",
	SSE: "south-southeast",
	S: "south",
	SSW: "south-southwest",
	SW: "southwest",
	WSW: "west-southwest",
	W: "west",
	WNW: "west-northwest",
	NW: "northwest",
	NNW: "north-northwest"
};
var LONG_FR = {
	N: "nord",
	NNE: "nord-nord-est",
	NE: "nord-est",
	ENE: "est-nord-est",
	E: "est",
	ESE: "est-sud-est",
	SE: "sud-est",
	SSE: "sud-sud-est",
	S: "sud",
	SSW: "sud-sud-ouest",
	SW: "sud-ouest",
	WSW: "ouest-sud-ouest",
	W: "ouest",
	WNW: "ouest-nord-ouest",
	NW: "nord-ouest",
	NNW: "nord-nord-ouest"
};
function normalizeDeg(deg) {
	return (deg % 360 + 360) % 360;
}
function compassPoint(deg) {
	return POINTS[Math.round(normalizeDeg(deg) / 22.5) % 16];
}
function windAdverb(deg, locale = "en") {
	const p = compassPoint(deg);
	return locale === "fr" ? ADVERB_FR[p] : ADVERB_EN[p];
}
function windLong(deg, locale = "en") {
	const p = compassPoint(deg);
	return locale === "fr" ? LONG_FR[p] : LONG_EN[p];
}
function fromThe(deg, locale = "en") {
	const long = windLong(deg, locale);
	if (locale === "fr") return long === "est" || long === "ouest" ? `de l'${long}` : `du ${long}`;
	return `from the ${long}`;
}
function angleDelta(a, b) {
	const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
	return Math.min(d, 360 - d);
}
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function dewpointFromRh(tempC, rh) {
	const safeRh = clamp(rh, 1, 100);
	const a = 17.625;
	const b = 243.04;
	const gamma = Math.log(safeRh / 100) + a * tempC / (b + tempC);
	return b * gamma / (a - gamma);
}
function estimateRain(input) {
	const locale = input.locale ?? "en";
	const modelChance = clamp(Math.round(input.modelProb), 0, 100);
	const depression = Math.max(0, input.tempC - input.dewpointC);
	const satScore = clamp(1 - (depression - .4) / 10, 0, 1);
	const rhScore = clamp((input.rh - 32) / 58, 0, 1);
	const moisture = .58 * satScore + .42 * rhScore;
	const moistAzimuth = input.latitude >= 0 ? 180 : 0;
	const rad = (input.windDir - moistAzimuth) * Math.PI / 180;
	const fetch = (Math.cos(rad) + 1) / 2 * (.35 + .65 * clamp((input.windSpeedKmh - 3) / 32, 0, 1));
	const cloud = clamp(input.cloudCover / 100, 0, 1);
	const capeScore = clamp((input.cape ?? 0) / 1400, 0, 1);
	const physical = 100 * (.4 * moisture + .26 * fetch + .24 * cloud + .1 * capeScore);
	const modelWeight = .48 + .26 * (Math.abs(modelChance - 50) / 50);
	const chance = Math.round(clamp(modelWeight * modelChance + (1 - modelWeight) * physical, 0, 100));
	const adverb = windAdverb(input.windDir, locale);
	const from = windLong(input.windDir, locale);
	const hemisphereFetch = input.latitude >= 0 ? t(locale, "sourceSouth") : t(locale, "sourceNorth");
	const drivers = [
		{
			id: "model",
			label: t(locale, "driverModel"),
			score: modelChance,
			note: t(locale, "driverModelNote", { n: modelChance })
		},
		{
			id: "moisture",
			label: t(locale, "driverMoisture"),
			score: Math.round(moisture * 100),
			note: depression < 2.2 ? t(locale, "driverMoistureWet", { n: depression.toFixed(1) }) : t(locale, "driverMoistureDry", { n: depression.toFixed(1) })
		},
		{
			id: "fetch",
			label: t(locale, "driverFetch"),
			score: Math.round(fetch * 100),
			note: t(locale, "driverFetchNote", {
				adverb,
				source: hemisphereFetch
			})
		},
		{
			id: "cloud",
			label: t(locale, "driverCloud"),
			score: Math.round(cloud * 100),
			note: t(locale, "driverCloudNote", { n: Math.round(input.cloudCover) })
		}
	];
	if ((input.cape ?? 0) > 80) drivers.push({
		id: "cape",
		label: t(locale, "driverCape"),
		score: Math.round(capeScore * 100),
		note: t(locale, "driverCapeNote", { n: Math.round(input.cape ?? 0) })
	});
	return {
		chance,
		modelChance,
		headline: buildHeadline({
			chance,
			modelChance,
			adverb,
			fetch,
			moisture,
			windSpeedKmh: input.windSpeedKmh,
			depression,
			locale,
			kind: precipWord(input.weatherCode ?? 61, locale)
		}),
		fetchLabel: locale === "fr" ? adverb : capitalize(adverb),
		arrival: from,
		drivers
	};
}
function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function buildHeadline(args) {
	const { chance, adverb, fetch, moisture, windSpeedKmh, depression, locale, kind } = args;
	const still = windSpeedKmh < 8;
	const spread = depression.toFixed(1);
	const sat = Math.round(moisture * 100);
	if (chance >= 70 && fetch > .55) return t(locale, "headWetFetch", {
		adverb,
		kind
	});
	if (chance >= 70 && still) return t(locale, "headWetStill", { kind });
	if (chance >= 55) return t(locale, "headLikely", {
		adverb: locale === "fr" ? adverb : capitalize(adverb),
		spread,
		kind
	});
	if (chance >= 35 && fetch > .5) return t(locale, "headLoading", {
		adverb: locale === "fr" ? adverb : capitalize(adverb),
		kind
	});
	if (chance >= 35 && still) return t(locale, "headLocal", { kind });
	if (chance < 20 && fetch < .35 && moisture < .45) return t(locale, "headDraining", {
		adverb: locale === "fr" ? adverb : capitalize(adverb),
		kind
	});
	if (chance < 25 && args.modelChance < 20) return t(locale, "headDry", { adverb });
	return t(locale, "headWatch", {
		adverb: locale === "fr" ? adverb : capitalize(adverb),
		sat,
		kind
	});
}
function detectWindShift(hours) {
	if (hours.length < 4) return null;
	const start = hours[0].windDir;
	for (let i = 2; i < Math.min(hours.length, 8); i += 1) {
		const delta = angleDelta(start, hours[i].windDir);
		const rainUp = hours[i].rain.chance - hours[0].rain.chance;
		if (delta >= 55 && rainUp >= 8) return {
			from: start,
			to: hours[i].windDir,
			hours: i
		};
	}
	return null;
}
function nextRainWindow(hours) {
	return hours.find((h) => h.rain.chance >= 40 || h.precipMm >= .2) ?? null;
}
//#endregion
export { fromThe as a, precipKind as c, weatherIcon as d, weatherLabel as f, estimateRain as i, precipWord as l, detectWindShift as n, nextRainWindow as o, windLong as p, dewpointFromRh as r, normalizeDeg as s, compassPoint as t, precipWordCap as u };
