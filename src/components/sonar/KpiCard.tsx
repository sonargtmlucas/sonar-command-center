import { cn } from "@/lib/utils";
import { Panel } from "./Panel";

export type KpiAccent = "signal" | "success" | "warning" | "danger";

const accentClasses: Record<KpiAccent, string> = {
  signal: "text-signal",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

const accentGlow: Record<KpiAccent, string> = {
  signal: "shadow-[0_0_40px_-10px_rgba(28,183,255,0.45)]",
  success: "shadow-[0_0_40px_-10px_rgba(55,211,153,0.4)]",
  warning: "shadow-[0_0_40px_-10px_rgba(255,181,71,0.4)]",
  danger: "shadow-[0_0_40px_-10px_rgba(255,93,108,0.4)]",
};

export function KpiCard({
  label,
  value,
  subtext,
  accent = "signal",
  loading,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  accent?: KpiAccent;
  loading?: boolean;
}) {
  return (
    <Panel className={cn("relative overflow-hidden", accentGlow[accent])}>
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-signal) 50%, transparent)",
          opacity: 0.4,
        }}
      />
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted mono">
        {label}
      </div>
      <div
        className={cn(
          "mt-3 num text-3xl",
          accentClasses[accent],
        )}
      >
        {loading ? <span className="skeleton inline-block h-8 w-24" /> : value}
      </div>
      {subtext && (
        <div className="mt-1 text-xs text-text-muted">{subtext}</div>
      )}
    </Panel>
  );
}
