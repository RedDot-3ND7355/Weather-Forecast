import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { r as signIn } from "./client-sGid3STf.mjs";
import { t as GROK_PROVIDERS } from "./server-Cfz4w_JD.mjs";
import { t as Button } from "./button-CDM_JShd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DeUQXPvu.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative grid min-h-screen place-items-center overflow-hidden px-6 py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			className: "login-glow pointer-events-none absolute inset-0 opacity-40"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "mb-8 flex flex-col items-center text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompassMark, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-4 font-display text-4xl font-medium tracking-tight text-fg",
							children: "Vane"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 text-sm text-muted",
							children: "Sign in to save places and their rain bearings."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							className: "w-full justify-center",
							onClick: () => signIn(p.providerId, { callbackURL: "/" }),
							children: [
								p.label === "Google" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XMark, {}),
								"Continue with ",
								p.label
							]
						}, p.providerId))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "text-sm text-muted hover:text-fg",
						children: "Continue without an account"
					})
				})
			]
		})]
	});
}
function CompassMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 64 64",
		className: "size-16 text-accent",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "32",
				cy: "32",
				r: "28",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6",
				opacity: "0.7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "32",
				cy: "32",
				r: "22",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "0.8",
				opacity: "0.35"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M32 8 L36.4 32 L32 28.4 L27.6 32 Z",
				fill: "var(--color-fg)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M32 56 L35.2 33.4 L32 35.6 L28.8 33.4 Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "32",
				cy: "32",
				r: "3.2",
				fill: "var(--color-bg)",
				stroke: "currentColor",
				strokeWidth: "1.4"
			})
		]
	});
}
function GoogleMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.42Z",
				opacity: "0.95"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M12 22c2.7 0 4.96-.9 6.62-2.35l-3.23-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z",
				opacity: "0.8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M6.41 13.99A6.01 6.01 0 0 1 6.1 12c0-.69.12-1.36.31-1.99V7.43H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.57l3.34-2.58Z",
				opacity: "0.7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M12 5.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87C16.95 2.97 14.7 2 12 2A10 10 0 0 0 3.07 7.43l3.34 2.58C7.2 7.72 9.4 5.96 12 5.96Z",
				opacity: "0.85"
			})
		]
	});
}
function XMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M14.6 10.47 21.2 3h-1.57l-5.73 6.49L9.32 3H3.5l6.92 9.96L3.5 21h1.57l6.05-6.86L14.6 21h5.82l-5.82-10.53Zm-2.14 2.42-.7-1-5.58-7.9h2.4l4.5 6.37.7 1 5.85 8.28h-2.4l-4.77-6.75Z"
		})
	});
}
//#endregion
export { Login as component };
