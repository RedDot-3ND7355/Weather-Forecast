import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { l as require_react_dom, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { i as useWeatherStore, n as t, r as useT, t as localeTag } from "./i18n-B-eGWbYz.mjs";
import { a as fromThe, c as windLong, i as estimateRain, s as normalizeDeg, t as compassPoint } from "./rain-BuzFLAAb.mjs";
import { hn as object, mn as number, sn as _enum, vn as string } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut, t as authClient } from "./client-CZ8k68j8.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as Input, r as cn, t as Button } from "./input-CkQnuPTQ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as authMiddleware } from "./middleware-IMSN0vNn.mjs";
import { n as arrivalCopy, r as formatEta } from "./advection-CHvhfvGU.mjs";
import { A as CloudFog, C as Expand, D as CloudSnow, E as CloudSun, F as BookmarkCheck, M as ChevronRight, N as ChevronLeft, O as CloudRain, P as Bookmark, S as Eye, T as Cloud, _ as LogIn, a as Sun, b as Info, c as Plus, d as Moon, f as Minus, g as LogOut, h as MapPin, i as Thermometer, j as CloudDrizzle, k as CloudLightning, l as Play, m as Maximize2, n as Wind, o as Search, p as Minimize2, s as Radar, t as X, u as Pause, v as Locate, w as Droplets, x as Gauge, y as LoaderCircle } from "../_libs/lucide-react.mjs";
import { i as createSsrRpc, n as flickVelocity, r as pushFlick } from "./router-BET8oWxT.mjs";
import { a as CartesianGrid, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CAz5BpCX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
function currentFs() {
	const d = document;
	return document.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}
function canOsFullscreen() {
	if (typeof document === "undefined") return false;
	const el = document.documentElement;
	return Boolean(el.requestFullscreen || el.webkitRequestFullscreen || el.webkitRequestFullScreen);
}
function usePageFullscreen() {
	const [on, setOn] = (0, import_react.useState)(false);
	const sync = (0, import_react.useCallback)(() => {
		const os = Boolean(currentFs());
		const fill = document.documentElement.classList.contains("vane-page-fs");
		setOn(os || fill);
		if (!os && !fill) document.documentElement.classList.remove("vane-page-fs");
	}, []);
	(0, import_react.useEffect)(() => {
		sync();
		document.addEventListener("fullscreenchange", sync);
		document.addEventListener("webkitfullscreenchange", sync);
		const onKey = (e) => {
			if (e.key === "Escape") {
				document.documentElement.classList.remove("vane-page-fs");
				sync();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("fullscreenchange", sync);
			document.removeEventListener("webkitfullscreenchange", sync);
			window.removeEventListener("keydown", onKey);
		};
	}, [sync]);
	return {
		on,
		toggle: (0, import_react.useCallback)(async () => {
			if (on) {
				const d = document;
				if (currentFs()) {
					const exit = document.exitFullscreen ?? d.webkitExitFullscreen ?? d.webkitCancelFullScreen;
					try {
						await Promise.resolve(exit?.call(document));
					} catch {}
				}
				document.documentElement.classList.remove("vane-page-fs");
				setOn(false);
				return;
			}
			const el = document.documentElement;
			const req = el.requestFullscreen ?? el.webkitRequestFullscreen ?? el.webkitRequestFullScreen;
			if (req && canOsFullscreen()) try {
				await Promise.resolve(req.call(el));
				document.documentElement.classList.add("vane-page-fs");
				setOn(true);
				return;
			} catch {}
			document.documentElement.classList.add("vane-page-fs");
			setOn(true);
		}, [on])
	};
}
function PageFullscreenButton() {
	const { on, toggle } = usePageFullscreen();
	const { t } = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "ghost",
		size: "icon",
		"aria-label": on ? t("exitFullscreen") : t("fullscreen"),
		"aria-pressed": on,
		className: "size-9 shrink-0 sm:size-11",
		title: on ? t("exitFullscreen") : t("fullscreen"),
		onClick: () => void toggle(),
		children: on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-4" })
	});
}
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
	longitude: number().min(-180).max(180),
	language: _enum(["en", "fr"]).optional()
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
function formatHour(iso, locale = "en") {
	const d = new Date(iso);
	return new Intl.DateTimeFormat(localeTag(locale), { hour: "numeric" }).format(d);
}
function formatWeekday(iso, locale = "en") {
	const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
	return new Intl.DateTimeFormat(localeTag(locale), { weekday: "short" }).format(d);
}
function formatLongDate(iso, locale = "en") {
	const d = new Date(iso);
	return new Intl.DateTimeFormat(localeTag(locale), {
		weekday: "long",
		month: "short",
		day: "numeric"
	}).format(d);
}
function formatClock(iso, locale = "en") {
	return new Intl.DateTimeFormat(localeTag(locale), {
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
	const { t } = useT();
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
				placeholder: t("searchPlaceholder"),
				className: "pl-9 pr-9",
				onChange: (e) => {
					setQ(e.target.value);
					setOpen(true);
				},
				onFocus: () => setOpen(true),
				"aria-label": t("searchAria"),
				autoComplete: "off"
			}),
			isFetching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted" }) : null,
			open && trimmed.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl bg-raised p-1 shadow-[var(--shadow-border)]",
				children: results.length === 0 && !isFetching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-3 py-3 text-sm text-muted",
					children: t("searchEmpty")
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
				className: "grid size-9 shrink-0 place-items-center rounded-md text-muted hover:bg-raised hover:text-fg",
				"aria-label": "Sign out",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" })
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
var iconBtn = "size-9 shrink-0 sm:size-11";
function AppHeader({ onLocate, locating, saved, onSaved }) {
	const { user, isPending } = useCurrentUserState();
	const { t } = useT();
	const place = useWeatherStore((s) => s.place);
	const units = useWeatherStore((s) => s.units);
	const locale = useWeatherStore((s) => s.locale);
	const setPlace = useWeatherStore((s) => s.setPlace);
	const setUnits = useWeatherStore((s) => s.setUnits);
	const setLocale = useWeatherStore((s) => s.setLocale);
	async function onSave() {
		if (!place) return;
		if (!user) {
			toast(t("toastSignInSave"));
			return;
		}
		try {
			await savePlace({ data: place });
			onSaved();
			toast(t("toastSaved"));
		} catch {
			toast(t("toastSaveFail"));
		}
	}
	const prefs = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex shrink-0 rounded-full bg-raised p-0.5 shadow-[var(--shadow-border)]",
		children: ["en", "fr"].map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setLocale(l),
			className: cn("h-8 min-w-7 rounded-full px-1.5 text-[11px] font-medium sm:h-9 sm:min-w-8 sm:px-2", locale === l ? "bg-accent text-accent-fg" : "text-muted"),
			"aria-pressed": locale === l,
			"aria-label": l === "fr" ? "Français" : "English",
			children: l.toUpperCase()
		}, l))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex shrink-0 rounded-full bg-raised p-0.5 shadow-[var(--shadow-border)]",
		children: ["metric", "imperial"].map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setUnits(u),
			className: cn("h-8 min-w-8 rounded-full px-1.5 text-xs font-medium sm:h-9 sm:min-w-9 sm:px-2", units === u ? "bg-accent text-accent-fg" : "text-muted"),
			"aria-pressed": units === u,
			children: u === "metric" ? "°C" : "°F"
		}, u))
	})] });
	const auth = isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-9 shrink-0 rounded-full bg-raised sm:size-11" }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hidden min-w-0 lg:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "icon",
		className: cn(iconBtn, "lg:hidden"),
		"aria-label": t("signOut"),
		onClick: () => void signOut(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" })
	})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "icon",
		className: iconBtn,
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/login",
			"aria-label": t("signIn"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "size-4" })
		})
	});
	const actions = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon",
			className: iconBtn,
			"aria-label": t("locateAria"),
			onClick: onLocate,
			disabled: locating,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Locate, { className: cn("size-4", locating && "animate-pulse") })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hidden sm:contents",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageFullscreenButton, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon",
			className: iconBtn,
			"aria-label": saved ? t("saved") : t("savePlace"),
			onClick: () => void onSave(),
			disabled: !place,
			children: saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkCheck, { className: "size-4 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-4" })
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 overflow-x-clip border-b border-border bg-bg/90 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl min-w-0 flex-col gap-2 px-3 py-2.5 pr-[max(0.75rem,env(safe-area-inset-right))] sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex shrink-0 items-baseline gap-2 pr-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl font-medium tracking-tight text-fg sm:text-2xl",
							children: "Vane"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden text-xs tracking-[0.14em] text-faint uppercase xl:inline",
							children: t("tagline")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex min-w-0 items-center sm:hidden",
						children: [actions, auth]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-1 items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceSearch, { onSelect: (p) => setPlace(p) })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex shrink-0 items-center gap-1 sm:hidden",
						children: prefs
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden shrink-0 items-center gap-1 sm:flex",
					children: [
						actions,
						prefs,
						auth
					]
				})
			]
		})
	});
}
function ChanceChart({ hours }) {
	const { locale, t } = useT();
	const data = hours.map((h, i) => ({
		label: i === 0 ? t("now") : formatHour(h.time, locale),
		vane: h.rain.chance,
		model: h.modelChance
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex flex-wrap items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
				children: t("rainChance")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mr-3 inline-flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-rain" }),
						" ",
						t("vane")
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-accent/50" }),
						" ",
						t("model")
					]
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
function screenAngle() {
	const o = window.screen?.orientation?.angle;
	if (typeof o === "number") return o;
	const legacy = window.orientation;
	return typeof legacy === "number" ? legacy : 0;
}
function isAppleTouch$1() {
	const ua = navigator.userAgent;
	if (/iP(hone|od|ad)/.test(ua)) return true;
	if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
	return navigator.vendor === "Apple Computer, Inc." && "ontouchend" in window;
}
function readHeading(e, apple) {
	const webkit = e.webkitCompassHeading;
	if (typeof webkit === "number" && Number.isFinite(webkit)) return normalizeDeg(webkit);
	if (apple) return null;
	if (e.absolute === false) return null;
	if (typeof e.alpha !== "number" || !Number.isFinite(e.alpha)) return null;
	return normalizeDeg(-e.alpha + screenAngle());
}
function lerpAngle(from, to, t) {
	const d = (to - from + 540) % 360 - 180;
	return normalizeDeg(from + d * t);
}
function canRequest() {
	return typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
}
function headingSupported() {
	return typeof window !== "undefined" && (typeof DeviceOrientationEvent !== "undefined" || "ondeviceorientationabsolute" in window);
}
async function requestMotion() {
	const orient = DeviceOrientationEvent;
	if (typeof orient.requestPermission !== "function") return true;
	if (await orient.requestPermission() !== "granted") return false;
	const motion = DeviceMotionEvent;
	if (typeof motion.requestPermission === "function") try {
		await motion.requestPermission();
	} catch {}
	return true;
}
function useDeviceHeading() {
	const [heading, setHeading] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("off");
	const [accuracy, setAccuracy] = (0, import_react.useState)(null);
	const [offer, setOffer] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)(null);
	const target = (0, import_react.useRef)(null);
	const shown = (0, import_react.useRef)(null);
	const absOk = (0, import_react.useRef)(false);
	const stop = (0, import_react.useRef)(null);
	const startListening = (0, import_react.useCallback)(() => {
		stop.current?.();
		absOk.current = false;
		shown.current = null;
		target.current = null;
		setHint(null);
		const appleNow = isAppleTouch$1();
		const apply = (e, fromAbsolute) => {
			const ev = e;
			const h = readHeading(ev, appleNow);
			if (h == null) return;
			if (fromAbsolute) absOk.current = true;
			else if (absOk.current && !appleNow) return;
			target.current = h;
			if (typeof ev.webkitCompassAccuracy === "number") {
				setAccuracy(ev.webkitCompassAccuracy);
				if (ev.webkitCompassAccuracy < 0) setHint("calibrate");
			}
		};
		const onAbs = (e) => {
			if (appleNow) return;
			apply(e, true);
		};
		const onRel = (e) => apply(e, false);
		const onCalibrate = () => setHint("calibrate");
		window.addEventListener("deviceorientation", onRel, true);
		if (!appleNow) window.addEventListener("deviceorientationabsolute", onAbs, true);
		window.addEventListener("compassneedscalibration", onCalibrate);
		let raf = 0;
		const loop = () => {
			const next = target.current;
			if (next != null) {
				shown.current = shown.current == null ? next : lerpAngle(shown.current, next, .28);
				const s = shown.current;
				setHeading((prev) => {
					if (prev == null) return s;
					return Math.abs((s - prev + 540) % 360 - 180) < .35 ? prev : s;
				});
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		const silent = window.setTimeout(() => {
			if (target.current == null) setHint("move");
		}, 1600);
		const stuck = window.setTimeout(() => {
			if (target.current == null) setHint("settings");
		}, 4500);
		stop.current = () => {
			window.removeEventListener("deviceorientation", onRel, true);
			window.removeEventListener("deviceorientationabsolute", onAbs, true);
			window.removeEventListener("compassneedscalibration", onCalibrate);
			cancelAnimationFrame(raf);
			window.clearTimeout(silent);
			window.clearTimeout(stuck);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!headingSupported()) {
			setStatus("missing");
			return;
		}
		const ios = canRequest() || isAppleTouch$1();
		const coarse = window.matchMedia("(pointer: coarse)").matches;
		if (ios) setStatus("need");
		setOffer(ios || coarse);
		return () => stop.current?.();
	}, []);
	return {
		heading,
		status,
		accuracy,
		offer,
		hint,
		enable: (0, import_react.useCallback)(async () => {
			if (!headingSupported()) {
				setStatus("missing");
				return;
			}
			try {
				if (!await requestMotion()) {
					setStatus("denied");
					return;
				}
				startListening();
				setStatus("live");
			} catch {
				setStatus("denied");
			}
		}, [startListening]),
		disable: (0, import_react.useCallback)(() => {
			stop.current?.();
			stop.current = null;
			setHeading(null);
			setAccuracy(null);
			setHint(null);
			target.current = null;
			shown.current = null;
			absOk.current = false;
			setStatus(canRequest() || isAppleTouch$1() ? "need" : "off");
		}, [])
	};
}
function Compass({ windDir, windSpeedLabel, chance, className }) {
	const { locale, t } = useT();
	const wet = chance >= 35;
	const ticks = Array.from({ length: 72 }, (_, i) => i);
	const rainLines = Array.from({ length: 7 }, (_, i) => i - 3);
	const from = fromThe(windDir, locale);
	const fromWord = windLong(windDir, locale);
	const point = compassPoint(windDir);
	const { heading, status, accuracy, offer, hint, enable, disable } = useDeviceHeading();
	const live = status === "live" && heading != null;
	const rose = live ? -heading : 0;
	const facing = live ? compassPoint(heading) : null;
	const uncalibrated = live && accuracy != null && accuracy < 0;
	const hdg = heading ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative mx-auto aspect-square w-full max-w-64 sm:max-w-80", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 240 240",
				className: "size-full",
				role: "img",
				"aria-label": live ? t("compassLive", {
					facing: facing ?? "",
					from,
					speed: windSpeedLabel,
					chance
				}) : t("compassStatic", {
					from,
					speed: windSpeedLabel,
					chance
				}),
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
					live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
						points: "120,6 126,18 114,18",
						fill: "var(--color-accent)"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						style: {
							transform: `rotate(${rose}deg)`,
							transformOrigin: "120px 120px",
							transition: live ? void 0 : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)"
						},
						children: [
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
								const shown = locale === "fr" && label === "W" ? "O" : label;
								const a = (i * 90 - 90) * Math.PI / 180;
								const r = 66;
								const x = 120 + r * Math.cos(a);
								const y = 120 + r * Math.sin(a);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									x,
									y,
									textAnchor: "middle",
									dominantBaseline: "middle",
									fill: "var(--color-fg)",
									fontSize: "11",
									fontWeight: "600",
									letterSpacing: "0.08em",
									transform: live ? `rotate(${hdg} ${x} ${y})` : void 0,
									children: shown
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
					children: t("rainWord")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-end justify-between gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.14em] text-faint",
					children: t("from")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium capitalize text-fg",
					children: fromWord
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
			}),
			offer || status === "live" || status === "denied" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex items-center justify-between gap-2",
				children: status === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: hint === "calibrate" || uncalibrated ? t("wavePhone") : hint === "settings" ? t("safariMotion") : hint === "move" ? t("turnPhone") : live ? t("facing", { dir: facing ?? "" }) : t("findingNorth")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "ghost",
					onClick: disable,
					children: t("northUp")
				})] }) : status === "denied" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: t("compassDenied")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "secondary",
					className: "w-full",
					onClick: () => void enable(),
					children: t("useCompass")
				})
			}) : null
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
function CurrentPanel({ forecast, units }) {
	const { locale, t } = useT();
	const { current, place } = forecast;
	const Icon = weatherIcon(current.weatherCode, current.isDay);
	const stats = [
		{
			icon: Thermometer,
			label: t("feelsLike"),
			value: formatTemp(current.apparentC, units)
		},
		{
			icon: Droplets,
			label: t("humidity"),
			value: `${Math.round(current.humidity)}%`
		},
		{
			icon: Eye,
			label: t("dewpoint"),
			value: formatTemp(current.dewpointC, units)
		},
		{
			icon: Gauge,
			label: t("pressure"),
			value: `${Math.round(current.pressureHpa)} hPa`
		},
		{
			icon: Wind,
			label: t("gusts"),
			value: formatSpeed(current.windGustKmh, units)
		},
		{
			icon: Droplets,
			label: t("precipNow"),
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
				children: formatLongDate(current.time, locale)
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
						children: weatherLabel(current.weatherCode, locale)
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
	const { locale, t } = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
			children: t("sevenDay")
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
							children: i === 0 ? t("today") : formatWeekday(d.date, locale)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "hidden size-4 text-muted sm:block" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm text-muted",
								children: weatherLabel(d.weatherCode, locale)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 hidden text-xs text-faint sm:block",
								children: t("peakRain", {
									chance: d.rain.chance,
									dir: compassPoint(d.windDir)
								})
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
								children: [
									d.rain.chance,
									"% · ",
									formatPrecip(d.precipMm, units)
								]
							})]
						})
					]
				}, d.date);
			})
		})]
	});
}
function HScroll({ children, className, contentClassName, label = "More items", fadeFrom = "from-surface" }) {
	const scroller = (0, import_react.useRef)(null);
	const skipClick = (0, import_react.useRef)(false);
	const motion = (0, import_react.useRef)({
		raf: 0,
		vel: 0,
		dragging: false
	});
	const [edge, setEdge] = (0, import_react.useState)({
		left: false,
		right: false
	});
	const stopCoast = () => {
		cancelAnimationFrame(motion.current.raf);
		motion.current.raf = 0;
	};
	const coast = () => {
		const el = scroller.current;
		if (!el) return;
		stopCoast();
		el.style.scrollBehavior = "auto";
		const tick = () => {
			if (motion.current.dragging) return;
			const max = Math.max(0, el.scrollWidth - el.clientWidth);
			motion.current.vel *= .92;
			el.scrollLeft += motion.current.vel;
			if (el.scrollLeft <= 0 || el.scrollLeft >= max) {
				el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft));
				motion.current.vel = 0;
			}
			if (Math.abs(motion.current.vel) < .28) {
				motion.current.vel = 0;
				return;
			}
			motion.current.raf = requestAnimationFrame(tick);
		};
		motion.current.raf = requestAnimationFrame(tick);
	};
	const sync = () => {
		const el = scroller.current;
		if (!el) return;
		setEdge({
			left: el.scrollLeft > 6,
			right: el.scrollLeft < el.scrollWidth - el.clientWidth - 6
		});
	};
	(0, import_react.useEffect)(() => {
		const el = scroller.current;
		if (!el) return;
		sync();
		const ro = new ResizeObserver(sync);
		ro.observe(el);
		el.addEventListener("scroll", sync, { passive: true });
		const onWheel = (e) => {
			if (el.scrollWidth <= el.clientWidth + 4) return;
			if (Math.abs(e.deltaX) >= Math.abs(e.deltaY) && e.deltaX !== 0) return;
			e.preventDefault();
			stopCoast();
			const impulse = e.deltaMode === 1 ? e.deltaY * 10 : e.deltaY;
			motion.current.vel += impulse * .42;
			coast();
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		let pointer = -1;
		let startX = 0;
		let startScroll = 0;
		let moved = false;
		let samples = [];
		const onDown = (e) => {
			if (e.pointerType === "touch") return;
			if (e.button !== 0) return;
			stopCoast();
			pointer = e.pointerId;
			startX = e.clientX;
			startScroll = el.scrollLeft;
			moved = false;
			samples = [];
			pushFlick(samples, e.clientX);
			motion.current.dragging = true;
			motion.current.vel = 0;
			el.style.scrollBehavior = "auto";
			el.setPointerCapture(e.pointerId);
		};
		const onMove = (e) => {
			if (e.pointerId !== pointer) return;
			const dx = e.clientX - startX;
			if (!moved && Math.abs(dx) < 4) return;
			moved = true;
			skipClick.current = true;
			e.preventDefault();
			pushFlick(samples, e.clientX);
			el.scrollLeft = startScroll - dx;
		};
		const onUp = (e) => {
			if (e.pointerId !== pointer) return;
			pointer = -1;
			motion.current.dragging = false;
			motion.current.vel = flickVelocity(samples);
			if (moved) coast();
		};
		el.addEventListener("pointerdown", onDown);
		el.addEventListener("pointermove", onMove, { passive: false });
		el.addEventListener("pointerup", onUp);
		el.addEventListener("pointercancel", onUp);
		return () => {
			stopCoast();
			ro.disconnect();
			el.removeEventListener("scroll", sync);
			el.removeEventListener("wheel", onWheel);
			el.removeEventListener("pointerdown", onDown);
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerup", onUp);
			el.removeEventListener("pointercancel", onUp);
		};
	}, [children]);
	const overflow = edge.left || edge.right;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative min-w-0", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: scroller,
				className: cn("relative flex min-w-0 touch-pan-x gap-1.5 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-2 pb-1.5 sm:gap-2", "[&>*]:shrink-0", "[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--color-fg)_28%,transparent)_transparent]", "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-track]:bg-transparent", "cursor-grab active:cursor-grabbing select-none", contentClassName),
				"aria-label": label,
				"data-h-scroll": "",
				style: { WebkitOverflowScrolling: "touch" },
				onClickCapture: (e) => {
					if (!skipClick.current) return;
					e.preventDefault();
					e.stopPropagation();
					skipClick.current = false;
				},
				children
			}),
			edge.left ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-linear-to-r to-transparent", fadeFrom) }) : null,
			edge.right ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-linear-to-l to-transparent", fadeFrom) }) : null,
			overflow ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "icon",
				variant: "secondary",
				className: "absolute top-1/2 left-0 z-10 hidden size-8 -translate-y-1/2 sm:grid",
				disabled: !edge.left,
				"aria-label": "Scroll left",
				onClick: () => scroller.current?.scrollBy({
					left: -220,
					behavior: "smooth"
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "icon",
				variant: "secondary",
				className: "absolute top-1/2 right-0 z-10 hidden size-8 -translate-y-1/2 sm:grid",
				disabled: !edge.right,
				"aria-label": "Scroll right",
				onClick: () => scroller.current?.scrollBy({
					left: 220,
					behavior: "smooth"
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
			})] }) : null
		]
	});
}
function HourlyStrip({ hours, units }) {
	const { locale, t } = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
				children: t("next24")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: t("swipeOrDrag")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, {
			label: t("next24"),
			children: hours.map((h, i) => {
				const wet = h.rain.chance >= 40;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex w-14 shrink-0 flex-col items-center gap-1.5 rounded-xl px-1 py-2 sm:w-[4.4rem] sm:px-1.5 sm:py-2.5", i === 0 ? "bg-raised" : ""),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium text-muted",
							children: i === 0 ? t("now") : formatHour(h.time, locale)
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
var fetchMscRadar = createServerFn({ method: "GET" }).handler(createSsrRpc("26eb3b422da5403c3ce83a326549a0f4d500744869384f25f6c31a9dc764c669"));
function inMscDomain(lat, lon) {
	return lat >= 24 && lat <= 72 && lon >= -168 && lon <= -52;
}
function mscTimeIso(unix) {
	return (/* @__PURE__ */ new Date(unix * 1e3)).toISOString().replace(/\.\d{3}Z$/, "Z");
}
function mscGetMapUrl(args) {
	const layer = args.layer === "obs" ? "RADAR_1KM_RRAI" : "Radar_1km_RainPrecipRate-Extrapolation";
	return `https://geo.weather.gc.ca/geomet?${new URLSearchParams({
		SERVICE: "WMS",
		VERSION: "1.3.0",
		REQUEST: "GetMap",
		LAYERS: layer,
		STYLES: "Radar-Rain_14colors",
		CRS: "EPSG:3857",
		BBOX: args.bbox,
		WIDTH: String(Math.max(64, Math.round(args.width))),
		HEIGHT: String(Math.max(64, Math.round(args.height))),
		FORMAT: "image/png",
		TRANSPARENT: "TRUE",
		TIME: mscTimeIso(args.time)
	}).toString()}`;
}
function lon2x(lon) {
	return lon * 20037508.34 / 180;
}
function lat2y(lat) {
	return Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
}
function viewBBox3857(args) {
	const n = 2 ** args.z;
	const cx = (args.lon + 180) / 360 * n;
	const s = Math.sin(args.lat * Math.PI / 180);
	const cy = (.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n;
	const tilesW = 2.15;
	const tilesH = 2.15 * args.cssH / Math.max(1, args.cssW);
	const x0 = cx - tilesW / 2;
	const x1 = cx + tilesW / 2;
	const y0 = cy - tilesH / 2;
	const y1 = cy + tilesH / 2;
	const tile2lon = (x) => x / n * 360 - 180;
	const tile2lat = (y) => {
		const mer = Math.PI * (1 - 2 * y / n);
		return Math.atan(Math.sinh(mer)) * 180 / Math.PI;
	};
	const west = tile2lon(x0);
	const east = tile2lon(x1);
	const north = tile2lat(y0);
	const south = tile2lat(y1);
	return `${lon2x(west)},${lat2y(south)},${lon2x(east)},${lat2y(north)}`;
}
function nearestFrame(frames, t, maxDelta) {
	let best;
	let bestD = Infinity;
	for (const f of frames) {
		const d = Math.abs(f.time - t);
		if (d < bestD) {
			best = f;
			bestD = d;
		}
	}
	return best && bestD <= maxDelta ? best : void 0;
}
/** Last slice that is not in the future — the proper "now" radar frame. */
function nowFrameIndex(frames, now = Date.now() / 1e3) {
	let idx = 0;
	for (let i = 0; i < frames.length; i += 1) if (frames[i].time <= now + 90) idx = i;
	return idx;
}
function buildRadarTimeline(args) {
	const now = args.now ?? Date.now() / 1e3;
	const step = args.stepSec ?? 600;
	const nowTick = Math.floor(now / step) * step;
	const end = nowTick + (args.futureHours ?? 5) * 3600;
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const push = (f) => {
		const key = Math.round(f.time / 30);
		if (seen.has(key)) return;
		seen.add(key);
		out.push(f);
	};
	const mscObs = args.msc?.observed ?? [];
	const mscFc = args.msc?.forecast ?? [];
	if (mscObs.length) for (const t of mscObs) {
		if (t > now + 90) continue;
		push({
			time: t,
			kind: "observed",
			overlay: "msc-obs"
		});
	}
	else {
		const catalogSorted = [...args.catalog].sort((a, b) => a.time - b.time);
		for (const f of catalogSorted) {
			if (f.time > now + 90) continue;
			push({ ...f });
		}
	}
	let lastCovered = out.at(-1)?.time ?? nowTick;
	if (mscFc.length) for (const t of mscFc) {
		if (t <= now + 60) continue;
		push({
			time: t,
			kind: "forecast",
			overlay: "msc-fc"
		});
		lastCovered = Math.max(lastCovered, t);
	}
	for (let t = Math.floor(lastCovered / step) * step + step; t <= end + 1; t += step) {
		const rv = nearestFrame(args.catalog, t, 480);
		if (rv && rv.time > now) {
			push({
				...rv,
				time: t
			});
			continue;
		}
		const model = nearestFrame(args.grid, t, 1500);
		push(model ? {
			...model,
			time: t
		} : {
			time: t,
			kind: "forecast",
			cells: []
		});
	}
	return out;
}
var fetchRadarCatalog = createServerFn({ method: "GET" }).handler(createSsrRpc("863a609e34c3563b807d29e784e5f4e9472c3185c8b5b5cffc6ffdc4f3f304e9"));
var fetchPrecipGrid = createServerFn({ method: "GET" }).validator(object({
	latitude: number().min(-90).max(90),
	longitude: number().min(-180).max(180)
})).handler(createSsrRpc("a18c3671cbbca41ac752d67ab55ebc45fcd3d2935dffba314e0c7217c41206c5"));
var fetchRadarNowcast = createServerFn({ method: "GET" }).validator(object({
	latitude: number().min(-90).max(90),
	longitude: number().min(-180).max(180),
	windDir: number(),
	windSpeedKmh: number()
})).handler(createSsrRpc("15e2b9a1b9e19d4fce08228a67e0ab8734cdef8facc9972da8cad05b3efcba82"));
var BASE = "https://basemaps.cartocdn.com/dark_all";
var MIN_Z = 5;
var MAX_Z = 7;
var okImg = /* @__PURE__ */ new Map();
var imgJobs = {
	inflight: /* @__PURE__ */ new Set(),
	queued: [],
	max: 2
};
function pumpImgJobs() {
	while (imgJobs.inflight.size < imgJobs.max && imgJobs.queued.length) {
		const job = imgJobs.queued.shift();
		if (!job) break;
		if (job.cancelled) {
			job.resolve(null);
			continue;
		}
		const cached = okImg.get(job.src);
		if (cached) {
			job.resolve(cached);
			continue;
		}
		const img = new Image();
		job.img = img;
		imgJobs.inflight.add(job);
		img.crossOrigin = "anonymous";
		const finish = (value) => {
			if (job.done) return;
			job.done = true;
			imgJobs.inflight.delete(job);
			if (!job.cancelled && value) okImg.set(job.src, value);
			job.resolve(job.cancelled ? null : value);
			pumpImgJobs();
		};
		img.onload = () => finish(img);
		img.onerror = () => finish(null);
		img.src = job.src;
	}
}
function cancelRadarLoads() {
	for (const job of imgJobs.queued) {
		if (job.keep) continue;
		job.cancelled = true;
	}
	imgJobs.queued = imgJobs.queued.filter((job) => job.keep && !job.cancelled);
	for (const job of imgJobs.inflight) {
		if (job.keep) continue;
		job.cancelled = true;
		if (job.img) job.img.src = "";
	}
}
function loadImg(src, keep = false) {
	const cached = okImg.get(src);
	if (cached) return Promise.resolve(cached);
	return new Promise((resolve) => {
		const job = {
			src,
			keep,
			cancelled: false,
			done: false,
			img: null,
			resolve
		};
		if (keep) imgJobs.queued.push(job);
		else imgJobs.queued.unshift(job);
		pumpImgJobs();
	});
}
function lon2tile(lon, z) {
	return (lon + 180) / 360 * 2 ** z;
}
function lat2tile(lat, z) {
	const s = Math.sin(lat * Math.PI / 180);
	return (.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 2 ** z;
}
function hourStatus(h, raining, onTheWay, possible, dry) {
	if (h.hereMm >= .15) return raining;
	if (h.arriving || h.fetchMm >= .12) return onTheWay;
	if (h.chance >= 45) return possible;
	return dry;
}
function hash2(x, y) {
	const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
	return s - Math.floor(s);
}
function fbm(x, y) {
	return .57 * hash2(x, y) + .28 * hash2(x * 2.1 + 3.1, y * 2.03) + .15 * hash2(x * 4.2, y * 3.9 + 1.7);
}
function windAxes(deg) {
	const to = (deg + 180) * Math.PI / 180;
	const ux = Math.sin(to);
	const uy = -Math.cos(to);
	return {
		ux,
		uy,
		px: -uy,
		py: ux
	};
}
function metersPerPixel(lat, z) {
	return 156543.03392 * Math.cos(lat * Math.PI / 180) / 2 ** z;
}
function paintRainLayer(tiles, originX, originY, tile, scale, cssW, cssH) {
	const c = document.createElement("canvas");
	c.width = Math.max(1, Math.round(cssW));
	c.height = Math.max(1, Math.round(cssH));
	const ctx = c.getContext("2d", { willReadFrequently: true });
	if (!ctx) return c;
	for (const t of tiles) {
		if (!t.rain) continue;
		ctx.drawImage(t.rain, originX + t.dx * tile * scale, originY + t.dy * tile * scale, tile * scale, tile * scale);
	}
	return c;
}
function paintOverlayImage(img, cssW, cssH) {
	const c = document.createElement("canvas");
	c.width = Math.max(1, Math.round(cssW));
	c.height = Math.max(1, Math.round(cssH));
	const ctx = c.getContext("2d", { willReadFrequently: true });
	if (ctx) {
		ctx.imageSmoothingEnabled = true;
		ctx.drawImage(img, 0, 0, c.width, c.height);
	}
	return c;
}
function blockMean(data, w, h, x0, y0, bs) {
	let s = 0;
	let n = 0;
	const x1 = Math.min(w, x0 + bs);
	const y1 = Math.min(h, y0 + bs);
	for (let y = Math.max(0, y0); y < y1; y += 1) {
		let i = (y * w + Math.max(0, x0)) * 4 + 3;
		for (let x = Math.max(0, x0); x < x1; x += 1) {
			s += data[i];
			n += 1;
			i += 4;
		}
	}
	return n ? s / n : 0;
}
function blockSad(a, b, w, h, ax, ay, bx, by, bs) {
	let s = 0;
	for (let y = 0; y < bs; y += 2) {
		const ya = ay + y;
		const yb = by + y;
		if (ya < 0 || yb < 0 || ya >= h || yb >= h) {
			s += 80 * bs;
			continue;
		}
		let ia = (ya * w + ax) * 4 + 3;
		let ib = (yb * w + bx) * 4 + 3;
		for (let x = 0; x < bs; x += 2) {
			const xa = ax + x;
			const xb = bx + x;
			if (xa < 0 || xb < 0 || xa >= w || xb >= w) {
				s += 80;
				ia += 8;
				ib += 8;
				continue;
			}
			s += Math.abs(a[ia] - b[ib]);
			ia += 8;
			ib += 8;
		}
	}
	return s;
}
function measureFlow(prev, next, dtH, steerUx, steerUy, capPx) {
	const pctx = prev.getContext("2d", { willReadFrequently: true });
	const nctx = next.getContext("2d", { willReadFrequently: true });
	if (!pctx || !nctx) return null;
	const w = prev.width;
	const h = prev.height;
	if (w < 24 || h < 24) return null;
	const a = pctx.getImageData(0, 0, w, h).data;
	const b = nctx.getImageData(0, 0, w, h).data;
	const bs = 12;
	const cols = Math.ceil(w / bs);
	const rows = Math.ceil(h / bs);
	const grid = {
		bs,
		cols,
		rows,
		vx: new Float32Array(cols * rows),
		vy: new Float32Array(cols * rows),
		ax: new Float32Array(cols * rows),
		ay: new Float32Array(cols * rows),
		g: new Float32Array(cols * rows),
		ok: new Uint8Array(cols * rows),
		omega: 0
	};
	const search = 18;
	let hits = 0;
	let svx = 0;
	let svy = 0;
	for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) {
		const x0 = c * bs;
		const y0 = r * bs;
		const i0 = blockMean(a, w, h, x0, y0, bs);
		if (i0 < 10) continue;
		let best = Infinity;
		let bestDx = 0;
		let bestDy = 0;
		for (let dy = -18; dy <= search; dy += 2) for (let dx = -18; dx <= search; dx += 2) {
			const sad = blockSad(a, b, w, h, x0, y0, x0 + dx, y0 + dy, bs);
			if (sad < best) {
				best = sad;
				bestDx = dx;
				bestDy = dy;
			}
		}
		let vx = bestDx / dtH;
		let vy = bestDy / dtH;
		const sp = Math.hypot(vx, vy);
		if (sp > capPx) {
			vx = vx / sp * capPx;
			vy = vy / sp * capPx;
		}
		const i1 = blockMean(b, w, h, x0 + bestDx, y0 + bestDy, bs);
		const g = Math.max(-.7, Math.min(1.05, (i1 - i0) / (i0 + 12) / dtH));
		const idx = r * cols + c;
		grid.vx[idx] = vx;
		grid.vy[idx] = vy;
		grid.g[idx] = g;
		grid.ok[idx] = 1;
		hits += 1;
		svx += vx;
		svy += vy;
	}
	if (hits < 3) return null;
	const meanVx = svx / hits;
	const meanVy = svy / hits;
	grid.omega = 0;
	for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) {
		const idx = r * cols + c;
		if (grid.ok[idx]) continue;
		let nvx = 0;
		let nvy = 0;
		let ng = 0;
		let n = 0;
		for (let rr = r - 1; rr <= r + 1; rr += 1) for (let cc = c - 1; cc <= c + 1; cc += 1) {
			if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
			const j = rr * cols + cc;
			if (!grid.ok[j]) continue;
			nvx += grid.vx[j];
			nvy += grid.vy[j];
			ng += grid.g[j];
			n += 1;
		}
		if (n) {
			grid.vx[idx] = nvx / n;
			grid.vy[idx] = nvy / n;
			grid.g[idx] = ng / n;
		} else {
			grid.vx[idx] = meanVx;
			grid.vy[idx] = meanVy;
		}
	}
	return grid;
}
function heading(vx, vy) {
	return Math.atan2(vy, vx);
}
function wrapAngle(a) {
	while (a > Math.PI) a -= Math.PI * 2;
	while (a < -Math.PI) a += Math.PI * 2;
	return a;
}
function mergeFlowPair(earlier, later, dtH) {
	const n = later.vx.length;
	const out = {
		...later,
		vx: new Float32Array(later.vx),
		vy: new Float32Array(later.vy),
		ax: new Float32Array(n),
		ay: new Float32Array(n),
		g: new Float32Array(later.g),
		ok: new Uint8Array(later.ok),
		omega: 0
	};
	let mvx0 = 0;
	let mvy0 = 0;
	let mvx1 = 0;
	let mvy1 = 0;
	let nh = 0;
	for (let i = 0; i < n; i += 1) if (earlier.ok[i] && later.ok[i]) {
		out.ax[i] = (later.vx[i] - earlier.vx[i]) / dtH;
		out.ay[i] = (later.vy[i] - earlier.vy[i]) / dtH;
		mvx0 += earlier.vx[i];
		mvy0 += earlier.vy[i];
		mvx1 += later.vx[i];
		mvy1 += later.vy[i];
		nh += 1;
	}
	if (nh > 4) out.omega = wrapAngle(heading(mvx1, mvy1) - heading(mvx0, mvy0)) / dtH;
	return out;
}
function lookupFlow(grid, x, y) {
	const c = Math.max(0, Math.min(grid.cols - 1, Math.floor(x / grid.bs)));
	const i = Math.max(0, Math.min(grid.rows - 1, Math.floor(y / grid.bs))) * grid.cols + c;
	return {
		vx: grid.vx[i],
		vy: grid.vy[i],
		ax: grid.ax[i],
		ay: grid.ay[i],
		g: grid.g[i]
	};
}
function splat(data, w, h, x, y, r, g, b, a) {
	const x0 = Math.round(x);
	const y0 = Math.round(y);
	for (let oy = 0; oy <= 1; oy += 1) for (let ox = 0; ox <= 1; ox += 1) {
		const px = x0 + ox;
		const py = y0 + oy;
		if (px < 0 || py < 0 || px >= w || py >= h) continue;
		const i = (py * w + px) * 4;
		const aa = ox === 0 && oy === 0 ? a : a * .92;
		if (aa <= data[i + 3]) continue;
		data[i] = r;
		data[i + 1] = g;
		data[i + 2] = b;
		data[i + 3] = Math.min(255, aa);
	}
}
function evolveRain(source, grid, hours, steerUx, steerUy, steerPx) {
	const out = document.createElement("canvas");
	out.width = source.width;
	out.height = source.height;
	const sctx = source.getContext("2d", { willReadFrequently: true });
	const octx = out.getContext("2d");
	if (!sctx || !octx) return source;
	const src = sctx.getImageData(0, 0, source.width, source.height);
	const dst = octx.createImageData(source.width, source.height);
	const w = source.width;
	const h = source.height;
	const sd = src.data;
	const dd = dst.data;
	const step = 1;
	for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
		const i = (y * w + x) * 4;
		const a0 = sd[i + 3];
		if (a0 < 12) continue;
		const f = lookupFlow(grid, x, y);
		let px = x;
		let py = y;
		const steps = Math.max(3, Math.ceil(hours / .18));
		const dt = hours / steps;
		let lastVx = f.vx;
		let lastVy = f.vy;
		let tAcc = 0;
		for (let s = 0; s < steps; s += 1) {
			const fl = lookupFlow(grid, px, py);
			lastVx = fl.vx + fl.ax * tAcc;
			lastVy = fl.vy + fl.ay * tAcc;
			const ang = grid.omega * dt;
			if (Math.abs(ang) > 1e-5) {
				const ca = Math.cos(ang);
				const sa = Math.sin(ang);
				const nvx = lastVx * ca - lastVy * sa;
				const nvy = lastVx * sa + lastVy * ca;
				lastVx = nvx;
				lastVy = nvy;
			}
			px += lastVx * dt;
			py += lastVy * dt;
			tAcc += dt;
		}
		const jx = (fbm(x * .07, y * .07) - .5) * hours * 6;
		const jy = (fbm(x * .07 + 4, y * .07) - .5) * hours * 6;
		const destX = px + jx;
		const destY = py + jy;
		const grow = Math.max(.92, Math.min(1.28, 1 + f.g * hours * .4));
		const aa = Math.min(255, a0 * grow);
		splat(dd, w, h, destX, destY, sd[i], sd[i + 1], sd[i + 2], aa);
		if (f.g > .12 && hours > .15) {
			const sp = Math.hypot(lastVx, lastVy) || 1;
			const lead = Math.min(22, (5 + f.g * 14) * hours);
			splat(dd, w, h, destX + lastVx / sp * lead, destY + lastVy / sp * lead, sd[i], sd[i + 1], sd[i + 2], aa * Math.min(.55, .28 + f.g * .3));
		}
	}
	octx.putImageData(dst, 0, 0);
	return withSmoke(out);
}
function blurAlpha(a, w, h, radius) {
	const tmp = new Float32Array(w * h);
	const out = new Float32Array(w * h);
	const k = radius * 2 + 1;
	for (let y = 0; y < h; y += 1) {
		let sum = 0;
		for (let x = -radius; x <= radius; x += 1) sum += a[y * w + Math.max(0, Math.min(w - 1, x))];
		for (let x = 0; x < w; x += 1) {
			tmp[y * w + x] = sum / k;
			const add = a[y * w + Math.min(w - 1, x + radius + 1)];
			const sub = a[y * w + Math.max(0, x - radius)];
			sum += add - sub;
		}
	}
	for (let x = 0; x < w; x += 1) {
		let sum = 0;
		for (let y = -radius; y <= radius; y += 1) sum += tmp[Math.max(0, Math.min(h - 1, y)) * w + x];
		for (let y = 0; y < h; y += 1) {
			out[y * w + x] = sum / k;
			const add = tmp[Math.min(h - 1, y + radius + 1) * w + x];
			const sub = tmp[Math.max(0, y - radius) * w + x];
			sum += add - sub;
		}
	}
	return out;
}
function smokeFringe(data, w, h) {
	const a = new Uint16Array(w * h);
	for (let p = 0, i = 3; i < data.length; i += 4, p += 1) a[p] = data[i];
	const mist = blurAlpha(a, w, h, 2);
	for (let p = 0, i = 0; i < data.length; i += 4, p += 1) {
		if (a[p] >= 22) continue;
		const fringe = mist[p];
		if (fringe < 14) continue;
		const t = Math.min(1, (fringe - 14) / 70);
		data[i] = 186;
		data[i + 1] = 214;
		data[i + 2] = 226;
		data[i + 3] = Math.min(72, 10 + fringe * .38 * t);
	}
}
function withSmoke(canvas) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return canvas;
	const { width: w, height: h } = canvas;
	const img = ctx.getImageData(0, 0, w, h);
	smokeFringe(img.data, w, h);
	ctx.putImageData(img, 0, 0);
	const wrap = document.createElement("canvas");
	wrap.width = w;
	wrap.height = h;
	const wctx = wrap.getContext("2d");
	if (!wctx) return canvas;
	wctx.imageSmoothingEnabled = true;
	wctx.filter = "blur(0.9px)";
	wctx.drawImage(canvas, 0, 0);
	wctx.filter = "none";
	wctx.globalAlpha = .88;
	wctx.drawImage(canvas, 0, 0);
	return wrap;
}
function integrateShift(args) {
	const step = .25;
	let { vx, vy } = args;
	let x = 0;
	let y = 0;
	for (let t = 0; t < args.hours;) {
		const dt = Math.min(step, args.hours - t);
		const sp = Math.hypot(vx, vy);
		const ux = sp > .4 ? vx / sp : args.steerUx;
		const uy = sp > .4 ? vy / sp : args.steerUy;
		const turn = Math.min(.28, .1 + t * .045);
		const hx = ux * (1 - turn) + args.steerUx * turn;
		const hy = uy * (1 - turn) + args.steerUy * turn;
		const hn = Math.hypot(hx, hy) || 1;
		const speed = sp * (1 - turn * .65) + args.steerPxPerHour * (turn * .65);
		vx = hx / hn * speed;
		vy = hy / hn * speed;
		x += vx * dt;
		y += vy * dt;
		t += dt;
	}
	return {
		x,
		y
	};
}
function radarRgba(mm) {
	const t = Math.min(1, Math.log2(1 + mm * 3.4) / 3.6);
	if (t < .4) {
		const u = t / .4;
		return [
			36 + u * 20,
			110 + u * 70,
			118 + u * 10,
			22 + u * 90
		];
	}
	if (t < .72) {
		const u = (t - .4) / .32;
		return [
			70 + u * 150,
			175 + u * 35,
			70 - u * 35,
			110 + u * 45
		];
	}
	const u = (t - .72) / .28;
	return [
		210 + u * 40,
		200 - u * 130,
		36,
		155 + u * 50
	];
}
function drawForecastField(ctx, cells, cssW, cssH, originX, originY, tile, scale, z, x0, y0, windDir, alpha = .85) {
	const seeds = cells.filter((c) => c.precipMm >= .04 || (c.chance ?? 0) >= 38).map((c) => ({
		x: originX + (lon2tile(c.longitude, z) - x0) * tile * scale,
		y: originY + (lat2tile(c.latitude, z) - y0) * tile * scale,
		mm: Math.max(c.precipMm, .05),
		dir: c.windDir ?? windDir
	}));
	if (!seeds.length) return;
	const pts = [];
	for (const s of seeds) {
		const { ux, uy, px, py } = windAxes(s.dir);
		pts.push({
			x: s.x,
			y: s.y,
			mm: s.mm,
			ux,
			uy
		});
		for (const along of [
			-1.6,
			-.9,
			-.4,
			.45,
			.95,
			1.55,
			2.2
		]) {
			const fall = 1 - Math.min(.72, Math.abs(along) * .26);
			pts.push({
				x: s.x + ux * along * 34,
				y: s.y + uy * along * 34,
				mm: s.mm * fall,
				ux,
				uy
			});
		}
		pts.push({
			x: s.x + px * 11,
			y: s.y + py * 11,
			mm: s.mm * .38,
			ux,
			uy
		});
		pts.push({
			x: s.x - px * 11,
			y: s.y - py * 11,
			mm: s.mm * .38,
			ux,
			uy
		});
	}
	const step = 2;
	const w = Math.max(1, Math.ceil(cssW / step));
	const h = Math.max(1, Math.ceil(cssH / step));
	const off = document.createElement("canvas");
	off.width = w;
	off.height = h;
	const octx = off.getContext("2d");
	if (!octx) return;
	const img = octx.createImageData(w, h);
	const data = img.data;
	const { ux: gux, uy: guy, px: gpx, py: gpy } = windAxes(windDir);
	for (let iy = 0; iy < h; iy += 1) for (let ix = 0; ix < w; ix += 1) {
		const n0 = fbm(ix * .045, iy * .045);
		const n1 = fbm(ix * .11 + 4, iy * .1);
		const x = (ix + .5) * step + gux * (n0 - .5) * 38 + gpx * (n1 - .5) * 9;
		const y = (iy + .5) * step + guy * (n0 - .5) * 38 + gpy * (n1 - .5) * 9;
		let num = 0;
		let den = 0;
		for (const p of pts) {
			const dx = x - p.x;
			const dy = y - p.y;
			const along = dx * p.ux + dy * p.uy;
			const across = dx * -p.uy + dy * p.ux;
			const d2 = (along / 52) ** 2 + (across / 13) ** 2;
			if (d2 > 1.15) continue;
			const wt = (1 - d2) * (1 - d2);
			num += p.mm * wt;
			den += wt;
		}
		if (den <= 0) continue;
		const ragged = .42 + .58 * fbm(ix * .09 + 9, iy * .08);
		let mm = num / den * ragged;
		if (mm < .07) continue;
		const [r, g, b, a] = radarRgba(mm);
		const i = (iy * w + ix) * 4;
		data[i] = r;
		data[i + 1] = g;
		data[i + 2] = b;
		data[i + 3] = Math.min(200, a * alpha);
	}
	octx.putImageData(img, 0, 0);
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";
	ctx.drawImage(off, 0, 0, cssW, cssH);
	ctx.restore();
}
function composeRadar(args) {
	const { cssW, cssH, dpr, tiles, originX, originY, tile, scale, windDir, z, x0, y0, hoursAhead, shiftX, shiftY, cells, advectRain, evolvedRain, overlay } = args;
	const off = document.createElement("canvas");
	off.width = Math.round(cssW * dpr);
	off.height = Math.round(cssH * dpr);
	const ctx = off.getContext("2d");
	if (!ctx) return off;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	const root = getComputedStyle(document.documentElement);
	const raised = root.getPropertyValue("--color-raised").trim() || "#131a21";
	const rain = root.getPropertyValue("--color-rain").trim() || "#7eb4c6";
	const fg = root.getPropertyValue("--color-fg").trim() || "#e7eef4";
	ctx.fillStyle = raised;
	ctx.fillRect(0, 0, cssW, cssH);
	for (const t of tiles) {
		if (!t.base) continue;
		ctx.drawImage(t.base, originX + t.dx * tile * scale, originY + t.dy * tile * scale, tile * scale, tile * scale);
	}
	const radarAlpha = hoursAhead <= 0 ? 1 : Math.max(.9, 1 - hoursAhead * .018);
	const modelAlpha = hoursAhead <= 0 ? 0 : Math.min(.72, .08 + hoursAhead * .11);
	if (overlay) {
		ctx.save();
		ctx.globalAlpha = radarAlpha;
		ctx.drawImage(overlay, 0, 0, cssW, cssH);
		ctx.restore();
	} else if (evolvedRain && radarAlpha > .04) {
		ctx.save();
		ctx.globalAlpha = radarAlpha;
		ctx.drawImage(evolvedRain, 0, 0, cssW, cssH);
		ctx.restore();
	} else if (advectRain?.length && radarAlpha > .04) {
		ctx.save();
		ctx.globalAlpha = radarAlpha;
		for (const t of advectRain) {
			if (!t.rain) continue;
			ctx.drawImage(t.rain, originX + t.dx * tile * scale + shiftX, originY + t.dy * tile * scale + shiftY, tile * scale, tile * scale);
		}
		ctx.restore();
	} else {
		ctx.globalAlpha = .9;
		for (const t of tiles) {
			if (!t.rain) continue;
			ctx.drawImage(t.rain, originX + t.dx * tile * scale, originY + t.dy * tile * scale, tile * scale, tile * scale);
		}
		ctx.globalAlpha = 1;
	}
	if (cells?.length && (hoursAhead > .05 || !evolvedRain)) drawForecastField(ctx, cells, cssW, cssH, originX, originY, tile, scale, z, x0, y0, windDir, Boolean(evolvedRain || advectRain?.some((t) => t.rain)) ? modelAlpha : Math.max(modelAlpha, .62));
	ctx.globalAlpha = 1;
	const px = cssW / 2;
	const py = cssH / 2;
	const rad = (windDir - 90) * Math.PI / 180;
	ctx.save();
	ctx.strokeStyle = rain;
	ctx.globalAlpha = .7;
	ctx.lineWidth = 1.5;
	ctx.setLineDash([6, 5]);
	ctx.beginPath();
	ctx.moveTo(px - Math.cos(rad) * cssW, py - Math.sin(rad) * cssH);
	ctx.lineTo(px + Math.cos(rad) * cssW, py + Math.sin(rad) * cssH);
	ctx.stroke();
	ctx.restore();
	ctx.beginPath();
	ctx.fillStyle = fg;
	ctx.arc(px, py, 5, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.strokeStyle = rain;
	ctx.lineWidth = 2;
	ctx.arc(px, py, 9, 0, Math.PI * 2);
	ctx.stroke();
	return off;
}
function RadarMap({ forecast, units }) {
	const { locale, t } = useT();
	const { place, current } = forecast;
	const canvasRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const overlayRef = (0, import_react.useRef)(null);
	const [frame, setFrame] = (0, import_react.useState)(0);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [zoom, setZoom] = (0, import_react.useState)(6);
	const [size, setSize] = (0, import_react.useState)({
		w: 0,
		h: 0
	});
	const [mode, setMode] = (0, import_react.useState)("inline");
	const lastBitmap = (0, import_react.useRef)(null);
	const fadeRaf = (0, import_react.useRef)(0);
	const readyRef = (0, import_react.useRef)(false);
	const frameBitmaps = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const catalogQuery = useQuery({
		queryKey: ["radar-catalog"],
		queryFn: () => fetchRadarCatalog(),
		staleTime: 12e4
	});
	const mscQuery = useQuery({
		queryKey: ["msc-radar"],
		queryFn: () => fetchMscRadar(),
		staleTime: 12e4,
		enabled: inMscDomain(place.latitude, place.longitude)
	});
	const nowcastQuery = useQuery({
		queryKey: [
			"radar-nowcast",
			place.latitude,
			place.longitude,
			Math.round(current.windDir)
		],
		queryFn: () => fetchRadarNowcast({ data: {
			latitude: place.latitude,
			longitude: place.longitude,
			windDir: current.windDir,
			windSpeedKmh: current.windSpeedKmh
		} }),
		staleTime: 48e4
	});
	const gridQuery = useQuery({
		queryKey: [
			"precip-grid",
			place.latitude.toFixed(2),
			place.longitude.toFixed(2)
		],
		queryFn: () => fetchPrecipGrid({ data: {
			latitude: place.latitude,
			longitude: place.longitude
		} }),
		staleTime: 48e4
	});
	const frames = (0, import_react.useMemo)(() => buildRadarTimeline({
		catalog: catalogQuery.data?.frames ?? [],
		grid: gridQuery.data ?? [],
		msc: inMscDomain(place.latitude, place.longitude) ? mscQuery.data : null,
		stepSec: 600,
		futureHours: 5
	}), [
		catalogQuery.data?.frames,
		gridQuery.data,
		mscQuery.data,
		place.latitude,
		place.longitude
	]);
	const nowIdx = (0, import_react.useMemo)(() => nowFrameIndex(frames), [frames]);
	const nowcast = nowcastQuery.data;
	const hours = nowcast?.hours?.length ? nowcast.hours : forecast.hourly.slice(0, 6).map((h, i) => ({
		time: h.time,
		hereMm: h.precipMm,
		fetchMm: 0,
		chance: h.rain.chance,
		arriving: i > 0 && h.rain.chance >= 40 && forecast.hourly[0].precipMm < .15
	}));
	const arrival = nowcast?.arrival ?? null;
	const sliderFrame = frames[Math.min(frame, Math.max(0, frames.length - 1))];
	const active = sliderFrame;
	const hasForecast = frames.some((f) => f.kind === "forecast");
	const isForecast = sliderFrame?.kind === "forecast";
	(0, import_react.useEffect)(() => {
		const el = wrapRef.current;
		if (!el) return;
		const apply = () => setSize({
			w: el.clientWidth,
			h: el.clientHeight
		});
		apply();
		const ro = new ResizeObserver(apply);
		ro.observe(el);
		return () => ro.disconnect();
	}, [mode]);
	(0, import_react.useEffect)(() => {
		if (!frames.length) return;
		setFrame(nowIdx);
	}, [frames, nowIdx]);
	(0, import_react.useEffect)(() => {
		if (!playing || frames.length < 2) return;
		const id = window.setInterval(() => {
			setFrame((i) => (i + 1) % frames.length);
		}, 420);
		return () => window.clearInterval(id);
	}, [playing, frames.length]);
	(0, import_react.useEffect)(() => {
		if (mode === "inline") return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e) => {
			if (e.key === "Escape") {
				document.exitFullscreen?.();
				setMode("inline");
			}
		};
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [mode]);
	(0, import_react.useEffect)(() => {
		if (mode !== "os") return;
		const el = overlayRef.current;
		if (!el) return;
		const req = el.requestFullscreen ?? el.webkitRequestFullscreen;
		Promise.resolve(req?.call(el)).catch(() => setMode("page"));
		const onFs = () => {
			if (!document.fullscreenElement) setMode((m) => m === "os" ? "page" : m);
		};
		document.addEventListener("fullscreenchange", onFs);
		return () => document.removeEventListener("fullscreenchange", onFs);
	}, [mode]);
	const tilePlan = (0, import_react.useMemo)(() => {
		const z = zoom;
		return {
			z,
			cx: lon2tile(place.longitude, z),
			cy: lat2tile(place.latitude, z)
		};
	}, [
		place.latitude,
		place.longitude,
		zoom
	]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas || !active || size.w < 8 || size.h < 8) return;
		const cssW = size.w;
		const cssH = size.h;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const pixelW = Math.round(cssW * dpr);
		const pixelH = Math.round(cssH * dpr);
		if (canvas.width !== pixelW || canvas.height !== pixelH) {
			canvas.width = pixelW;
			canvas.height = pixelH;
			const ctx0 = canvas.getContext("2d");
			if (ctx0 && lastBitmap.current) {
				ctx0.setTransform(1, 0, 0, 1, 0, 0);
				ctx0.drawImage(lastBitmap.current, 0, 0, pixelW, pixelH);
			}
		}
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const { z, cx, cy } = tilePlan;
		cancelRadarLoads();
		let cancelled = false;
		const bitmapKey = `${active.time}-${cssW}x${cssH}-${z}-${active.overlay ?? active.kind}`;
		const cachedFrame = frameBitmaps.current.get(bitmapKey);
		if (cachedFrame) {
			lastBitmap.current = cachedFrame;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.globalAlpha = 1;
			ctx.drawImage(cachedFrame, 0, 0, pixelW, pixelH);
			readyRef.current = true;
			setReady(true);
			return;
		}
		const tile = 256;
		const scale = cssW / 2.15 / tile;
		const originX = cssW / 2 - (cx - Math.floor(cx - 1)) * tile * scale;
		const originY = cssH / 2 - (cy - Math.floor(cy - 1)) * tile * scale;
		const x0 = Math.floor(cx - 1);
		const y0 = Math.floor(cy - 1);
		const loadTiles = (f) => {
			const jobs = [];
			for (let dx = 0; dx < 3; dx += 1) for (let dy = 0; dy < 3; dy += 1) {
				const tx = x0 + dx;
				const ty = y0 + dy;
				const max = 2 ** z;
				if (ty < 0 || ty >= max) continue;
				const wx = (tx % max + max) % max;
				const rainUrl = f.tileUrl ? f.tileUrl.replace("{z}", String(z)).replace("{x}", String(wx)).replace("{y}", String(ty)) : "";
				jobs.push(Promise.all([loadImg(`${BASE}/${z}/${wx}/${ty}@2x.png`, true), rainUrl ? loadImg(rainUrl, false) : Promise.resolve(null)]).then(([base, rain]) => ({
					dx,
					dy,
					base,
					rain
				})));
			}
			return Promise.all(jobs);
		};
		(async () => {
			const tiles = await loadTiles(active);
			if (cancelled) return;
			const bbox = viewBBox3857({
				lat: place.latitude,
				lon: place.longitude,
				z,
				cssW,
				cssH
			});
			const overlayUrl = active.overlay ? mscGetMapUrl({
				layer: active.overlay === "msc-fc" ? "fc" : "obs",
				time: active.time,
				bbox,
				width: cssW,
				height: cssH
			}) : "";
			const overlay = overlayUrl ? await loadImg(overlayUrl, false) : null;
			if (cancelled) return;
			const isFc = active.kind === "forecast";
			const mscObsFrames = frames.filter((f) => f.overlay === "msc-obs");
			const mscSource = frames.filter((f) => f.overlay === "msc-fc").at(-1) ?? mscObsFrames.at(-1);
			const overlayFor = (f, keep) => {
				if (!f?.overlay) return Promise.resolve(null);
				return loadImg(mscGetMapUrl({
					layer: f.overlay === "msc-fc" ? "fc" : "obs",
					time: f.time,
					bbox,
					width: cssW,
					height: cssH
				}), keep);
			};
			const withTiles = frames.filter((f) => f.tileUrl);
			const nowSec = Date.now() / 1e3;
			const catalogPast = (catalogQuery.data?.frames ?? []).filter((f) => f.tileUrl && f.time <= nowSec + 90).slice().sort((a, b) => a.time - b.time);
			const source = withTiles.at(-1);
			const nPast = catalogPast.length;
			const trackNow = catalogPast.at(-1);
			const trackMid = nPast >= 7 ? catalogPast[nPast - 7] : catalogPast.at(-Math.min(nPast, 4));
			const trackOld = nPast >= 3 ? catalogPast[0] : void 0;
			const skipTrack = Boolean(overlay);
			const useMsc = Boolean(!overlay && isFc && mscSource);
			const advectRain = !skipTrack && !useMsc && isFc && source && source !== active ? await loadTiles(source) : void 0;
			const [nowRain, midRain, oldRain] = skipTrack || useMsc ? [
				void 0,
				void 0,
				void 0
			] : await Promise.all([
				isFc && trackNow ? loadTiles(trackNow) : Promise.resolve(void 0),
				isFc && trackMid && trackMid !== trackNow ? loadTiles(trackMid) : Promise.resolve(void 0),
				isFc && trackOld && trackOld !== trackMid ? loadTiles(trackOld) : Promise.resolve(void 0)
			]);
			if (cancelled) return;
			const hoursAhead = active.overlay === "msc-fc" ? 0 : useMsc && mscSource ? Math.max(0, (active.time - mscSource.time) / 3600) : isFc && source ? Math.max(0, (active.time - source.time) / 3600) : 0;
			const { ux, uy } = windAxes(current.windDir);
			const mpp = metersPerPixel(place.latitude, z) / Math.max(scale, .2);
			const steerPx = Math.max(current.windSpeedKmh * 1.85, 18) * 1e3 / mpp;
			const cap = 14e4 / mpp;
			let vx = ux * steerPx;
			let vy = uy * steerPx;
			let evolvedRain = null;
			if (useMsc && mscSource) {
				const srcImg = await overlayFor(mscSource, true);
				const trackB = mscObsFrames.at(-1);
				const trackA = mscObsFrames.length >= 8 ? mscObsFrames.at(-8) : mscObsFrames[0];
				const [aImg, bImg] = await Promise.all([overlayFor(trackA, true), overlayFor(trackB, true)]);
				if (cancelled) return;
				if (srcImg && aImg && bImg && trackA && trackB && trackA !== trackB) {
					const sourceC = paintOverlayImage(srcImg, cssW, cssH);
					const flow = measureFlow(paintOverlayImage(aImg, cssW, cssH), paintOverlayImage(bImg, cssW, cssH), Math.max(.25, (trackB.time - trackA.time) / 3600), ux, uy, cap);
					if (flow) {
						evolvedRain = evolveRain(sourceC, flow, hoursAhead, ux, uy, steerPx);
						let mvx = 0;
						let mvy = 0;
						let n = 0;
						for (let i = 0; i < flow.ok.length; i += 1) {
							if (!flow.ok[i]) continue;
							mvx += flow.vx[i];
							mvy += flow.vy[i];
							n += 1;
						}
						if (n) {
							vx = mvx / n;
							vy = mvy / n;
						}
					}
				}
			} else if (!overlay && nowRain && midRain && trackNow && trackMid && advectRain) {
				const laterC = paintRainLayer(nowRain, originX, originY, tile, scale, cssW, cssH);
				const midC = paintRainLayer(midRain, originX, originY, tile, scale, cssW, cssH);
				const sourceC = paintRainLayer(advectRain, originX, originY, tile, scale, cssW, cssH);
				const dtLate = Math.max(.25, (trackNow.time - trackMid.time) / 3600);
				const flowLate = measureFlow(midC, laterC, dtLate, ux, uy, cap);
				let flow = flowLate;
				if (flowLate && oldRain && trackOld) {
					const oldC = paintRainLayer(oldRain, originX, originY, tile, scale, cssW, cssH);
					const dtEarly = Math.max(.25, (trackMid.time - trackOld.time) / 3600);
					const flowEarly = measureFlow(oldC, midC, dtEarly, ux, uy, cap);
					if (flowEarly) flow = mergeFlowPair(flowEarly, flowLate, Math.max(.25, (dtEarly + dtLate) / 2));
				}
				if (flow) {
					evolvedRain = evolveRain(sourceC, flow, hoursAhead, ux, uy, steerPx);
					let mvx = 0;
					let mvy = 0;
					let n = 0;
					for (let i = 0; i < flow.ok.length; i += 1) {
						if (!flow.ok[i]) continue;
						mvx += flow.vx[i];
						mvy += flow.vy[i];
						n += 1;
					}
					if (n) {
						vx = mvx / n;
						vy = mvy / n;
					}
				}
			}
			if (!evolvedRain) {
				const drift = integrateShift({
					hours: hoursAhead,
					vx,
					vy,
					steerUx: ux,
					steerUy: uy,
					steerPxPerHour: steerPx
				});
				vx = drift.x;
				vy = drift.y;
			}
			const next = composeRadar({
				cssW,
				cssH,
				dpr,
				tiles,
				originX,
				originY,
				tile,
				scale,
				windDir: current.windDir,
				z,
				x0,
				y0,
				hoursAhead,
				shiftX: evolvedRain ? 0 : vx,
				shiftY: evolvedRain ? 0 : vy,
				cells: isFc && !overlay ? active.cells : void 0,
				advectRain: overlay ? void 0 : advectRain,
				evolvedRain: overlay ? null : evolvedRain,
				overlay
			});
			if (cancelled) return;
			frameBitmaps.current.set(bitmapKey, next);
			if (frameBitmaps.current.size > 48) {
				const first = frameBitmaps.current.keys().next().value;
				if (first) frameBitmaps.current.delete(first);
			}
			const prev = lastBitmap.current;
			lastBitmap.current = next;
			cancelAnimationFrame(fadeRaf.current);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.globalAlpha = 1;
			if (!prev || !readyRef.current || !playing) {
				ctx.drawImage(next, 0, 0);
				readyRef.current = true;
				setReady(true);
				return;
			}
			const start = performance.now();
			const dur = 180;
			const tick = (now) => {
				if (cancelled) return;
				const t = Math.min(1, (now - start) / dur);
				const eased = 1 - (1 - t) * (1 - t);
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.globalAlpha = 1;
				ctx.drawImage(prev, 0, 0, canvas.width, canvas.height);
				ctx.globalAlpha = eased;
				ctx.drawImage(next, 0, 0);
				ctx.globalAlpha = 1;
				if (t < 1) fadeRaf.current = requestAnimationFrame(tick);
			};
			fadeRaf.current = requestAnimationFrame(tick);
		})();
		return () => {
			cancelled = true;
			cancelRadarLoads();
			cancelAnimationFrame(fadeRaf.current);
		};
	}, [
		active,
		tilePlan,
		current.windDir,
		current.windSpeedKmh,
		place.latitude,
		size.w,
		size.h,
		frames,
		catalogQuery.data?.frames,
		playing
	]);
	const stamp = sliderFrame ? new Intl.DateTimeFormat(localeTag(locale), {
		hour: "numeric",
		minute: "2-digit"
	}).format(/* @__PURE__ */ new Date(sliderFrame.time * 1e3)) : "—";
	const from = fromThe(current.windDir, locale);
	const fromWord = windLong(current.windDir, locale);
	const etaLabel = arrival ? formatEta(arrival.minutes, locale) : "";
	const headline = arrival ? arrival.minutes === 0 ? t("rainingNow") : t("rainEta", { label: etaLabel }) : nowcast?.hours?.length ? t("noRainHeaded") : t("watchThe", { from });
	const copy = arrival ? arrivalCopy({
		minutes: arrival.minutes,
		km: arrival.km,
		windDir: current.windDir,
		windSpeedKmh: current.windSpeedKmh,
		rainingHere: arrival.minutes === 0,
		locale
	}) : t("radarCopy", { from });
	function closeView() {
		if (document.fullscreenElement) document.exitFullscreen();
		setMode("inline");
	}
	const panel = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("min-w-0 overflow-hidden bg-surface", mode === "inline" ? "rounded-2xl shadow-[var(--shadow-border)] lg:col-span-2" : "flex h-full min-h-0 flex-col rounded-none"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, { className: "size-3.5" }), t("radar")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-xl font-medium leading-tight text-fg",
							children: headline
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-prose text-sm text-muted",
							children: copy
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-xl bg-raised px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindArrow, {
							deg: current.windDir,
							wet: (arrival?.precipMm ?? current.rain.chance) > 40
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-fg",
								children: t("fromThe", { from: fromWord })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted",
								children: formatSpeed(current.windSpeedKmh, units)
							})]
						})]
					}), mode === "inline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "icon",
						variant: "secondary",
						className: "size-9",
						onClick: () => setMode("page"),
						"aria-label": t("fillPage"),
						title: t("fillPage"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "icon",
						variant: "secondary",
						className: "size-9",
						onClick: () => setMode("os"),
						"aria-label": t("fullscreen"),
						title: t("fullscreen"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Expand, { className: "size-4" })
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [mode === "page" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "icon",
						variant: "secondary",
						className: "size-9",
						onClick: () => setMode("os"),
						"aria-label": "Fullscreen",
						title: "Fullscreen",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Expand, { className: "size-4" })
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "icon",
						variant: "secondary",
						className: "size-9",
						onClick: closeView,
						"aria-label": t("close"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: wrapRef,
				"data-no-smooth": "",
				className: cn("relative mt-3 w-full overflow-hidden bg-raised", mode === "inline" ? "h-[240px] sm:h-[300px]" : "min-h-0 flex-1"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						className: "block h-full w-full",
						"aria-label": t("radarAria", { name: place.name })
					}),
					!ready && !catalogQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 animate-pulse bg-raised" }) : null,
					catalogQuery.isError && !frames.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "absolute inset-0 grid place-items-center px-6 text-center text-sm text-muted",
						children: t("radarUnavailable")
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute left-3 top-3 flex flex-col gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-md bg-bg/75 px-2 py-1 text-[11px] text-fg backdrop-blur-sm",
							children: place.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("rounded-md px-2 py-1 text-[11px] font-medium backdrop-blur-sm", isForecast ? "bg-accent text-accent-fg" : "bg-bg/75 text-muted"),
							children: isForecast ? t("forecastStamp", { stamp }) : stamp
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute right-3 top-3 flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "icon",
							variant: "secondary",
							className: "size-9",
							disabled: zoom <= MIN_Z,
							onClick: () => setZoom((z) => Math.max(MIN_Z, z - 1)),
							"aria-label": t("zoomOut"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "icon",
							variant: "secondary",
							className: "size-9",
							disabled: zoom >= MAX_Z,
							onClick: () => setZoom((z) => Math.min(MAX_Z, z + 1)),
							"aria-label": t("zoomIn"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pointer-events-none absolute bottom-3 right-3 rounded-md bg-bg/75 px-2 py-1 text-[11px] text-muted backdrop-blur-sm",
						children: t("youAreHere")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 px-4 py-3 sm:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "secondary",
					className: "shrink-0 px-3",
					onClick: () => setPlaying((p) => !p),
					children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playing ? t("pause") : t("play")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: Math.max(0, frames.length - 1),
							step: 1,
							value: Math.min(frame, Math.max(0, frames.length - 1)),
							onChange: (e) => {
								setPlaying(false);
								setFrame(Number(e.target.value));
							},
							className: "h-2 w-full accent-rain",
							"aria-label": t("radarTimeAria")
						}), frames.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pointer-events-none absolute top-0 h-2 w-px bg-fg/70",
							style: { left: `${nowIdx / Math.max(1, frames.length - 1) * 100}%` },
							"aria-hidden": true
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-1 h-4 text-[11px] text-faint",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "absolute left-0",
								children: [
									"-",
									Math.max(1, Math.round(((frames[nowIdx]?.time ?? 0) - (frames[0]?.time ?? 0)) / 3600)),
									"h"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -translate-x-1/2 text-muted",
								style: { left: `${frames.length > 1 ? nowIdx / (frames.length - 1) * 100 : 50}%` },
								children: t("now")
							}),
							hasForecast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute right-0",
								children: "+5h"
							}) : null
						]
					})]
				})]
			}),
			hours.length && mode === "inline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border px-4 py-3 sm:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
					children: t("next6")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, {
					label: t("next6"),
					children: hours.map((h, i) => {
						const status = hourStatus(h, t("statusRaining"), t("statusOnTheWay"), t("statusPossible"), t("statusDry"));
						const wet = status !== "Dry";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("flex w-[4.6rem] shrink-0 flex-col items-center gap-1 rounded-xl px-1 py-2", i === 0 ? "bg-raised" : ""),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-medium text-muted",
									children: i === 0 ? t("now") : formatHour(h.time, locale)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: cn("text-sm font-medium tabular-nums", wet ? "text-rain" : "text-fg"),
									children: [h.chance, "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-center text-[10px] leading-tight text-faint",
									children: status
								})
							]
						}, h.time);
					})
				})]
			}) : null
		]
	});
	if (mode === "inline") return panel;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: overlayRef,
		className: "fixed inset-0 z-50 bg-bg",
		children: panel
	}), document.body);
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
	const { locale, t } = useT();
	const { current, nextRain, windShift, place } = forecast;
	const rain = (0, import_react.useMemo)(() => estimateRain({
		modelProb: current.rain.modelChance,
		rh: current.humidity,
		tempC: current.temperatureC,
		dewpointC: current.dewpointC,
		windDir: current.windDir,
		windSpeedKmh: current.windSpeedKmh,
		cloudCover: current.cloudCover,
		latitude: place.latitude,
		locale
	}), [
		current,
		place.latitude,
		locale
	]);
	const tone = rain.chance >= 60 ? "wet" : rain.chance >= 30 ? "maybe" : "dry";
	const from = fromThe(current.windDir, locale);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
						children: t("estimate")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-xl font-medium leading-tight text-fg sm:text-2xl",
						children: t("rainFrom", { from })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: "shrink-0",
					variant: tone === "wet" ? "rain" : tone === "maybe" ? "warn" : "default",
					children: tone === "wet" ? t("likely") : tone === "maybe" ? t("watch") : t("quiet")
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
						children: t("nextWet")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							formatClock(nextRain.time, locale),
							" · ",
							nextRain.rain.chance,
							"% ",
							fromThe(nextRain.windDir, locale)
						]
					})] })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2 rounded-xl bg-raised px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudRain, { className: "mt-0.5 size-4 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: t("next24short")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: t("nextWetNone")
					})] })]
				}), windShift ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2 rounded-xl bg-raised px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-0.5 size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: t("windShift")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: t("windShiftCopy", {
							from: fromThe(windShift.from, locale),
							to: fromThe(windShift.to, locale),
							hours: windShift.hours
						})
					})] })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2 rounded-xl bg-raised px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-0.5 size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: t("steadyFetch")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: t("steadyCopy", { from })
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
	const { t } = useT();
	if (places.length === 0 && recent.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HScroll, {
		label: t("savedPlaces"),
		fadeFrom: "from-bg",
		contentClassName: "gap-2 px-1",
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
				"aria-label": t("removePlace", { name: p.name }),
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
var GeoError = class extends Error {
	kind;
	constructor(message, kind) {
		super(message);
		this.kind = kind;
		this.name = "GeoError";
	}
};
function isAppleTouch() {
	if (typeof navigator === "undefined") return false;
	const ua = navigator.userAgent;
	if (/iP(hone|od|ad)/.test(ua)) return true;
	if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
	return navigator.vendor === "Apple Computer, Inc." && "ontouchend" in window;
}
function isInAppBrowser() {
	const ua = navigator.userAgent;
	return /FBAN|FBAV|Instagram|Twitter|Line\/|WhatsApp|Snapchat|GSA\//.test(ua);
}
function wrap(err) {
	const code = err && typeof err === "object" && "code" in err ? Number(err.code) : 0;
	if (isInAppBrowser()) return new GeoError("Open this page in Safari (not in-app), then tap locate.", "inapp");
	if (code === 1) return new GeoError("Location is blocked. iPhone: Settings → Privacy & Security → Location Services → Safari Websites → Allow, then reload.", "denied");
	if (code === 3) return new GeoError("Location timed out. Turn on Location Services / Wi-Fi and try again.", "timeout");
	return new GeoError("Could not read your location. Check Location Services is on for Safari.", "unavailable");
}
/**
* Start GPS in the same tick as the tap. iOS Safari often ignores
* getCurrentPosition timeouts and only delivers via watchPosition.
*/
function readDevicePosition() {
	if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.reject(new GeoError("Location is not available in this browser.", "missing"));
	return new Promise((resolve, reject) => {
		let settled = false;
		const watches = [];
		const done = (fn) => {
			if (settled) return;
			settled = true;
			window.clearTimeout(watchdog);
			window.clearTimeout(lowAcc);
			for (const id of watches) navigator.geolocation.clearWatch(id);
			fn();
		};
		const onOk = (pos) => done(() => resolve(pos));
		const onDenied = (err) => {
			if (err.code === 1) done(() => reject(wrap(err)));
		};
		const high = {
			enableHighAccuracy: true,
			timeout: 6e4,
			maximumAge: 0
		};
		const low = {
			enableHighAccuracy: false,
			timeout: 25e3,
			maximumAge: 12e4
		};
		try {
			watches.push(navigator.geolocation.watchPosition(onOk, onDenied, high));
		} catch (err) {
			done(() => reject(wrap(err)));
			return;
		}
		navigator.geolocation.getCurrentPosition(onOk, onDenied, high);
		const lowAcc = window.setTimeout(() => {
			if (settled) return;
			navigator.geolocation.getCurrentPosition(onOk, onDenied, low);
			try {
				watches.push(navigator.geolocation.watchPosition(onOk, onDenied, low));
			} catch {}
		}, 2800);
		const watchdog = window.setTimeout(() => {
			done(() => reject(wrap(Object.assign(/* @__PURE__ */ new Error("timeout"), { code: 3 }))));
		}, 45e3);
	});
}
function ForecastApp() {
	const { user } = useCurrentUserState();
	const { t } = useT();
	const place = useWeatherStore((s) => s.place);
	const units = useWeatherStore((s) => s.units);
	const recent = useWeatherStore((s) => s.recent);
	const setPlace = useWeatherStore((s) => s.setPlace);
	const locale = useWeatherStore((s) => s.locale);
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
		if (isAppleTouch()) toast(t("toastLocateAllow"));
		setLocating(true);
		readDevicePosition().then((pos) => reversePlace({ data: {
			latitude: pos.coords.latitude,
			longitude: pos.coords.longitude,
			language: locale
		} }).then(setPlace).catch(() => setPlace({
			name: t("yourLocation"),
			latitude: pos.coords.latitude,
			longitude: pos.coords.longitude
		}))).catch((err) => {
			const kind = err instanceof GeoError ? err.kind : "unavailable";
			toast(t(kind === "missing" ? "geoMissing" : kind === "denied" ? "geoDenied" : kind === "timeout" ? "geoTimeout" : kind === "inapp" ? "geoInApp" : "geoUnavailable"));
		}).finally(() => setLocating(false));
	}
	async function onRemove(id) {
		try {
			await removePlace({ data: { id } });
			await savedQuery.refetch();
		} catch {
			toast(t("toastRemoveFail"));
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
				message: forecastQuery.error instanceof Error ? forecastQuery.error.message : t("loadFail")
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadarMap, {
						forecast,
						units
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 lg:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RainBrief, { forecast })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowItWorks, {})
				]
			}) : null]
		})]
	});
}
function EmptyState({ onPick, onLocate, locating }) {
	const { t } = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl py-4 text-center sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-4xl font-medium tracking-tight text-fg sm:text-6xl",
				children: "Vane"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted sm:text-base",
				children: t("emptyLead")
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
				children: locating ? t("locating") : t("locate")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
				children: t("tryACity")
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
	const { t } = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-medium",
				children: t("forecastUnavailable")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onRetry,
				className: "mt-5 h-11 rounded-lg bg-accent px-5 text-sm font-medium text-accent-fg",
				children: t("tryAgain")
			})
		]
	});
}
function HowItWorks({ compact = false }) {
	const { t } = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: compact ? "mt-8 text-left text-sm text-muted sm:mt-12" : "rounded-2xl bg-surface p-4 text-sm text-muted shadow-[var(--shadow-border)] sm:p-5 lg:col-span-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[11px] font-medium uppercase tracking-[0.16em] text-faint",
			children: t("howTitle")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 leading-relaxed",
			children: t("howBody")
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForecastApp, {});
}
//#endregion
export { Home as component };
