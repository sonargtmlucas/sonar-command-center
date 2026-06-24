import { cn } from "@/lib/utils";
import {
  Briefcase,
  Cpu,
  Globe,
  MessageSquare,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import type { AgentName, SignalType } from "@/integrations/sonar/types";

export function ScoreBadge({ score }: { score: number | null | undefined }) {
  const s = score ?? 0;
  let cls = "bg-[color:var(--color-text-dim)]/20 text-text-muted";
  let label = "PASS";
  if (s >= 85) {
    cls = "bg-success/15 text-success";
    label = "HIGH";
  } else if (s >= 75) {
    cls = "bg-warning/15 text-warning";
    label = "QUAL";
  } else if (s >= 60) {
    cls = "bg-warning/10 text-warning";
    label = "WATCH";
  } else if (s >= 40) {
    cls = "bg-[color:var(--color-text-muted)]/15 text-text-muted";
    label = "LOW";
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold mono",
        cls,
      )}
    >
      <span className="num">{s}</span>
      <span className="opacity-70">{label}</span>
    </span>
  );
}

export function StatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  const s = (status ?? "—").toLowerCase();
  const map: Record<string, string> = {
    active: "bg-success/15 text-success",
    paused: "bg-warning/15 text-warning",
    draft: "bg-text-dim/20 text-text-muted",
    completed: "bg-text-muted/15 text-text-muted",
    new: "bg-signal/15 text-signal",
    actioned: "bg-success/15 text-success",
    watch: "bg-warning/15 text-warning",
    passed: "bg-text-dim/20 text-text-muted",
    scheduled: "bg-signal/15 text-signal",
  };
  const cls = map[s] ?? "bg-panel-elevated text-text-muted";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider mono",
        cls,
      )}
    >
      {s}
    </span>
  );
}

const signalMeta: Record<
  SignalType,
  { label: string; icon: typeof Briefcase; color: string }
> = {
  hiring: { label: "Hiring", icon: Briefcase, color: "text-warning bg-warning/10" },
  leadership_change: {
    label: "Leadership",
    icon: UserCheck,
    color: "text-signal bg-signal/10",
  },
  funding: { label: "Funding", icon: TrendingUp, color: "text-success bg-success/10" },
  expansion: {
    label: "Expansion",
    icon: Globe,
    color: "text-[#a78bfa] bg-[#a78bfa]/10",
  },
  tech_shift: {
    label: "Tech shift",
    icon: Cpu,
    color: "text-danger bg-danger/10",
  },
  public_pain: {
    label: "Public pain",
    icon: MessageSquare,
    color: "text-[#fb923c] bg-[#fb923c]/10",
  },
};

export function SignalTypeBadge({ type }: { type: SignalType }) {
  const meta = signalMeta[type] ?? signalMeta.hiring;
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold mono",
        meta.color,
      )}
    >
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

const agentColors: Record<AgentName, string> = {
  scout: "text-agent-scout bg-[color:var(--color-agent-scout)]/10",
  signal_engine: "text-agent-signal bg-[color:var(--color-agent-signal)]/10",
  outreach: "text-agent-outreach bg-[color:var(--color-agent-outreach)]/10",
  enrichment:
    "text-agent-enrichment bg-[color:var(--color-agent-enrichment)]/10",
  daily_brief: "text-agent-brief bg-[color:var(--color-agent-brief)]/10",
};

export function AgentBadge({ agent }: { agent: AgentName }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider mono",
        agentColors[agent] ?? agentColors.scout,
      )}
    >
      {agent.replace("_", " ")}
    </span>
  );
}

export function ScoreBar({ value }: { value: number | null | undefined }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const color =
    v >= 85
      ? "var(--color-success)"
      : v >= 75
        ? "var(--color-warning)"
        : v >= 50
          ? "var(--color-signal)"
          : "var(--color-text-dim)";
  return (
    <div className="flex items-center gap-2">
      <span className="num w-8 text-right text-xs">{v}</span>
      <div className="h-1.5 w-20 rounded-full bg-[color:var(--color-panel-elevated)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${v}%`, background: color }}
        />
      </div>
    </div>
  );
}
