import type { LucideIcon } from "lucide-react";
import { Radar } from "lucide-react";

export function EmptyState({
  icon: Icon = Radar,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="rounded-full bg-[color:var(--color-panel-elevated)] p-3 text-signal">
        <Icon size={22} />
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="mt-1 text-xs text-text-muted">{description}</div>
      </div>
    </div>
  );
}
