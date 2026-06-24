import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Radar, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/sonar/AppShell";
import { Panel } from "@/components/sonar/Panel";
import { KpiCard } from "@/components/sonar/KpiCard";
import { DataTable, Td, Tr } from "@/components/sonar/Table";
import {
  ScoreBar,
  SignalTypeBadge,
  StatusBadge,
} from "@/components/sonar/Badges";
import { EmptyState } from "@/components/sonar/EmptyState";
import { SkeletonRows } from "@/components/sonar/SkeletonRow";
import { useSignals } from "@/integrations/sonar/queries";
import { sonar, SONAR_TABLES } from "@/integrations/sonar/client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/signal-engine")({
  component: SignalEnginePage,
});

function SignalEnginePage() {
  const signals = useSignals(50);
  const qc = useQueryClient();
  const [scanning, setScanning] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const detectedToday = useMemo(
    () =>
      (signals.data ?? []).filter(
        (s) => new Date(s.detected_at) >= today,
      ).length,
    [signals.data, today],
  );

  const highIntent = useMemo(
    () =>
      (signals.data ?? []).filter(
        (s) => (s.icp_score ?? 0) >= 75 && new Date(s.detected_at) >= today,
      ).length,
    [signals.data, today],
  );

  const lastDetected = signals.data?.[0]?.detected_at;

  const onRunNow = async () => {
    const url = import.meta.env.VITE_N8N_SIGNAL_SCAN_URL as string | undefined;
    if (!url) {
      toast.error("Webhook URL not configured", {
        description: "Set VITE_N8N_SIGNAL_SCAN_URL to enable manual scans.",
      });
      return;
    }
    setScanning(true);
    try {
      await fetch(url, { method: "POST" });
      toast.success("Scan triggered");
    } catch {
      toast.error("Failed to trigger scan");
    } finally {
      setScanning(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await sonar
      .from(SONAR_TABLES.signals)
      .update({ status })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["sonar", "signals"] });
    }
  };

  return (
    <>
      <PageHeader
        title="Signal Engine"
        subtitle="Live buying signals across LinkedIn, Crunchbase, job boards and more."
        actions={
          <>
            <span className="text-[11px] mono uppercase text-text-muted">
              Last scan:{" "}
              {lastDetected
                ? formatDistanceToNow(new Date(lastDetected), { addSuffix: true })
                : "—"}
            </span>
            <button
              onClick={onRunNow}
              disabled={scanning}
              className="inline-flex items-center gap-2 rounded-md border border-border-bright bg-signal/10 px-3 py-1.5 text-xs font-semibold mono text-signal hover:bg-signal/20 disabled:opacity-50"
            >
              <RefreshCw size={13} className={scanning ? "animate-spin" : ""} />
              Run Now
            </button>
          </>
        }
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <KpiCard
          label="Signals Detected Today"
          value={detectedToday}
          accent="signal"
          loading={signals.isLoading}
        />
        <KpiCard
          label="High Intent (75+)"
          value={highIntent}
          accent="success"
          loading={signals.isLoading}
        />
        <Panel>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted mono">
            Active Sources
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["LinkedIn", "Crunchbase", "Job Boards"].map((s) => (
              <span
                key={s}
                className="rounded-md bg-signal/10 px-2 py-1 text-[11px] mono text-signal"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-text-muted">
            Continuous polling · 5 min cadence
          </div>
        </Panel>
      </div>

      <Panel className="mt-6">
        {signals.isLoading ? (
          <SkeletonRows rows={8} cols={7} />
        ) : (signals.data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={Radar}
            title="No signals captured yet"
            description="The scanner runs every 5 minutes. New signals will land here automatically."
          />
        ) : (
          <DataTable
            headers={["Company", "Domain", "Signal", "Evidence", "Score", "Detected", "Status"]}
          >
            {signals.data!.map((s) => (
              <Tr key={s.id}>
                <Td className="font-medium">{s.company ?? "—"}</Td>
                <Td className="text-xs text-text-muted mono">{s.domain ?? "—"}</Td>
                <Td><SignalTypeBadge type={s.signal_type} /></Td>
                <Td className="max-w-xs truncate text-xs text-text-muted">
                  {s.evidence ?? "—"}
                </Td>
                <Td><ScoreBar value={s.icp_score} /></Td>
                <Td className="text-[11px] mono text-text-muted">
                  {formatDistanceToNow(new Date(s.detected_at), { addSuffix: true })}
                </Td>
                <Td>
                  <select
                    defaultValue={s.status ?? "new"}
                    onChange={(e) => updateStatus(s.id, e.target.value)}
                    className="rounded-md border border-border bg-[color:var(--color-panel-elevated)] px-2 py-1 text-[11px] mono text-foreground"
                  >
                    <option value="new">new</option>
                    <option value="actioned">actioned</option>
                    <option value="watch">watch</option>
                    <option value="passed">passed</option>
                  </select>
                </Td>
              </Tr>
            ))}
          </DataTable>
        )}
      </Panel>

      {/* Status legend */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <StatusBadge status="new" />
        <StatusBadge status="actioned" />
        <StatusBadge status="watch" />
        <StatusBadge status="passed" />
      </div>
    </>
  );
}
