import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Panel({
  children,
  className,
  elevated,
  glow,
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        elevated ? "panel-elevated" : "panel",
        glow && "glow-signal",
        "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase mono">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}
