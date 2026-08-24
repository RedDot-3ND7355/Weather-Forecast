import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createRootRoute, b as useRouter, d as HeadContent, g as createFileRoute, h as lazyRouteComponent, m as Outlet, p as createRouter, u as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as QueryClientProvider, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn, s as __exportAll } from "./ssr.mjs";
import { fn as literal, hn as object, mn as number, vn as string, yn as union } from "../_libs/@better-auth/core+[...].mjs";
import { n as auth } from "./server-C7Y7B70S.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { r as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BQ3pb1pf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-danger",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-xl font-medium",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function AppProviders({ children }) {
	const [queryClient] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		retry: 1,
		refetchOnWindowFocus: false,
		staleTime: 6e4
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			theme: "dark",
			position: "bottom-center",
			toastOptions: { classNames: {
				toast: "bg-raised text-fg shadow-[var(--shadow-border)] border-0",
				title: "text-fg",
				description: "text-muted"
			} }
		})]
	});
}
var CRITICAL_BOOT_CSS = `
html{color-scheme:dark;background:#0b1014}
html,body,#app{background:#0b1014;color:#e7eef4;margin:0}
#vane-splash{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#0b1014;color:#e7eef4;opacity:1;transition:opacity .7s cubic-bezier(.22,1,.36,1)}
#vane-splash.is-out{opacity:0;pointer-events:none}
#vane-splash .inner{display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px}
#vane-splash .mark{width:52px;height:52px}
#vane-splash .needle{transform-origin:16px 16px;animation:vane-sweep 2.8s cubic-bezier(.22,1,.36,1) infinite}
#vane-splash .word{margin:0;font:500 1.65rem/1 Georgia,ui-serif,serif;letter-spacing:-0.03em}
#vane-splash .sub{margin:0;font:500 .68rem/1.4 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#667380}
@keyframes vane-sweep{0%,100%{transform:rotate(-18deg)}50%{transform:rotate(22deg)}}
@media (prefers-reduced-motion:reduce){
  #vane-splash{transition:opacity .2s linear}
  #vane-splash .needle{animation:none}
}
`;
function BootSplash() {
	const [out, setOut] = (0, import_react.useState)(false);
	const [gone, setGone] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const started = performance.now();
		let startTimer = 0;
		let fallback = 0;
		const MIN_MS = 700;
		const fade = () => {
			const wait = Math.max(0, MIN_MS - (performance.now() - started));
			startTimer = window.setTimeout(() => setOut(true), wait);
		};
		const pending = [...document.querySelectorAll("link[rel=\"stylesheet\"]")].filter((n) => !n.sheet);
		if (pending.length === 0) requestAnimationFrame(() => requestAnimationFrame(fade));
		else {
			let left = pending.length;
			const onOne = () => {
				left -= 1;
				if (left <= 0) fade();
			};
			for (const n of pending) {
				n.addEventListener("load", onOne, { once: true });
				n.addEventListener("error", onOne, { once: true });
			}
		}
		fallback = window.setTimeout(() => setOut(true), 2400);
		return () => {
			window.clearTimeout(startTimer);
			window.clearTimeout(fallback);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!out) return;
		const t = window.setTimeout(() => setGone(true), 900);
		return () => window.clearTimeout(t);
	}, [out]);
	if (gone) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: "vane-splash",
		className: out ? "is-out" : void 0,
		role: "status",
		"aria-live": "polite",
		"aria-busy": !out,
		onTransitionEnd: (e) => {
			if (e.target !== e.currentTarget) return;
			if (e.propertyName !== "opacity") return;
			if (out) setGone(true);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "inner",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					className: "mark",
					viewBox: "0 0 32 32",
					"aria-hidden": "true",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "16",
							cy: "16",
							r: "11.2",
							fill: "none",
							stroke: "#9bb8c4",
							strokeWidth: "1.3"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							className: "needle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M16 5.6 L18.4 16 L16 14.4 L13.6 16 Z",
								fill: "#e7eef4"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M16 26.4 L17.5 16.6 L16 17.6 L14.5 16.6 Z",
								fill: "#9bb8c4"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "16",
							cy: "16",
							r: "1.7",
							fill: "#0b1014",
							stroke: "#9bb8c4",
							strokeWidth: "1.1"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "word",
					children: "Vane"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "sub",
					children: "Rain follows the wind"
				})
			]
		})
	});
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function pushFlick(buf, p, windowMs = 140) {
	const t = performance.now();
	buf.push({
		t,
		p
	});
	const cut = t - windowMs;
	while (buf.length > 2 && buf[0].t < cut) buf.shift();
}
/** Pixels per frame from the strongest slice in the last ~140ms. */
function flickVelocity(buf) {
	if (buf.length < 2) return 0;
	const end = buf[buf.length - 1];
	let best = 0;
	for (const s of buf) {
		const dt = end.t - s.t;
		if (dt < 20 || dt > 160) continue;
		const v = (s.p - end.p) / dt * 16.67;
		if (Math.abs(v) > Math.abs(best)) best = v;
	}
	return best;
}
var IGNORE = "input, textarea, select, [contenteditable], canvas, [data-h-scroll], [data-no-smooth]";
function ignore(target) {
	return target instanceof Element && Boolean(target.closest(IGNORE));
}
function maxY() {
	return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}
