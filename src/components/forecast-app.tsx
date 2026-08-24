import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IncomingBanner } from "@/components/incoming-banner";
import { AlertBanner } from "@/components/alert-banner";
import { AppHeader } from "@/components/app-header";
import { ChanceChart } from "@/components/chance-chart";
import { Compass } from "@/components/compass";
import { CurrentPanel } from "@/components/current-panel";
import { DailyList } from "@/components/daily-list";
import { HourlyStrip } from "@/components/hourly-strip";
import { LivePresenceFooter } from "@/components/live-presence";
import { PlaceSearch } from "@/components/place-search";
import { RadarMap } from "@/components/radar-map";
import { RainBrief } from "@/components/rain-brief";
import { SampleCities, SavedRow } from "@/components/saved-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listPlaces, removePlace } from "@/lib/places";
import { useWeatherStore } from "@/lib/store";
import { fetchAlerts } from "@/lib/weather/alerts";
import { fetchForecast, reversePlace, searchPlaces } from "@/lib/weather/api";
import { incomingPrecip } from "@/lib/weather/incoming";
import { fetchRadarNowcast } from "@/lib/weather/radar";
import { formatSpeed } from "@/lib/weather/format";
import { GeoError, isAppleTouch, readDevicePosition } from "@/lib/geolocation";
import { useT } from "@/lib/i18n";
import type { Place } from "@/lib/weather/types";

let consumedUrl = false;

function sameCoords(a: { latitude: number; longitude: number }, lat: number, lon: number) {
  return Math.abs(a.latitude - lat) < 0.0008 && Math.abs(a.longitude - lon) < 0.0008;
}

