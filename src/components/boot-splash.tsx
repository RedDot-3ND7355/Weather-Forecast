import { useEffect, useState } from "react";

export const CRITICAL_BOOT_CSS = `
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

export function BootSplash() {
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const started = performance.now();
    let startTimer = 0;
    let fallback = 0;
    const MIN_MS = 700;
    const fade = () => {
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      startTimer = window.setTimeout(() => setOut(true), wait);
    };
    const links = [...document.querySelectorAll('link[rel="stylesheet"]')];
    const pending = links.filter((n) => !(n as HTMLLinkElement).sheet);
    if (pending.length === 0) {
      requestAnimationFrame(() => requestAnimationFrame(fade));
    } else {
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

  useEffect(() => {
    if (!out) return;
    const t = window.setTimeout(() => setGone(true), 900);
    return () => window.clearTimeout(t);
  }, [out]);

  if (gone) return null;

  return (
    <div
      id="vane-splash"
      className={out ? "is-out" : undefined}
      role="status"
      aria-live="polite"
      aria-busy={!out}
      onTransitionEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.propertyName !== "opacity") return;
        if (out) setGone(true);
      }}
    >
      <div className="inner">
        <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
          <circle
            cx="16"
            cy="16"
            r="11.2"
            fill="none"
            stroke="#9bb8c4"
            strokeWidth="1.3"
          />
          <g className="needle">
            <path d="M16 5.6 L18.4 16 L16 14.4 L13.6 16 Z" fill="#e7eef4" />
            <path d="M16 26.4 L17.5 16.6 L16 17.6 L14.5 16.6 Z" fill="#9bb8c4" />
          </g>
          <circle
            cx="16"
            cy="16"
            r="1.7"
            fill="#0b1014"
            stroke="#9bb8c4"
            strokeWidth="1.1"
          />
        </svg>
        <p className="word">Vane</p>
        <p className="sub">Rain follows the wind</p>
      </div>
    </div>
  );
}
