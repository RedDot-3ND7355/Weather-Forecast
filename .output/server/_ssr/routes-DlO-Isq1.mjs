import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { i as windLong, n as compassPoint } from "./compass-BtdnyLVS.mjs";
import { _n as string, mn as object, pn as number } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut, t as authClient } from "./client-CZ8k68j8.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as Input, r as cn, t as Button } from "./input-CkQnuPTQ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as authMiddleware } from "./middleware-IMSN0vNn.mjs";
import { C as CloudDrizzle, S as CloudFog, T as BookmarkCheck, _ as Cloud, a as Sun, b as CloudRain, c as MapPin, d as Locate, f as LoaderCircle, g as Droplets, h as Eye, i as Thermometer, l as LogOut, m as Gauge, n as Wind, o as Search, p as Info, s as Moon, t as X, u as LogIn, v as CloudSun, w as Bookmark, x as CloudLightning, y as CloudSnow } from "../_libs/lucide-react.mjs";
import { n as createSsrRpc } from "./router-9_w83oUI.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { a as CartesianGrid, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DlO-Isq1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var placeSchema = object({
	name: string(),
	latitude: number(),
	longitude: number(),
	admin: string().nullable().optional(),
	country: string().nullable().optional(),
	timezone: string().nullable().optional()
});
var searchPlaces = createServerFn({ method: "GET" }).validator(object({ q: string().trim().min(1).max(80) })).handler(createSsrRpc("f5f33966c1a68a8e3cea1abd24a3eb1faef2991b2daf75449e1f34bc610df2de"));
var reversePlace = createServerFn({ method: "GET" }).validator(object({
	latitude: number().min(-90).max(90),
	longitude: number().min(-180).max(180)
})).handler(createSsrRpc("733f19c61804a32ffd9ab27261a4ea8a7347d8b360d88ca132caab1999ea02a5"));
var fetchForecast = createServerFn({ method: "GET" }).validator(placeSchema).handler(createSsrRpc("530522ada6bf8b03636e6c39ffd5c0ada5294f0a243012533f078ff63b368aae"));
function formatTemp(c, units) {
	const v = units === "imperial" ? c * (9 / 5) + 32 : c;
	return `${Math.round(v)}°`;
}
function tempUnit(units) {
	return units === "imperial" ? "F" : "C";
}
function formatSpeed(kmh, units) {
	const v = units === "imperial" ? kmh * .621371 : kmh;
	return `${Math.round(v)} ${units === "imperial" ? "mph" : "km/h"}`;
}
function formatPrecip(mm, units) {
	if (mm < .05) return units === "imperial" ? "0 in" : "0 mm";
	if (units === "imperial") {
		const inches = mm / 25.4;
		return `${inches < .1 ? inches.toFixed(2) : inches.toFixed(1)} in`;
	}
	return `${mm < 1 ? mm.toFixed(1) : Math.round(mm)} mm`;
}
function formatHour(iso) {
	const d = new Date(iso);
	return new Intl.DateTimeFormat(void 0, { hour: "numeric" }).format(d);
}
function formatWeekday(iso) {
	const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
	return new Intl.DateTimeFormat(void 0, { weekday: "short" }).format(d);
}
function formatLongDate(iso) {
	const d = new Date(iso);
	return new Intl.DateTimeFormat(void 0, {
		weekday: "long",
		month: "short",
		day: "numeric"
	}).format(d);
}
function formatClock(iso) {
	return new Intl.DateTimeFormat(void 0, {
		hour: "numeric",
		minute: "2-digit"
	}).format(new Date(iso));
}
function placeLabel(place) {
	const bits = [place.name];
	if (place.admin && place.admin !== place.name) bits.push(place.admin);
	if (place.country) bits.push(place.country);
	return bits.join(", ");
}
function PlaceSearch({ onSelect, autoFocus = false }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const rootRef = (0, import_react.useRef)(null);
	const trimmed = q.trim();
	const { data, isFetching } = useQuery({
		queryKey: ["places", trimmed],
		queryFn: () => searchPlaces({ data: { q: trimmed } }),
		enabled: trimmed.length >= 2,
		staleTime: 6e4
	});
	(0, import_react.useEffect)(() => {
		function onDoc(e) {
			if (!rootRef.current?.contains(e.target)) setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, []);
	const results = data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: rootRef,
		className: "relative w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				autoFocus,
				placeholder: "Search a city or place",
				className: "pl-9 pr-9",
				onChange: (e) => {
					setQ(e.target.value);
					setOpen(true);
				},
				onFocus: () => setOpen(true),
				"aria-label": "Search location",
				autoComplete: "off"
			}),
			isFetching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted" }) : null,
			open && trimmed.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl bg-raised p-1 shadow-[var(--shadow-border)]",
				children: results.length === 0 && !isFetching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-3 py-3 text-sm text-muted",
					children: "No matching places."
				}) : results.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: cn("flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-surface"),
					onClick: () => {
						onSelect(p);
						setQ("");
						setOpen(false);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 size-4 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium text-fg",
						children: p.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-xs text-muted",
						children: placeLabel(p)
					})] })]
				}) }, `${p.name}-${p.latitude}-${p.longitude}`))
			}) : null
		]
	});
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled (default) -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "size-8 rounded-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-8 place-items-center rounded-full bg-raised text-sm font-medium text-fg",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "max-w-28 truncate text-sm font-medium text-fg",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void signOut(),
				className: "h-11 px-2 text-sm text-muted hover:text-fg",
				children: "Sign out"
			})
		]
	});
}
var placeInput = object({
	name: string().trim().min(1).max(120),
	latitude: number().min(-90).max(90),
	longitude: number().min(-180).max(180),
	admin: string().nullable().optional(),
	country: string().nullable().optional()
});
var listPlaces = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("081437df3557afbac2388d4b291357d3b99a142553e0e9e3a4d9a1077e1662f3"));
var savePlace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(placeInput).handler(createSsrRpc("f66d8b6132ae1f1dd9832b327b21c23629a045fbbc1dd13c82f07361963325b3"));
var removePlace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: number().int().positive() })).handler(createSsrRpc("21ad410098f5212eb73a8072460c39308832d91ccaec66faff1ebc0abcda6bd9"));
function samePlace(a, b) {
	return Math.abs(a.latitude - b.latitude) < 8e-4 && Math.abs(a.longitude - b.longitude) < 8e-4;
}
var useWeatherStore = create()(persist((set) => ({
	place: null,
	units: "metric",
	recent: [],
	setPlace: (place) => set((state) => ({
		place,
		recent: [place, ...state.recent.filter((p) => !samePlace(p, place))].slice(0, 8)
	})),
	setUnits: (units) => set({ units }),
	clearPlace: () => set({ place: null })
}), { name: "vane-weather" }));
function AppHeader({ onLocate, locating, saved, onSaved }) {
	const { user, isPending } = useCurrentUserState();
	const place = useWeatherStore((s) => s.place);
	const units = useWeatherStore((s) => s.units);
	const setPlace = useWeatherStore((s) => s.setPlace);
	const setUnits = useWeatherStore((s) => s.setUnits);
	async function onSave() {
		if (!place) return;
		if (!user) {
			toast("Sign in to save places");
			return;
		}
		try {
			await savePlace({ data: place });
			onSaved();
			toast("Place saved");
		} catch {
			toast("Could not save this place");
		}
	}
	const tools = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon",
			"aria-label": "Use my location",
			onClick: onLocate,
			disabled: locating,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Locate, { className: cn("size-4", locating && "animate-pulse") })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon",
			"aria-label": saved ? "Saved" : "Save this place",
			onClick: () => void onSave(),
			disabled: !place,
			children: saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkCheck, { className: "size-4 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-4" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex rounded-full bg-raised p-0.5 shadow-[var(--shadow-border)]",
			children: ["metric", "imperial"].map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setUnits(u),
				className: cn("h-10 min-w-9 rounded-full px-2 text-xs font-medium sm:min-w-10 sm:px-2.5", units === u ? "bg-accent text-accent-fg" : "text-muted"),
				"aria-pressed": units === u,
				children: u === "metric" ? "°C" : "°F"
			}, u))
		}),
		isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-10 shrink-0 rounded-full bg-raised sm:size-11" }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hidden min-w-0 sm:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "sm:hidden",
			"aria-label": "Sign out",
			onClick: () => void signOut(),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" })
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			size: "sm",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/login",
				"aria-label": "Sign in",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline",
					children: "Sign in"
				})]
			})
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex shrink-0 items-baseline gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl font-medium tracking-tight text-fg sm:text-2xl",
							children: "Vane"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden text-xs tracking-[0.14em] text-faint uppercase sm:inline",
							children: "Rain follows the wind"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ml-auto flex items-center gap-1 sm:hidden",
						children: tools
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceSearch, { onSelect: (p) => setPlace(p) })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden items-center gap-1.5 sm:flex",
					children: tools
				})
			]
		})
	});
}
function ChanceChart({ hours }) {
	const data = hours.map((h, i) => ({
		label: i === 0 ? "Now" : formatHour(h.time),
		vane: h.rain.chance,
		model: h.modelChance
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex flex-wrap items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
				children: "Rain chance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mr-3 inline-flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-rain" }), " Vane"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-accent/50" }), " Model"]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-40 w-full min-w-0 sm:h-52",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
					data,
					margin: {
						top: 8,
						right: 8,
						left: -18,
						bottom: 0
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: "vaneFill",
							x1: "0",
							y1: "0",
							x2: "0",
							y2: "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "0%",
								stopColor: "var(--color-rain)",
								stopOpacity: .35
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "100%",
								stopColor: "var(--color-rain)",
								stopOpacity: 0
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							stroke: "var(--color-border)",
							vertical: false,
							strokeDasharray: "3 6"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "label",
							tick: {
								fill: "var(--color-faint)",
								fontSize: 11
							},
							axisLine: false,
							tickLine: false,
							interval: 3
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							domain: [0, 100],
							tick: {
								fill: "var(--color-faint)",
								fontSize: 11
							},
							axisLine: false,
							tickLine: false,
							tickFormatter: (v) => `${v}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							contentStyle: {
								background: "var(--color-raised)",
								border: "1px solid var(--color-border)",
								borderRadius: 12,
								color: "var(--color-fg)",
								fontSize: 12
							},
							formatter: (value, name) => [`${value}%`, name === "vane" ? "Vane" : "Model"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: "model",
							stroke: "var(--color-accent)",
							strokeOpacity: .55,
							fill: "none",
							strokeWidth: 1.5,
							dot: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: "vane",
							stroke: "var(--color-rain)",
							fill: "url(#vaneFill)",
							strokeWidth: 2,
							dot: false
						})
					]
				})
			})
		})]
	});
}
function Compass({ windDir, windSpeedLabel, chance, className }) {
	const wet = chance >= 35;
	const ticks = Array.from({ length: 72 }, (_, i) => i);
	const rainLines = Array.from({ length: 7 }, (_, i) => i - 3);
	const from = windLong(windDir);
	const point = compassPoint(windDir);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative mx-auto aspect-square w-full max-w-64 sm:max-w-80", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 240 240",
				className: "size-full",
				role: "img",
				"aria-label": `Wind from the ${from} at ${windSpeedLabel}. Rain chance ${chance} percent.`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
						id: "vane-disc",
						cx: "50%",
						cy: "45%",
						r: "55%",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--color-raised)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--color-surface)"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "vane-needle",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--color-fg)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--color-accent)"
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "120",
						cy: "120",
						r: "112",
						fill: "url(#vane-disc)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "120",
						cy: "120",
						r: "108",
						fill: "none",
						stroke: "var(--color-border-strong)",
						strokeWidth: "1.2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "120",
						cy: "120",
						r: "86",
						fill: "none",
						stroke: "var(--color-border)",
						strokeWidth: "1"
					}),
					wet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: sectorPath(120, 120, 104, windDir - 18, windDir + 18),
						fill: "var(--color-rain)",
						opacity: "0.16"
					}) : null,
					ticks.map((i) => {
						const deg = i * 5;
						const major = deg % 30 === 0;
						const card = deg % 90 === 0;
						const inner = card ? 78 : major ? 80 : 83;
						const outer = 104;
						const a = (deg - 90) * Math.PI / 180;
						const x1 = 120 + inner * Math.cos(a);
						const y1 = 120 + inner * Math.sin(a);
						const x2 = 120 + outer * Math.cos(a);
						const y2 = 120 + outer * Math.sin(a);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1,
							y1,
							x2,
							y2,
							stroke: "var(--color-muted)",
							strokeWidth: card ? 1.8 : major ? 1.2 : .6,
							opacity: card ? .9 : major ? .55 : .28
						}, deg);
					}),
					[
						"N",
						"E",
						"S",
						"W"
					].map((label, i) => {
						const a = (i * 90 - 90) * Math.PI / 180;
						const r = 66;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: 120 + r * Math.cos(a),
							y: 120 + r * Math.sin(a),
							textAnchor: "middle",
							dominantBaseline: "middle",
							fill: "var(--color-fg)",
							fontSize: "11",
							fontWeight: "600",
							letterSpacing: "0.08em",
							children: label
						}, label);
					}),
					wet ? rainLines.map((offset) => {
						const a = (windDir + offset * 5.5 - 90) * Math.PI / 180;
						const x1 = 120 + 100 * Math.cos(a);
						const y1 = 120 + 100 * Math.sin(a);
						const x2 = 120 + 38 * Math.cos(a);
						const y2 = 120 + 38 * Math.sin(a);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1,
							y1,
							x2,
							y2,
							stroke: "var(--color-rain)",
							strokeWidth: offset === 0 ? 2 : 1.1,
							strokeLinecap: "round",
							opacity: offset === 0 ? .85 : .4,
							strokeDasharray: "5 7",
							className: "origin-center motion-safe:animate-pulse"
						}, offset);
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						style: {
							transform: `rotate(${windDir}deg)`,
							transformOrigin: "120px 120px",
							transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
								points: "120,28 126,120 120,108 114,120",
								fill: "url(#vane-needle)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
								points: "120,198 126.5,120 120,132 113.5,120",
								fill: "var(--color-accent)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "120",
								cy: "120",
								r: "7",
								fill: "var(--color-bg)",
								stroke: "var(--color-accent)",
								strokeWidth: "2"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-display text-3xl font-medium tabular-nums leading-none tracking-tight text-fg sm:text-4xl",
					children: [chance, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-lg text-muted",
						children: "%"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
					children: "rain"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.14em] text-faint",
					children: "From"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium capitalize text-fg",
					children: from
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.14em] text-faint",
						children: point
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium tabular-nums text-fg",
						children: windSpeedLabel
					})]
				})]
			})
		]
	});
}
function sectorPath(cx, cy, r, startDeg, endDeg) {
	const start = polar(cx, cy, r, startDeg);
	const end = polar(cx, cy, r, endDeg);
	return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y} Z`;
}
function polar(cx, cy, r, deg) {
	const a = (deg - 90) * Math.PI / 180;
	return {
		x: cx + r * Math.cos(a),
		y: cy + r * Math.sin(a)
	};
}
function weatherLabel(code) {
	if (code === 0) return "Clear";
	if (code === 1) return "Mostly clear";
	if (code === 2) return "Partly cloudy";
	if (code === 3) return "Overcast";
	if (code === 45 || code === 48) return "Fog";
	if (code >= 51 && code <= 57) return "Drizzle";
	if (code >= 61 && code <= 67) return "Rain";
	if (code >= 71 && code <= 77) return "Snow";
	if (code >= 80 && code <= 82) return "Showers";
	if (code === 85 || code === 86) return "Snow showers";
	if (code >= 95) return "Thunderstorm";
	return "Mixed skies";
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
function CurrentPanel({ forecast, units }) {
	const { current, place } = forecast;
	const Icon = weatherIcon(current.weatherCode, current.isDay);
	const stats = [
		{
			icon: Thermometer,
			label: "Feels like",
			value: formatTemp(current.apparentC, units)
		},
		{
			icon: Droplets,
			label: "Humidity",
			value: `${Math.round(current.humidity)}%`
		},
		{
			icon: Eye,
			label: "Dewpoint",
			value: formatTemp(current.dewpointC, units)
		},
		{
			icon: Gauge,
			label: "Pressure",
			value: `${Math.round(current.pressureHpa)} hPa`
		},
		{
			icon: Wind,
			label: "Gusts",
			value: formatSpeed(current.windGustKmh, units)
		},
		{
			icon: Droplets,
			label: "Precip now",
			value: formatPrecip(current.precipitationMm, units)
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
				children: placeLabel(place)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: formatLongDate(current.time)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-end gap-3 sm:gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-display text-5xl leading-none font-medium tracking-tight tabular-nums text-fg sm:text-7xl",
					children: [formatTemp(current.temperatureC, units), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-1 align-top font-sans text-base font-medium text-muted sm:text-lg",
						children: tempUnit(units)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-center gap-2 text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 sm:size-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm",
						children: weatherLabel(current.weatherCode)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3",
				children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-raised px-2.5 py-2.5 sm:px-3 sm:py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
						className: "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-faint",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: s.label
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 text-sm font-medium tabular-nums text-fg",
						children: s.value
					})]
				}, s.label))
			})
		]
	});
}
function WindArrow({ deg, className, wet = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 16 16",
		className: cn("size-4 shrink-0", wet ? "text-rain" : "text-muted", className),
		"aria-hidden": "true",
		style: { transform: `rotate(${deg}deg)` },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M8 1.5 L10.2 8.2 L8 7.1 L5.8 8.2 Z",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M8 14.5 L9.2 8.4 L8 9.2 L6.8 8.4 Z",
			fill: "currentColor",
			opacity: "0.55"
		})]
	});
}
function DailyList({ days, units }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
			children: "Seven-day outlook"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border",
			children: days.map((d, i) => {
				const Icon = weatherIcon(d.weatherCode, true);
				const wet = d.rain.chance >= 40;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "grid grid-cols-[minmax(0,4.25rem)_minmax(0,1fr)_auto] items-center gap-2 py-2.5 sm:grid-cols-[5rem_1.6rem_1fr_auto_auto] sm:gap-3 sm:py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium text-fg",
							children: i === 0 ? "Today" : formatWeekday(d.date)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "hidden size-4 text-muted sm:block" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm text-muted",
								children: weatherLabel(d.weatherCode)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 hidden text-xs text-faint sm:block",
								children: [
									"Peak rain ",
									d.rain.chance,
									"% · ",
									compassPoint(d.windDir),
									" fetch"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden items-center gap-1.5 text-xs tabular-nums text-muted sm:flex",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindArrow, {
									deg: d.windDir,
									wet
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: wet ? "text-rain" : "",
									children: [d.rain.chance, "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-faint",
									children: formatPrecip(d.precipMm, units)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm tabular-nums text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: formatTemp(d.tempMaxC, units)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1.5 text-muted sm:ml-2",
									children: formatTemp(d.tempMinC, units)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: cn("mt-0.5 text-xs tabular-nums sm:hidden", wet ? "text-rain" : "text-muted"),
								children: [d.rain.chance, "%"]
							})]
						})
					]
				}, d.date);
			})
		})]
	});
}
function HourlyStrip({ hours, units }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
				children: "Next 24 hours"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "hidden text-xs text-muted sm:block",
				children: "Arrow points into the wind"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2",
			children: hours.map((h, i) => {
				const wet = h.rain.chance >= 40;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex w-14 shrink-0 flex-col items-center gap-1.5 rounded-xl px-1 py-2 sm:w-[4.4rem] sm:px-1.5 sm:py-2.5", i === 0 ? "bg-raised" : ""),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium text-muted",
							children: i === 0 ? "Now" : formatHour(h.time)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindArrow, {
							deg: h.windDir,
							wet,
							className: "size-5"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: cn("text-sm font-medium tabular-nums", wet ? "text-rain" : "text-fg"),
							children: [h.rain.chance, "%"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-1.5 overflow-hidden rounded-full bg-raised",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("w-full rounded-full", wet ? "bg-rain" : "bg-accent/70"),
								style: {
									height: `${Math.max(8, h.rain.chance)}%`,
									marginTop: `${100 - Math.max(8, h.rain.chance)}%`
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tabular-nums text-muted",
							children: formatTemp(h.temperatureC, units)
						})
					]
				}, h.time);
			})
		})]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
	variants: { variant: {
		default: "bg-raised text-muted",
		accent: "bg-accent/15 text-accent",
		rain: "bg-rain/15 text-rain",
		warn: "bg-warn/15 text-warn"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function RainBrief({ forecast }) {
	const { current, nextRain, windShift } = forecast;
	const rain = current.rain;
	const tone = rain.chance >= 60 ? "wet" : rain.chance >= 30 ? "maybe" : "dry";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
						children: "Vane estimate"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mt-1 font-display text-xl font-medium leading-tight text-fg sm:text-2xl",
						children: ["Rain arriving from the ", rain.arrival]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: "shrink-0",
					variant: tone === "wet" ? "rain" : tone === "maybe" ? "warn" : "default",
					children: tone === "wet" ? "Likely" : tone === "maybe" ? "Watch" : "Quiet"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-prose text-sm leading-relaxed text-muted",
				children: rain.headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: [nextRain ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2 rounded-xl bg-raised px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudRain, { className: "mt-0.5 size-4 text-rain" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Next wet window"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							formatClock(nextRain.time),
							" · ",
							nextRain.rain.chance,
							"% from the",
							" ",
							nextRain.rain.arrival
						]
					})] })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2 rounded-xl bg-raised px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudRain, { className: "mt-0.5 size-4 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Next 24 hours"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "No wet window on this fetch."
					})] })]
				}), windShift ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2 rounded-xl bg-raised px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-0.5 size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Wind shift"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Backing from the ",
							windLong(windShift.from),
							" toward the",
							" ",
							windLong(windShift.to),
							" in about ",
							windShift.hours,
							"h. A front may be nearby."
						]
					})] })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2 rounded-xl bg-raised px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-0.5 size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Steady fetch"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Direction holds. Rain will keep arriving from the ",
							rain.arrival,
							" ",
							"if it develops."
						]
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-5 space-y-2.5",
				children: rain.drivers.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1 flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium uppercase tracking-[0.12em] text-faint",
							children: d.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs tabular-nums text-muted",
							children: [d.score, "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1 overflow-hidden rounded-full bg-raised",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("h-full rounded-full", d.id === "fetch" || d.id === "model" ? "bg-rain" : "bg-accent"),
							style: { width: `${d.score}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: d.note
					})
				] }, d.id))
			})
		]
	});
}
function SavedRow({ places, recent, onPick, onRemove }) {
	if (places.length === 0 && recent.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
		children: [places.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex shrink-0 items-center gap-1 rounded-full bg-raised py-1 pr-1 pl-2.5 text-xs text-fg shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "inline-flex items-center gap-1.5",
				onClick: () => onPick(p),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3 text-accent" }), p.name]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "grid size-7 place-items-center rounded-full text-faint hover:text-fg",
				"aria-label": `Remove ${p.name}`,
				onClick: () => onRemove(p.id),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
			})]
		}, p.id)), recent.filter((r) => !places.some((p) => p.name === r.name)).slice(0, 5).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-surface px-3 text-xs text-muted shadow-[var(--shadow-border)] hover:text-fg",
			onClick: () => onPick(p),
			children: p.name
		}, `${p.name}-${p.latitude}`))]
	});
}
function SampleCities({ onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap justify-center gap-2",
		children: [
			{
				name: "Lisbon",
				latitude: 38.72,
				longitude: -9.14,
				country: "Portugal",
				timezone: "Europe/Lisbon"
			},
			{
				name: "Tokyo",
				latitude: 35.68,
				longitude: 139.69,
				country: "Japan",
				timezone: "Asia/Tokyo"
			},
			{
				name: "Reykjavík",
				latitude: 64.15,
				longitude: -21.94,
				country: "Iceland",
				timezone: "Atlantic/Reykjavik"
			},
			{
				name: "Nairobi",
				latitude: -1.29,
				longitude: 36.82,
				country: "Kenya",
				timezone: "Africa/Nairobi"
			},
			{
				name: "Hobart",
				latitude: -42.88,
				longitude: 147.33,
				country: "Australia",
				timezone: "Australia/Hobart"
			},
			{
				name: "Vancouver",
				latitude: 49.28,
				longitude: -123.12,
				country: "Canada",
				timezone: "America/Vancouver"
			}
		].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "h-11 rounded-full bg-raised px-3.5 text-sm text-fg shadow-[var(--shadow-border)] hover:bg-surface sm:px-4",
			onClick: () => onPick(p),
			children: p.name
		}, p.name))
	});
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-raised", className),
		...props
	});
}
function ForecastApp() {
	const { user } = useCurrentUserState();
	const place = useWeatherStore((s) => s.place);
	const units = useWeatherStore((s) => s.units);
	const recent = useWeatherStore((s) => s.recent);
	const setPlace = useWeatherStore((s) => s.setPlace);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [locating, setLocating] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setHydrated(true), []);
	const active = hydrated ? place : null;
	const forecastQuery = useQuery({
		queryKey: [
			"forecast",
			active?.latitude,
			active?.longitude
		],
		queryFn: () => fetchForecast({ data: active }),
		enabled: Boolean(active),
		staleTime: 6e5
	});
	const savedQuery = useQuery({
		queryKey: ["saved-places", user?.id],
		queryFn: () => listPlaces(),
		enabled: Boolean(user)
	});
	const savedPlaces = savedQuery.data ?? [];
	const saved = Boolean(active) && savedPlaces.some((p) => Math.abs(p.latitude - active.latitude) < 8e-4 && Math.abs(p.longitude - active.longitude) < 8e-4);
	function locate() {
		if (!navigator.geolocation) {
			toast("Location is not available here");
			return;
		}
		setLocating(true);
		navigator.geolocation.getCurrentPosition((pos) => {
			reversePlace({ data: {
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude
			} }).then(setPlace).catch(() => setPlace({
				name: "Your location",
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude
			})).finally(() => setLocating(false));
		}, () => {
			toast("Could not read your location");
			setLocating(false);
		}, {
			enableHighAccuracy: false,
			timeout: 8e3
		});
	}
	async function onRemove(id) {
		try {
			await removePlace({ data: { id } });
			await savedQuery.refetch();
		} catch {
			toast("Could not remove that place");
		}
	}
	const forecast = forecastQuery.data;
	const isLoading = Boolean(active) && forecastQuery.isLoading;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh overflow-x-clip bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
			onLocate: locate,
			locating,
			saved,
			onSaved: () => void savedQuery.refetch()
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto min-w-0 max-w-6xl overflow-x-clip px-3 py-4 sm:px-6 sm:py-8",
			children: [hydrated && (savedPlaces.length > 0 || recent.length > 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 min-w-0 sm:mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavedRow, {
					places: savedPlaces,
					recent,
					onPick: setPlace,
					onRemove: (id) => void onRemove(id)
				})
			}) : null, !active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				onPick: setPlace,
				onLocate: locate,
				locating
			}) : isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {}) : forecastQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				onRetry: () => void forecastQuery.refetch(),
				message: forecastQuery.error instanceof Error ? forecastQuery.error.message : "Could not load the forecast."
			}) : forecast ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5 lg:p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, {
							windDir: forecast.current.windDir,
							windSpeedLabel: formatSpeed(forecast.current.windSpeedKmh, units),
							chance: forecast.current.rain.chance
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrentPanel, {
						forecast,
						units
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 lg:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RainBrief, { forecast })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 lg:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HourlyStrip, {
							hours: forecast.hourly,
							units
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChanceChart, { hours: forecast.hourly }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DailyList, {
						days: forecast.daily,
						units
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowItWorks, {})
				]
			}) : null]
		})]
	});
}
function EmptyState({ onPick, onLocate, locating }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl py-4 text-center sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-4xl font-medium tracking-tight text-fg sm:text-6xl",
				children: "Vane"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted sm:text-base",
				children: "Rain follows the wind. Search a place and the compass shows the bearing moisture is arriving from — then estimates rain from that fetch."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 hidden text-left sm:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceSearch, {
					onSelect: onPick,
					autoFocus: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onLocate,
				className: "mt-4 h-11 text-sm font-medium text-accent hover:underline",
				children: locating ? "Locating…" : "Use my location"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
				children: "Try a city"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SampleCities, { onPick }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowItWorks, { compact: true })
		]
	});
}
function LoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-square rounded-2xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-72 rounded-2xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56 rounded-2xl lg:col-span-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-2xl lg:col-span-2" })
		]
	});
}
function ErrorState({ onRetry, message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-medium",
				children: "Forecast unavailable"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onRetry,
				className: "mt-5 h-11 rounded-lg bg-accent px-5 text-sm font-medium text-accent-fg",
				children: "Try again"
			})
		]
	});
}
function HowItWorks({ compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: compact ? "mt-8 text-left text-sm text-muted sm:mt-12" : "rounded-2xl bg-surface p-4 text-sm text-muted shadow-[var(--shadow-border)] sm:p-5 lg:col-span-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
			children: "How the estimate works"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 leading-relaxed",
			children: "Weather vanes point into the wind — the direction rain is carried from. Vane blends the forecast model’s precipitation probability with how saturated the air is, how much cloud is overhead, and whether the wind is a moist equatorward fetch (southerly in the north, northerly in the south). The compass is the rain bearing. The percentage is that blend, not a guarantee."
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForecastApp, {});
}
//#endregion
export { Home as component };
