import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { useWeatherStore } from "@/lib/store";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: true,
            staleTime: 60_000,
          },
        },
      }),
  );
  const [ready, setReady] = useState(false);

  // skipHydration is set on the store — rehydrate on the client (sync or async)
  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (!cancelled) setReady(true);
    };
    try {
      const result = useWeatherStore.persist.rehydrate() as void | Promise<unknown>;
      if (result != null && typeof (result as Promise<unknown>).then === "function") {
        void (result as Promise<unknown>).then(done, done);
      } else {
        done();
      }
    } catch {
      done();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-dvh bg-bg" aria-hidden />
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            classNames: {
              toast: "bg-raised text-fg shadow-[var(--shadow-border)] border-0",
              title: "text-fg",
              description: "text-muted",
            },
          }}
        />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast: "bg-raised text-fg shadow-[var(--shadow-border)] border-0",
            title: "text-fg",
            description: "text-muted",
          },
        }}
      />
    </QueryClientProvider>
  );
}
