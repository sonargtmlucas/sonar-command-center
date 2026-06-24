import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/sonar/AppShell";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
          404 · Out of range
        </div>
        <h1 className="mt-3 text-3xl font-bold">No signal here</h1>
        <p className="mt-2 text-sm text-text-muted">
          That route isn't on the scanner. Head back to the overview.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-md border border-border-bright bg-signal/10 px-4 py-2 text-sm font-semibold text-signal hover:bg-signal/20"
        >
          Go to overview
        </a>
      </div>
    </AppShell>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Pipeline read failed
        </h1>
        <p className="mt-2 max-w-md text-sm text-text-muted">
          {error.message ||
            "We couldn't reach the Sonar data layer. Try again, or check the Supabase connection."}
        </p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex rounded-md border border-border-bright bg-signal/10 px-4 py-2 text-sm font-semibold text-signal hover:bg-signal/20"
        >
          Retry
        </button>
      </div>
    </AppShell>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster position="bottom-right" theme="dark" />
    </QueryClientProvider>
  );
}
