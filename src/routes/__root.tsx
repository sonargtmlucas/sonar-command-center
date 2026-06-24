import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
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
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sonar — GTM Operating System" },
      {
        name: "description",
        content:
          "Sonar GTM operating dashboard — real-time pipeline, outreach campaigns, AI agents, and buying signals.",
      },
      { name: "theme-color", content: "#050a12" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

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
