import { i as windLong, r as windAdverb, t as angleDelta } from "./compass-BtdnyLVS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rain-CGpVhUJn.js
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
	const adverb = windAdverb(input.windDir);
	const from = windLong(input.windDir);
	const hemisphereFetch = input.latitude >= 0 ? "equatorward / southerly" : "equatorward / northerly";
	const drivers = [
		{
			id: "model",
			label: "Model rain",
			score: modelChance,
			note: `${modelChance}% from the forecast ensemble`
		},
		{
			id: "moisture",
			label: "Saturation",
			score: Math.round(moisture * 100),
			note: depression < 2.2 ? `Air is nearly saturated (${depression.toFixed(1)}° dewpoint spread)` : `Dewpoint is ${depression.toFixed(1)}° below air temperature`
		},
		{
			id: "fetch",
			label: "Wind fetch",
			score: Math.round(fetch * 100),
			note: `${capitalize(adverb)} flow · ${hemisphereFetch} air is the moist source`
		},
		{
			id: "cloud",
			label: "Cloud cover",
			score: Math.round(cloud * 100),
			note: `${Math.round(input.cloudCover)}% sky covered`
		}
	];
	if ((input.cape ?? 0) > 80) drivers.push({
		id: "cape",
		label: "Instability",
		score: Math.round(capeScore * 100),
		note: `${Math.round(input.cape ?? 0)} J/kg CAPE`
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
			depression
		}),
		fetchLabel: capitalize(adverb),
		arrival: from,
		drivers
	};
}
function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function buildHeadline(args) {
	const { chance, adverb, fetch, moisture, windSpeedKmh, depression } = args;
	const still = windSpeedKmh < 8;
	if (chance >= 70 && fetch > .55) return `A ${adverb} fetch is feeding rain. Expect wet weather from that bearing.`;
	if (chance >= 70 && still) return `Saturated, nearly still air. Rain is forming in place rather than being blown in.`;
	if (chance >= 55) return `${capitalize(adverb)} wind and a ${depression.toFixed(1)}° dewpoint spread put rain on the table.`;
	if (chance >= 35 && fetch > .5) return `${capitalize(adverb)} flow is loading moisture. Rain chance is rising from that direction.`;
	if (chance >= 35 && still) return `Light wind, humid column. Any rain stays local rather than arriving on a fetch.`;
	if (chance < 20 && fetch < .35 && moisture < .45) return `${capitalize(adverb)} flow is draining moisture. Rain looks unlikely.`;
	if (chance < 25 && args.modelChance < 20) return `Dry ${adverb} air. The vane and the model both stay quiet.`;
	return `${capitalize(adverb)} wind, ${Math.round(moisture * 100)}% saturation. Watch that bearing for rain.`;
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
export { nextRainWindow as i, dewpointFromRh as n, estimateRain as r, detectWindShift as t };
