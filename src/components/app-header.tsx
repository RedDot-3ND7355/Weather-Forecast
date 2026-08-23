import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Locate, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlaceSearch } from "@/components/place-search";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { savePlace } from "@/lib/places";
import { useWeatherStore } from "@/lib/store";
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
  const { user } = useCurrentUserState();
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

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-baseline gap-2">
          <span className="font-display text-2xl font-medium tracking-tight text-fg">
            Vane
          </span>
          <span className="hidden text-xs tracking-[0.14em] text-faint uppercase sm:inline">
            Rain follows the wind
          </span>
        </Link>
        <div className="min-w-0 flex-1">
          <PlaceSearch onSelect={(p: Place) => setPlace(p)} />
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Use my location"
            onClick={onLocate}
            disabled={locating}
          >
            <Locate className={cn("size-4", locating && "animate-pulse")} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={saved ? "Saved" : "Save this place"}
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
            {(["metric", "imperial"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnits(u)}
                className={cn(
                  "h-9 min-w-10 rounded-full px-2.5 text-xs font-medium",
                  units === u ? "bg-accent text-accent-fg" : "text-muted",
                )}
                aria-pressed={units === u}
              >
                {u === "metric" ? "°C" : "°F"}
              </button>
            ))}
          </div>
          <AuthSlot />
        </div>
      </div>
    </header>
  );
}

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setWaited(false);
      return;
    }
    const t = window.setTimeout(() => setWaited(true), 4000);
    return () => window.clearTimeout(t);
  }, [isPending]);

  if (isPending && !waited) {
    return <div className="size-11 shrink-0 rounded-full bg-raised" />;
  }
  if (user) {
    return (
      <>
        <div className="hidden min-w-0 sm:block">
          <UserButton />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="sm:hidden"
          onClick={() => void signOut()}
        >
          Sign out
        </Button>
      </>
    );
  }
  return (
    <Button variant="secondary" size="sm" asChild>
      <Link to="/login">
        <LogIn className="size-4" />
        Sign in
      </Link>
    </Button>
  );
}
