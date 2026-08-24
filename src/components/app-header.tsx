import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Locate, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageFullscreenButton } from "@/components/page-fullscreen";
import { PlaceSearch } from "@/components/place-search";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { useT } from "@/lib/i18n";
import { savePlace } from "@/lib/places";
import { useWeatherStore, type Locale } from "@/lib/store";
import type { Place } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

export function AppHeader({
  onLocate,
  locating,
  saved,
  onSaved,
}: {
  onLocate: () => void;
  locating: boolean;
  saved: boolean;
  onSaved: () => void;
}) {
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

  const tools = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t("locateAria")}
        onClick={onLocate}
        disabled={locating}
      >
        <Locate className={cn("size-4", locating && "animate-pulse")} />
      </Button>
      <PageFullscreenButton />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={saved ? t("saved") : t("savePlace")}
        onClick={() => void onSave()}
        disabled={!place}
      >
        {saved ? (
          <BookmarkCheck className="size-4 text-accent" />
        ) : (
          <Bookmark className="size-4" />
        )}
      </Button>
      <div className="flex rounded-full bg-raised p-0.5 shadow-[var(--shadow-border)]">
        {(["en", "fr"] as const).map((l: Locale) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            className={cn(
              "h-10 min-w-8 rounded-full px-1.5 text-[11px] font-medium sm:min-w-9 sm:px-2",
              locale === l ? "bg-accent text-accent-fg" : "text-muted",
            )}
            aria-pressed={locale === l}
            aria-label={l === "fr" ? "Français" : "English"}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex rounded-full bg-raised p-0.5 shadow-[var(--shadow-border)]">
        {(["metric", "imperial"] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnits(u)}
            className={cn(
              "h-10 min-w-9 rounded-full px-2 text-xs font-medium sm:min-w-10 sm:px-2.5",
              units === u ? "bg-accent text-accent-fg" : "text-muted",
            )}
            aria-pressed={units === u}
          >
            {u === "metric" ? "°C" : "°F"}
          </button>
        ))}
      </div>
      {isPending ? (
        <div className="size-10 shrink-0 rounded-full bg-raised sm:size-11" />
      ) : user ? (
        <>
          <div className="hidden min-w-0 sm:block">
            <UserButton />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label={t("signOut")}
            onClick={() => void signOut()}
          >
            <LogOut className="size-4" />
          </Button>
        </>
      ) : (
        <Button variant="secondary" size="sm" asChild>
          <Link to="/login" aria-label={t("signIn")}>
            <LogIn className="size-4" />
            <span className="hidden sm:inline">{t("signIn")}</span>
          </Link>
        </Button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-3">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex shrink-0 items-baseline gap-2">
            <span className="font-display text-xl font-medium tracking-tight text-fg sm:text-2xl">
              Vane
            </span>
            <span className="hidden text-xs tracking-[0.14em] text-faint uppercase sm:inline">
              {t("tagline")}
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:hidden">{tools}</div>
        </div>
        <div className="min-w-0 flex-1">
          <PlaceSearch onSelect={(p: Place) => setPlace(p)} />
        </div>
        <div className="hidden items-center gap-1.5 sm:flex">{tools}</div>
      </div>
    </header>
  );
}
