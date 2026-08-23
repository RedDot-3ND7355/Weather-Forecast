import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { searchPlaces } from "@/lib/weather/api";
import { placeLabel } from "@/lib/weather/format";
import type { Place } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

export function PlaceSearch({
  onSelect,
  autoFocus = false,
}: {
  onSelect: (place: Place) => void;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const trimmed = q.trim();

  const { data, isFetching } = useQuery({
    queryKey: ["places", trimmed],
    queryFn: () => searchPlaces({ data: { q: trimmed } }),
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
  });

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const results = data ?? [];

  return (
    <div ref={rootRef} className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
      <Input
        value={q}
        autoFocus={autoFocus}
        placeholder="Search a city or place"
        className="pl-9 pr-9"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        aria-label="Search location"
        autoComplete="off"
      />
      {isFetching ? (
        <LoaderCircle className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted" />
      ) : null}
      {open && trimmed.length >= 2 ? (
        <ul className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl bg-raised p-1 shadow-[var(--shadow-border)]">
          {results.length === 0 && !isFetching ? (
            <li className="px-3 py-3 text-sm text-muted">No matching places.</li>
          ) : (
            results.map((p) => (
              <li key={`${p.name}-${p.latitude}-${p.longitude}`}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-surface",
                  )}
                  onClick={() => {
                    onSelect(p);
                    setQ("");
                    setOpen(false);
                  }}
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>
                    <span className="block font-medium text-fg">{p.name}</span>
                    <span className="block text-xs text-muted">{placeLabel(p)}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
