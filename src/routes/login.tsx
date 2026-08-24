import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  GROK_PROVIDERS,
  authClient,
  authEnabled,
  signIn,
} from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/login")({ component: Login });

function brokerHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return (
    h.endsWith(".grok-sandbox.com") ||
    h === "localhost" ||
    h === "127.0.0.1"
  );
}

function Login() {
  const { t } = useT();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showBroker, setShowBroker] = useState(false);

  useEffect(() => {
    setShowBroker(brokerHost());
  }, []);

  async function onSocial(providerId: string) {
    setError(null);
    setBusy(providerId);
    try {
      await signIn(providerId, { callbackURL: "/" });
    } catch (err) {
      const message = showBroker
        ? err instanceof Error
          ? err.message
          : t("signInFail")
        : t("socialUnavailable");
      setError(message);
      toast(message);
    } finally {
      setBusy(null);
    }
  }

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy("email");
    try {
      const result =
        mode === "signup"
          ? await authClient.signUp.email({
              email: email.trim(),
              password,
              name: name.trim() || email.trim().split("@")[0] || "Vane",
            })
          : await authClient.signIn.email({
              email: email.trim(),
              password,
            });
      if (result.error) {
        const message = result.error.message || t("signInFail");
        setError(message);
        toast(message);
        return;
      }
      await navigate({ to: "/" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("signInFail");
      setError(message);
      toast(message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10 sm:px-6 sm:py-12">
      <div aria-hidden="true" className="login-glow pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative w-full max-w-sm">
        <Link to="/" className="mb-8 flex flex-col items-center text-center">
          <CompassMark />
          <span className="mt-4 font-display text-4xl font-medium tracking-tight text-fg">
            Vane
          </span>
          <span className="mt-1 text-sm text-muted">
            {t("loginLead")}
          </span>
        </Link>

        <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
          {authEnabled ? (
            <div className="space-y-3">
              <form className="space-y-2" onSubmit={(e) => void onEmail(e)}>
                {mode === "signup" ? (
                  <Input
                    autoComplete="name"
                    placeholder={t("name")}
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                  />
                ) : null}
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={t("email")}
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                />
                <Input
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={8}
                  placeholder={t("password")}
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                />
                <Button
                  type="submit"
                  className="w-full justify-center"
                  disabled={busy !== null}
                >
                  {busy === "email"
                    ? t("working")
                    : mode === "signup"
                      ? t("createAccount")
                      : t("signIn")}
                </Button>
              </form>
              <button
                type="button"
                className="w-full text-center text-xs text-muted hover:text-fg"
                onClick={() => {
                  setError(null);
                  setMode((m) => (m === "signin" ? "signup" : "signin"));
                }}
              >
                {mode === "signup"
                  ? t("haveAccount")
                  : t("needAccount")}
              </button>
              {showBroker ? (
                <>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="h-px flex-1 bg-raised" />
                    <span className="text-[11px] uppercase tracking-wide text-faint">{t("or")}</span>
                    <span className="h-px flex-1 bg-raised" />
                  </div>
                  {GROK_PROVIDERS.map((p) => (
                    <Button
                      key={p.providerId}
                      type="button"
                      variant="secondary"
                      className="w-full justify-center"
                      disabled={busy !== null}
                      onClick={() => void onSocial(p.providerId)}
                    >
                      {p.label === "Google" ? <GoogleMark /> : <XMark />}
                      {busy === p.providerId ? t("opening") : t("continueWith", { label: p.label })}
                    </Button>
                  ))}
                </>
              ) : null}
              {error ? (
                <p className="pt-1 text-sm text-danger" role="alert">
                  {error}
                </p>
              ) : (
                <p className="pt-1 text-xs text-faint">
                  {showBroker
                    ? t("allowPopups")
                    : t("emailOnly")}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">{t("signInDisabled")}</p>
          )}
        </div>

        <p className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted hover:text-fg">
            {t("continueGuest")}
          </Link>
        </p>
      </div>
    </main>
  );
}

function CompassMark() {
  return (
    <svg viewBox="0 0 64 64" className="size-16 text-accent" aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.7"
      />
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.35"
      />
      <path d="M32 8 L36.4 32 L32 28.4 L27.6 32 Z" fill="var(--color-fg)" />
      <path d="M32 56 L35.2 33.4 L32 35.6 L28.8 33.4 Z" fill="currentColor" />
      <circle
        cx="32"
        cy="32"
        r="3.2"
        fill="var(--color-bg)"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.42Z"
        opacity="0.95"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.96-.9 6.62-2.35l-3.23-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z"
        opacity="0.8"
      />
      <path
        fill="currentColor"
        d="M6.41 13.99A6.01 6.01 0 0 1 6.1 12c0-.69.12-1.36.31-1.99V7.43H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.57l3.34-2.58Z"
        opacity="0.7"
      />
      <path
        fill="currentColor"
        d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87C16.95 2.97 14.7 2 12 2A10 10 0 0 0 3.07 7.43l3.34 2.58C7.2 7.72 9.4 5.96 12 5.96Z"
        opacity="0.85"
      />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.6 10.47 21.2 3h-1.57l-5.73 6.49L9.32 3H3.5l6.92 9.96L3.5 21h1.57l6.05-6.86L14.6 21h5.82l-5.82-10.53Zm-2.14 2.42-.7-1-5.58-7.9h2.4l4.5 6.37.7 1 5.85 8.28h-2.4l-4.77-6.75Z"
      />
    </svg>
  );
}