export function ForecastApp() {
  const { user } = useCurrentUserState();
  const { t } = useT();
  const place = useWeatherStore((s) => s.place);
  const units = useWeatherStore((s) => s.units);
  const recent = useWeatherStore((s) => s.recent);
  const setPlace = useWeatherStore((s) => s.setPlace);
  const locale = useWeatherStore((s) => s.locale);
  const [hydrated, setHydrated] = useState(
    () => typeof window !== "undefined" && useWeatherStore.persist.hasHydrated(),
  );
  const [locating, setLocating] = useState(false);
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  useEffect(() => {
    const done = () => setHydrated(true);
    if (useWeatherStore.persist.hasHydrated()) done();
    return useWeatherStore.persist.onFinishHydration(done);
  }, []);

  useEffect(() => {
    if (!hydrated || consumedUrl) return;
    consumedUrl = true;
    const persisted = useWeatherStore.getState().place;
    if (typeof search.lat === "number" && typeof search.lon === "number") {
      if (!persisted || !sameCoords(persisted, search.lat, search.lon)) {
        setPlace({
          name: search.n || t("yourLocation"),
          latitude: search.lat,
          longitude: search.lon,
        });
      }
      return;
    }
    if (search.q) {
      void searchPlaces({ data: { q: search.q, language: locale } }).then((hits) => {
        if (hits[0]) setPlace(hits[0]);
      });
    }
  }, [hydrated, locale, search.lat, search.lon, search.n, search.q, setPlace, t]);

  useEffect(() => {
    if (!hydrated || !place) return;
    const lat = Number(place.latitude.toFixed(5));
    const lon = Number(place.longitude.toFixed(5));
    if (
      search.lat === lat &&
      search.lon === lon &&
      search.n === place.name &&
      search.q === undefined
    ) {
      return;
    }
    void navigate({
      search: { q: undefined, lat, lon, n: place.name },
      replace: true,
    });
  }, [hydrated, navigate, place, search.lat, search.lon, search.n, search.q]);
  const active = hydrated ? place : null;

  const forecastQuery = useQuery({
    queryKey: ["forecast", active?.latitude, active?.longitude],
    queryFn: () => fetchForecast({ data: active! }),
    enabled: Boolean(active),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const alertsQuery = useQuery({
    queryKey: ["alerts", active?.latitude, active?.longitude, locale],
    queryFn: () =>
      fetchAlerts({
        data: {
          latitude: active!.latitude,
          longitude: active!.longitude,
          language: locale,
        },
      }),
    enabled: Boolean(active),
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const nowcastQuery = useQuery({
    queryKey: [
      "radar-nowcast",
      active?.latitude,
      active?.longitude,
      Math.round(forecastQuery.data?.current.windDir ?? 0),
    ],
    queryFn: () =>
      fetchRadarNowcast({
        data: {
          latitude: active!.latitude,
          longitude: active!.longitude,
          windDir: forecastQuery.data!.current.windDir,
          windSpeedKmh: forecastQuery.data!.current.windSpeedKmh,
        },
      }),
    enabled: Boolean(active && forecastQuery.data),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const savedQuery = useQuery({
    queryKey: ["saved-places", user?.id],
    queryFn: () => listPlaces(),
    enabled: Boolean(user),
  });

  const savedPlaces = savedQuery.data ?? [];
  const saved =
    Boolean(active) &&
    savedPlaces.some(
      (p) =>
        Math.abs(p.latitude - active!.latitude) < 0.0008 &&
        Math.abs(p.longitude - active!.longitude) < 0.0008,
    );

  function locate() {
    if (isAppleTouch()) {
      toast(t("toastLocateAllow"));
    }
    setLocating(true);
    void readDevicePosition()
      .then((pos) => {
        const here: Place = {
          name: t("yourLocation"),
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setPlace(here);
        return reversePlace({
          data: {
            latitude: here.latitude,
            longitude: here.longitude,
            language: locale,
          },
        })
          .then((named) => {
            const current = useWeatherStore.getState().place;
            if (current && sameCoords(current, here.latitude, here.longitude)) {
              setPlace(named);
            }
          })
          .catch(() => {});
      })
      .catch((err) => {
        const kind = err instanceof GeoError ? err.kind : "unavailable";
        const key =
          kind === "missing"
            ? "geoMissing"
            : kind === "denied"
              ? "geoDenied"
              : kind === "timeout"
                ? "geoTimeout"
                : kind === "inapp"
                  ? "geoInApp"
                  : "geoUnavailable";
        toast(t(key));
      })
      .finally(() => setLocating(false));
  }

  async function onRemove(id: number) {
    try {
      await removePlace({ data: { id } });
      await savedQuery.refetch();
    } catch {
      toast(t("toastRemoveFail"));
    }
  }

  const forecast = forecastQuery.data;
  const incoming = forecast ? incomingPrecip(forecast, nowcastQuery.data) : null;
  const isLoading = Boolean(active) && forecastQuery.isPending && !forecastQuery.data;

  function onShare() {
    const url = window.location.href;
    void navigator.clipboard.writeText(url).then(
      () => toast(t("toastLinkCopied")),
      () => toast(t("toastLinkFail")),
    );
  }

  return (
    <div className="min-h-dvh overflow-x-clip bg-bg text-fg">
      <AppHeader
        onLocate={locate}
        locating={locating}
        saved={saved}
        onSaved={() => void savedQuery.refetch()}
        onShare={place ? onShare : undefined}
      />
      <main className="mx-auto min-w-0 max-w-6xl overflow-x-clip px-3 py-4 pb-20 sm:px-6 sm:py-8 sm:pb-24">
        {incoming ? (
          <IncomingBanner key={`${incoming.kind}-${incoming.source}`} incoming={incoming} />
        ) : null}
        {alertsQuery.data?.length ? <AlertBanner alerts={alertsQuery.data} /> : null}
        {hydrated && (savedPlaces.length > 0 || recent.length > 0) ? (
          <div className="mb-4 min-w-0 sm:mb-6">
            <SavedRow
              places={savedPlaces}
              recent={recent}
              onPick={setPlace}
              onRemove={(id) => void onRemove(id)}
            />
          </div>
        ) : null}

        {!hydrated ? (
          <LoadingState />
        ) : !active ? (
          <EmptyState onPick={setPlace} onLocate={locate} locating={locating} />
        ) : isLoading ? (
          <LoadingState />
        ) : forecastQuery.isError ? (
          <ErrorState
            onRetry={() => void forecastQuery.refetch()}
            message={
              forecastQuery.error instanceof Error
                ? forecastQuery.error.message
                : t("loadFail")
            }
          />
        ) : forecast ? (
          <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
            <div className="min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5 lg:p-6">
              <Compass
                windDir={forecast.current.windDir}
                windSpeedLabel={formatSpeed(forecast.current.windSpeedKmh, units)}
                windKmh={forecast.current.windSpeedKmh}
                chance={forecast.current.rain.chance}
                weatherCode={forecast.current.weatherCode}
                isDay={forecast.current.isDay}
              />
            </div>
            <CurrentPanel
              forecast={forecast}
              units={units}
              updatedAt={forecastQuery.dataUpdatedAt || forecast.fetchedAt}
              refreshing={forecastQuery.isFetching && !forecastQuery.isPending}
            />
            <div className="min-w-0 lg:col-span-2">
              <HourlyStrip hours={forecast.hourly} units={units} />
            </div>
            <ChanceChart hours={forecast.hourly} />
            <DailyList days={forecast.daily} units={units} />
            <RadarMap forecast={forecast} units={units} />
            <div className="min-w-0 lg:col-span-2">
              <RainBrief forecast={forecast} />
            </div>
            <HowItWorks />
          </div>
        ) : null}
      </main>
      <LivePresenceFooter />
    </div>
  );
}

function EmptyState({
  onPick,
  onLocate,
  locating,
}: {
  onPick: (place: Place) => void;
  onLocate: () => void;
  locating: boolean;
}) {
  const { t } = useT();
  return (
    <div className="mx-auto max-w-xl py-4 text-center sm:py-12">
      <p className="font-display text-4xl font-medium tracking-tight text-fg sm:text-6xl">
        Vane
      </p>
      <p className="mt-3 text-sm text-muted sm:text-base">
        {t("emptyLead")}
      </p>
      <div className="mt-6 hidden text-left sm:block">
        <PlaceSearch onSelect={onPick} autoFocus />
      </div>
      <button
        type="button"
        onClick={onLocate}
        className="mt-4 h-11 text-sm font-medium text-accent hover:underline"
      >
        {locating ? t("locating") : t("locate")}
      </button>
      <p className="mt-8 mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
        {t("tryACity")}
      </p>
      <SampleCities onPick={onPick} />
      <HowItWorks compact />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Skeleton className="aspect-square rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-56 rounded-2xl lg:col-span-2" />
      <Skeleton className="h-40 rounded-2xl lg:col-span-2" />
    </div>
  );
}

function ErrorState({ onRetry, message }: { onRetry: () => void; message: string }) {
  const { t } = useT();
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-2xl font-medium">{t("forecastUnavailable")}</h1>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 h-11 rounded-lg bg-accent px-5 text-sm font-medium text-accent-fg"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}

function HowItWorks({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  return (
    <section
      className={
        compact
          ? "mt-8 text-left text-sm text-muted sm:mt-12"
          : "rounded-2xl bg-surface p-4 text-sm text-muted shadow-[var(--shadow-border)] sm:p-5 lg:col-span-2"
      }
    >
      <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
        {t("howTitle")}
      </h2>
      <p className="mt-2 leading-relaxed">
        {t("howBody")}
      </p>
    </section>
  );
}
