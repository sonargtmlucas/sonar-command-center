import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Radar,
  Send,
  GitBranch,
  Users,
  Settings as SettingsIcon,
} from "lucide-react";
import { SonarLogo } from "./SonarLogo";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Overview", icon: Home },
  { to: "/signal-engine", label: "Signal Engine", icon: Radar },
  { to: "/outreach", label: "Outreach", icon: Send },
  { to: "/pipeline", label: "Pipeline", icon: GitBranch },
  { to: "/accounts", label: "Accounts", icon: Users },
] as const;

export function Sidebar() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[220px] flex-col border-r border-border bg-[color:var(--color-panel)] z-30">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <SonarLogo />
        <span className="text-base font-extrabold tracking-[0.18em] text-foreground">
          SONAR
        </span>
      </div>

      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {items.map((item) => {
          const active =
            item.to === "/"
              ? pathname === "/"
              : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[color:var(--color-panel-elevated)] text-foreground"
                  : "text-text-muted hover:bg-[color:var(--color-panel-elevated)]/60 hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r bg-signal" />
              )}
              <Icon size={16} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-4">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            pathname.startsWith("/settings")
              ? "bg-[color:var(--color-panel-elevated)] text-foreground"
              : "text-text-muted hover:text-foreground",
          )}
        >
          <SettingsIcon size={16} />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = [...items, { to: "/settings", label: "Settings", icon: SettingsIcon }];
  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-border bg-[color:var(--color-panel)]">
      {nav.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[10px]",
              active ? "text-signal" : "text-text-muted",
            )}
          >
            <Icon size={18} />
          </Link>
        );
      })}
    </nav>
  );
}
