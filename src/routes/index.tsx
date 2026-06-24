import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Radar, Building2, ExternalLink } from "lucide-react";

import { KpiCard } from "@/components/sonar/KpiCard";
import { Panel, PanelHeader } from "@/components/sonar/Panel";
import { PageHeader } from "@/components/sonar/AppShell";
import { DataTable, Td, Tr } from "@/components/sonar/Table";
import {
  AgentBadge,
  ScoreBadge,
} from "@/components/sonar/Badges";
import { EmptyState } from "@/components/sonar/EmptyState";
import { SkeletonRows } from "@/components/sonar/SkeletonRow";
import { SlideOver } from "@/components/sonar/SlideOver";

import {
  useAgentLogs,
  useCampaigns,
  useLeads,
  useMeetings,
  useMetricsSnapshots,
  usePipeline,
} from "@/integrations/sonar/queries";
import type { Lead } from "@/integrations/sonar/types";

export const Route = createFileRoute("/")({
  component: OverviewPage,
});

function OverviewPage() {
  const leads = useLeads(200);
  const pipeline = usePipeline();
  const meetings = useMeetings();
  const campaigns = useCampaigns();
  const agentLogs = useAgentLogs(15);
  const metrics = useMetricsSnapshots(7);

  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const pipelineValue = useMemo(() => {
    const rows = pipeline.data ?? [];
    return rows
      .filter((r) => r.stage !== "closed_lost")
      .reduce((s, r) => s + (r.deal_value ?? 0), 0);
  }, [pipeline.data]);

  const meetingsCount = useMemo(() => {
    const rows = meetings.data ?? [];
    return rows.filter(
      (r) => r.status === "scheduled" || r.status === "completed",
    ).length;
  }, [meetings.data]);

  const replyRate = useMemo(() => {
    const active = (campaigns.data ?? []).filter((c) => c.status === "active");
    if (active.length === 0) return 0;
    const sum = active.reduce((s, c) => s + (c.reply_rate ?? 0), 0);
    return sum / active.length;
  }, [campaigns.data]);

  const chartData = useMemo(() => {
    const map = new Map(
      (metrics.data ?? []).map((m) => [m.snapshot_date, m.signals_detected ?? 0]),
    );
    const out: { date: string; signals: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({
        date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        signals: map.get(key) ?? 0,
      });
    }
    return out;
  }, [metrics.data]);

  const topLeads = useMemo(
    () => (leads.data ?? []).filter((l) => (l.icp_score ?? 0) >= 75).slice(0, 8),
    [leads.data],
  );

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Real-time pipeline, signals and agent activity across your GTM engine."
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Pipeline Generated"
          value={`$${pipelineValue.toLocaleString()}`}
          subtext="All active stages"
          accent="signal"
          loading={pipeline.isLoading}
        />
        <KpiCard
          label="Meetings Booked"
          value={meetingsCount.toLocaleString()}
          subtext="This month"
          accent="success"
          loading={meetings.isLoading}
        />
        <KpiCard
          label="Reply Rate"
          value={`${replyRate.toFixed(1)}%`}
          subtext="Active campaigns avg"
          accent={replyRate >= 5 ? "success" : replyRate < 3 ? "warning" : "signal"}
          loading={campaigns.isLoading}
        />
        <KpiCard
          label="Accounts Identified"
          value={(leads.data?.length ?? 0).toLocaleString()}
          subtext="Total in system"
          accent="signal"
          loading={leads.isLoading}
        />
      </div>

      <Panel className="mt-6">
        <PanelHeader
          title="Signal Activity — Last 7 Days"
          subtitle="Detected buying signals across all sources"
        />
        <div className="h-56 w-full">
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ left: -20, right: 6, top: 4 }}>
              <defs>
                <linearGradient id="signalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1CB7FF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#1CB7FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#3a5a7a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(28,183,255,0.1)" }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ stroke: "rgba(28,183,255,0.3)" }}
                contentStyle={{
                  background: "#0e1928",
                  border: "1px solid rgba(28,183,255,0.3)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#5a7a9a" }}
                itemStyle={{ color: "#e8f4ff" }}
              />
              <Area
                type="monotone"
                dataKey="signals"
                stroke="#1CB7FF"
                strokeWidth={2}
                fill="url(#signalFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="High-Intent Opportunities"
            subtitle="ICP score ≥ 75"
          />
          {leads.isLoading ? (
            <SkeletonRows rows={6} cols={5} />
          ) : topLeads.length === 0 ? (
            <EmptyState
              icon={Radar}
              title="Signal monitor is scanning"
              description="Check back after the next run."
            />
          ) : (
            <DataTable headers={["Company", "Score", "Top Signal", "Status", ""]}>
              {topLeads.map((lead) => (
                <Tr key={lead.id} onClick={() => setActiveLead(lead)}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-md bg-[color:var(--color-panel-elevated)] text-text-muted">
                        <Building2 size={13} />
                      </div>
                      <div>
                        <div className="font-medium">{lead.company ?? "—"}</div>
                        <div className="text-[11px] text-text-muted">
                          {lead.name ?? ""}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td><ScoreBadge score={lead.icp_score} /></Td>
                  <Td className="text-text-muted text-xs">
                    {lead.signals?.[0]?.replace("_", " ") ?? "—"}
                  </Td>
                  <Td className="text-xs text-text-muted">{lead.status ?? "new"}</Td>
                  <Td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLead(lead);
                      }}
                      className="rounded-md border border-border-bright bg-signal/5 px-2.5 py-1 text-[11px] font-semibold mono text-signal hover:bg-signal/15"
                    >
                      Research
                    </button>
                  </Td>
                </Tr>
              ))}
            </DataTable>
          )}
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelHeader title="Agent Activity" subtitle="Last 15 events" />
          {agentLogs.isLoading ? (
            <SkeletonRows rows={8} cols={1} />
          ) : (agentLogs.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="No agent activity yet"
              description="Once workflows run, you'll see live entries here."
            />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {agentLogs.data!.map((log) => (
                <li
                  key={log.id}
                  className="flex items-start gap-3 rounded-md p-2 hover:bg-[color:var(--color-panel-elevated)]/60"
                >
                  <AgentBadge agent={log.agent} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground line-clamp-2">
                      {log.action}
                    </div>
                    <div className="mt-0.5 text-[10px] text-text-muted mono uppercase">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <span
                    className={`mt-1 inline-block h-1.5 w-1.5 rounded-full ${
                      log.status === "error"
                        ? "bg-danger"
                        : log.status === "warn"
                          ? "bg-warning"
                          : "bg-success"
                    }`}
                  />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <SlideOver
        open={!!activeLead}
        onClose={() => setActiveLead(null)}
        title="Account Brief"
      >
        {activeLead && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="text-xs mono uppercase tracking-wider text-text-muted">
                Company
              </div>
              <div className="mt-1 text-xl font-bold">
                {activeLead.company ?? "—"}
              </div>
              <div className="text-sm text-text-muted">
                {activeLead.company_domain ?? ""}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="ICP Score" value={String(activeLead.icp_score ?? "—")} />
              <Stat label="Source" value={activeLead.source ?? "—"} />
              <Stat label="Status" value={activeLead.status ?? "new"} />
              <Stat label="Contact" value={activeLead.name ?? "—"} />
            </div>
            {activeLead.linkedin_url && (
              <a
                href={activeLead.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border-bright bg-signal/10 px-3 py-1.5 text-xs font-semibold text-signal hover:bg-signal/20"
              >
                <ExternalLink size={12} /> Open LinkedIn
              </a>
            )}
            <div>
              <div className="text-xs mono uppercase tracking-wider text-text-muted">
                Detected signals
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(activeLead.signals ?? []).length === 0 ? (
                  <span className="text-xs text-text-muted">None yet</span>
                ) : (
                  activeLead.signals!.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-signal/10 px-2 py-0.5 text-[10px] mono text-signal"
                    >
                      {s.replace("_", " ")}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-[color:var(--color-panel)] p-3">
      <div className="text-[10px] mono uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
