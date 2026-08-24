import { createServerFn } from "@tanstack/react-start";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { AppProviders } from "@/components/app-providers";
import { BootSplash, CRITICAL_BOOT_CSS } from "@/components/boot-splash";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SmoothScroll } from "@/components/smooth-scroll";
import appCss from "../styles.css?url";

const APP_NAME = "Vane";

const fetchSessionUser = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const u = await getSessionUser();
  return u ? { id: u.id, email: u.email } : null;
});

export const Route = createRootRoute({
  beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { httpEquiv: "Permissions-Policy", content: "geolocation=*, accelerometer=(self), gyroscope=(self), magnetometer=(self)" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0b1014" },
      {
        name: "description",
        content:
          "A wind-aware weather forecast. Vane reads the bearing moisture is arriving from and estimates rain from that fetch.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html
      lang="en"
      className="antialiased"
      suppressHydrationWarning
      style={{ background: "#0b1014", colorScheme: "dark" }}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_BOOT_CSS }} />
        <HeadContent />
      </head>
      <body
        className="min-h-dvh overflow-x-clip bg-bg text-fg"
        style={{ background: "#0b1014", color: "#e7eef4" }}
      >
        <BootSplash />
        <SmoothScroll />
        <PreviewHostBridge />
        <AuthProvider>
          <AppProviders>
            <Outlet />
          </AppProviders>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