function clamp(y) {
	return Math.max(0, Math.min(maxY(), y));
}
function SmoothScroll() {
	(0, import_react.useEffect)(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const html = document.documentElement;
		html.classList.add("vane-smooth");
		let current = window.scrollY;
		let target = window.scrollY;
		let vel = 0;
		let raf = 0;
		let dragging = false;
		let coasting = false;
		let axis = null;
		let startY = 0;
		let startX = 0;
		let startScroll = 0;
		let samples = [];
		let driving = false;
		const stop = () => {
			cancelAnimationFrame(raf);
			raf = 0;
		};
		const tick = () => {
			if (dragging) {
				raf = requestAnimationFrame(tick);
				return;
			}
			vel *= .935;
			target = clamp(target + vel);
			current += (target - current) * .22;
			if (Math.abs(target - current) < .4 && Math.abs(vel) < .22) {
				current = target;
				vel = 0;
				coasting = false;
				driving = true;
				window.scrollTo(0, current);
				driving = false;
				raf = 0;
				return;
			}
			driving = true;
			window.scrollTo(0, current);
			driving = false;
			raf = requestAnimationFrame(tick);
		};
		const kick = () => {
			if (!raf) raf = requestAnimationFrame(tick);
		};
		const onWheel = (e) => {
			if (e.ctrlKey) return;
			if (ignore(e.target)) return;
			if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
			e.preventDefault();
			coasting = true;
			target = clamp(target + e.deltaY);
			vel += e.deltaY * .045;
			kick();
		};
		const onTouchStart = (e) => {
			if (e.touches.length !== 1) {
				axis = null;
				dragging = false;
				return;
			}
			if (ignore(e.target)) {
				axis = "x";
				return;
			}
			stop();
			vel = 0;
			coasting = false;
			axis = null;
			const t = e.touches[0];
			startY = t.clientY;
			startX = t.clientX;
			startScroll = window.scrollY;
			current = startScroll;
			target = startScroll;
			samples = [];
			pushFlick(samples, t.clientY);
		};
		const onTouchMove = (e) => {
			if (e.touches.length !== 1 || axis === "x") return;
			const t = e.touches[0];
			const dx = t.clientX - startX;
			const dy = t.clientY - startY;
			if (!axis) {
				if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) + 2) {
					axis = "x";
					return;
				}
				if (Math.abs(dy) < 4) return;
				axis = "y";
				dragging = true;
			}
			if (axis !== "y") return;
			e.preventDefault();
			pushFlick(samples, t.clientY);
			current = clamp(startScroll - dy);
			target = current;
			driving = true;
			window.scrollTo(0, current);
			driving = false;
		};
		const onTouchEnd = () => {
			if (axis === "y") {
				vel = flickVelocity(samples);
				dragging = false;
				coasting = true;
				kick();
			}
			axis = null;
			dragging = false;
		};
		const onScroll = () => {
			if (driving || dragging || coasting) return;
			current = window.scrollY;
			target = current;
			vel = 0;
		};
		window.addEventListener("wheel", onWheel, { passive: false });
		window.addEventListener("touchstart", onTouchStart, { passive: true });
		window.addEventListener("touchmove", onTouchMove, { passive: false });
		window.addEventListener("touchend", onTouchEnd);
		window.addEventListener("touchcancel", onTouchEnd);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			stop();
			html.classList.remove("vane-smooth");
			window.removeEventListener("wheel", onWheel);
			window.removeEventListener("touchstart", onTouchStart);
			window.removeEventListener("touchmove", onTouchMove);
			window.removeEventListener("touchend", onTouchEnd);
			window.removeEventListener("touchcancel", onTouchEnd);
			window.removeEventListener("scroll", onScroll);
		};
	}, []);
	return null;
}
var styles_default = "/assets/styles-DutvRoOy.css";
var APP_NAME = "Vane";
var fetchSessionUser = createServerFn({ method: "GET" }).handler(createSsrRpc("2c4985e96c199268f7f639534cb5e8e31d6b19d43286bf77416413db60ffde26"));
var Route$3 = createRootRoute({
	beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{
				httpEquiv: "Permissions-Policy",
				content: "geolocation=*, accelerometer=(self), gyroscope=(self), magnetometer=(self)"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0b1014"
			},
			{
				name: "description",
				content: "A wind-aware weather forecast. Vane reads the bearing moisture is arriving from and estimates rain from that fetch."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		style: {
			background: "#0b1014",
			colorScheme: "dark"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { dangerouslySetInnerHTML: { __html: CRITICAL_BOOT_CSS } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "min-h-dvh overflow-x-clip bg-bg text-fg",
			style: {
				background: "#0b1014",
				color: "#e7eef4"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootSplash, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmoothScroll, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$1 = () => import("./routes-D0SAMK9K.mjs");
var Route$2 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./login-lKAk-JH-.mjs");
var Route$1 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var rootRouteChildren = {
	IndexRoute: Route$2.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$3
	}),
	LoginRoute: Route$1.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$3
	}),
	ApiAuthSplatRoute: Route.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$3
	})
};
var routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { createSsrRpc as i, flickVelocity as n, pushFlick as r, router_exports as t };
