import { MapPin, X } from "lucide-react";
import type { SavedPlace } from "@/lib/places";
import { placeLabel } from "@/lib/weather/format";
import type { Place } from "@/lib/weather/types";

export function SavedRow({
  places,
  recent,
  onPick,
  onRemove,
}: {
  places: SavedPlace[];
  recent: Place[];
  onPick: (place: Place) => void;
  onRemove: (id: number) => void;
}) {
  if (places.length === 0 && recent.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {places.map((p) => (
        <span
          key={p.id}
          className="inline-flex items-center gap-1 rounded-full bg-raised py-1 pr-1 pl-2.5 text-xs text-fg shadow-[var(--shadow-border)]"
        >
          <button type="button" className="inline-flex items-center gap-1.5" onClick={() => onPick(p)}>
            <MapPin className="size-3 text-accent" />
            {p.name}
          </button>
          <button
            type="button"
            className="grid size-7 place-items-center rounded-full text-faint hover:text-fg"
            aria-label={`Remove ${p.name}`}
            onClick={() => onRemove(p.id)}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      {recent
        .filter((r) => !places.some((p) => p.name === r.name))
        .slice(0, 5)
        .map((p) => (
          <button
            key={`${p.name}-${p.latitude}`}
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface px-3 text-xs text-muted shadow-[var(--shadow-border)] hover:text-fg"
            onClick={() => onPick(p)}
          >
            {p.name}
          </button>
        ))}
    </div>
  );
}

export function SampleCities({ onPick }: { onPick: (place: Place) => void }) {
  const samples: Place[] = [
    { name: "Lisbon", latitude: 38.72, longitude: -9.14, country: "Portugal", timezone: "Europe/Lisbon" },
    { name: "Tokyo", latitude: 35.68, longitude: 139.69, country: "Japan", timezone: "Asia/Tokyo" },
    { name: "Reykjavík", latitude: 64.15, longitude: -21.94, country: "Iceland", timezone: "Atlantic/Reykjavik" },
    { name: "Nairobi", latitude: -1.29, longitude: 36.82, country: "Kenya", timezone: "Africa/Nairobi" },
    { name: "Hobart", latitude: -42.88, longitude: 147.33, country: "Australia", timezone: "Australia/Hobart" },
    { name: "Vancouver", latitude: 49.28, longitude: -123.12, country: "Canada", timezone: "America/Vancouver" },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {samples.map((p) => (
        <button
          key={p.name}
          type="button"
          className="h-11 rounded-full bg-raised px-4 text-sm text-fg shadow-[var(--shadow-border)] hover:bg-surface"
          onClick={() => onPick(p)}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}

export function PlaceMeta({ place }: { place: Place }) {
  return <span className="sr-only">{placeLabel(place)}</span>;
}
