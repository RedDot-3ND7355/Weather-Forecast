//#region node_modules/.nitro/vite/services/ssr/assets/compass-DEB7xUAV.js
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
var ADVERB = {
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
var LONG = {
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
function normalizeDeg(deg) {
	return (deg % 360 + 360) % 360;
}
function compassPoint(deg) {
	return POINTS[Math.round(normalizeDeg(deg) / 22.5) % 16];
}
function windAdverb(deg) {
	return ADVERB[compassPoint(deg)];
}
function windLong(deg) {
	return LONG[compassPoint(deg)];
}
function angleDelta(a, b) {
	const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
	return Math.min(d, 360 - d);
}
//#endregion
export { windLong as a, windAdverb as i, compassPoint as n, normalizeDeg as r, angleDelta as t };
