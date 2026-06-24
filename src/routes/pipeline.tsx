import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { GitBranch } from "lucide-react";

import { PageHeader } from "@/components/sonar/AppShell";
import { KpiCard } from "@/components/sonar/KpiCard";
import { Panel } from "@/components/sonar/Panel";
import { SlideOver } from "@/components/sonar/SlideOver";
import { EmptyState } from "@/components/sonar/EmptyState";
import { ScoreBadge } from "@/components/sonar/Badges";
import { useMeetings, usePipeline } from "@/integrations/sonar/queries";
import { sonar, SONAR_TABLES } from "@/integrations/sonar/client";
import type {
  PipelineAccount,
  PipelineStage,
} from "@/integrations/sonar/types";

export const Route = createFileRoute("/pipeline")({
  component: PipelinePage,
});

const COLUMNS: { stage: PipelineStage; label: string; color: string }[] = [
  { stage: "identified", label: "Identified", color: "var(--color-text-dim)" },
  { stage: "contacted", label: "Contacted", color: "var(--color-signal)" },
  { stage: "replied", label: "Replied", color: "var(--color-warning)" },
  { stage: "meeting_booked", label: "Meeting Booked", color: "var(--color-success)" },
  { stage: "proposal_sent", label: "Proposal Sent", color: "#a78bfa" },
  { stage: "closed_won", label: "Closed Won", color: "var(--color-success)" },
];

function PipelinePage() {
  const pipeline = usePipeline();
  const meetings = useMeetings();
  const qc = useQueryClient();
  const [activeDeal, setActiveDeal] = useState<PipelineAccount | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const totals = useMemo(() => {
    const rows = pipeline.data ?? [];
    const open = rows.filter((r) => r.stage !== "closed_lost");
    const total = open.reduce((s, r) => s + (r.deal_value ?? 0), 0);
    const won = rows.filter((r) => r.stage === "closed_won");
    const closeRate =
      rows.length > 0 ? (won.length / rows.length) * 100 : 0;
    const avg = open.length > 0 ? total / open.length : 0;
    return { total, avg, closeRate, count: rows.length };
  }, [pipeline.data]);

  const grouped = useMemo(() => {
    const m = new Map<PipelineStage, PipelineAccount[]>();
    COLUMNS.forEach((c) => m.set(c.stage, []));
    (pipeline.data ?? []).forEach((d) => {
      if (m.has(d.stage)) m.get(d.stage)!.push(d);
    });
    return m;
  }, [pipeline.data]);

  const meetingsCount = (meetings.data ?? []).filter(
    (m) => m.status === "scheduled" || m.status === "completed",
  ).length;

  const onDragEnd = async (e: DragEndEvent) => {
    const id = e.active.id as string;
    const stage = e.over?.id as PipelineStage | undefined;
    if (!stage) return;
    const deal = (pipeline.data ?? []).find((d) => d.id === id);
    if (!deal || deal.stage === stage) return;

    qc.setQueryData<PipelineAccount[]>(["sonar", "pipeline"], (prev) =>
      (prev ?? []).map((d) => (d.id === id ? { ...d, stage } : d)),
    );

    const { error } = await sonar
      .from(SONAR_TABLES.pipeline)
      .update({ stage, last_activity_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Move failed");
      qc.invalidateQueries({ queryKey: ["sonar", "pipeline"] });
    } else {
      toast.success(`Moved to ${stage.replace("_", " ")}`);
    }
  };

  return (
    <>
      <PageHeader
        title="Pipeline"
        subtitle="Drag deals across stages. Updates sync to Supabase in real time."
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Pipeline"
          value={`$${totals.total.toLocaleString()}`}
          accent="signal"
        />
        <KpiCard
          label="Meetings Booked"
          value={meetingsCount}
          accent="success"
        />
        <KpiCard
          label="Avg Deal Value"
          value={`$${Math.round(totals.avg).toLocaleString()}`}
          accent="signal"
        />
        <KpiCard
          label="Close Rate"
          value={`${totals.closeRate.toFixed(1)}%`}
          accent={totals.closeRate >= 20 ? "success" : "warning"}
        />
      </div>

      {pipeline.isLoading ? (
        <Panel className="mt-6">
          <div className="h-64 skeleton" />
        </Panel>
      ) : (pipeline.data?.length ?? 0) === 0 ? (
        <Panel className="mt-6">
          <EmptyState
            icon={GitBranch}
            title="No deals in pipeline"
            description="Once leads enter outreach, they'll show up as cards here."
          />
        </Panel>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="mt-6 grid grid-flow-col auto-cols-[280px] gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <Column
                key={col.stage}
                stage={col.stage}
                label={col.label}
                color={col.color}
                deals={grouped.get(col.stage) ?? []}
                onOpen={setActiveDeal}
              />
            ))}
          </div>
        </DndContext>
      )}

      <SlideOver
        open={!!activeDeal}
        onClose={() => setActiveDeal(null)}
        title="Deal"
      >
        {activeDeal && <DealDetail deal={activeDeal} />}
      </SlideOver>
    </>
  );
}

function Column({
  stage,
  label,
  color,
  deals,
  onOpen,
}: {
  stage: PipelineStage;
  label: string;
  color: string;
  deals: PipelineAccount[];
  onOpen: (d: PipelineAccount) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={`panel flex flex-col gap-3 p-3 transition-colors ${
        isOver ? "border-border-bright" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: color }}
          />
          <span className="text-[11px] mono uppercase tracking-wider text-foreground">
            {label}
          </span>
        </div>
        <span className="num text-[11px] mono text-text-muted">
          {deals.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 min-h-[120px]">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} onOpen={onOpen} celebrate={stage === "closed_won"} />
        ))}
      </div>
    </div>
  );
}

function DealCard({
  deal,
  onOpen,
  celebrate,
}: {
  deal: PipelineAccount;
  onOpen: (d: PipelineAccount) => void;
  celebrate?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: deal.id });
  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(deal)}
      whileHover={{ scale: 1.01 }}
      animate={
        celebrate
          ? { boxShadow: ["0 0 0 rgba(55,211,153,0)", "0 0 20px rgba(55,211,153,0.4)", "0 0 0 rgba(55,211,153,0)"] }
          : {}
      }
      transition={celebrate ? { repeat: Infinity, duration: 2.2 } : {}}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.6 : 1,
        cursor: "grab",
      }}
      className="rounded-md border border-border bg-[color:var(--color-panel-elevated)] p-3 hover:border-border-bright"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold">{deal.company ?? "—"}</div>
        <ScoreBadge score={deal.icp_score} />
      </div>
      <div className="mt-1 text-[11px] text-text-muted">
        {deal.contact_name ?? "—"}
        {deal.contact_title ? ` · ${deal.contact_title}` : ""}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="num text-xs text-signal">
          {deal.deal_value ? `$${deal.deal_value.toLocaleString()}` : "—"}
        </span>
        <span className="text-[10px] mono text-text-muted">
          {deal.last_activity_at
            ? formatDistanceToNow(new Date(deal.last_activity_at), { addSuffix: true })
            : "no activity"}
        </span>
      </div>
    </motion.div>
  );
}

function DealDetail({ deal }: { deal: PipelineAccount }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-2xl font-bold">{deal.company ?? "—"}</div>
        <div className="text-sm text-text-muted">
          {deal.contact_name ?? ""}
          {deal.contact_title ? ` · ${deal.contact_title}` : ""}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Tile label="Stage" value={deal.stage.replace("_", " ")} />
        <Tile label="Deal Value" value={deal.deal_value ? `$${deal.deal_value.toLocaleString()}` : "—"} />
        <Tile label="ICP Score" value={String(deal.icp_score ?? "—")} />
        <Tile
          label="Last Activity"
          value={deal.last_activity_at ? formatDistanceToNow(new Date(deal.last_activity_at), { addSuffix: true }) : "—"}
        />
      </div>
      <div>
        <div className="text-[10px] mono uppercase tracking-wider text-text-muted">
          Notes
        </div>
        <p className="mt-1 text-sm text-text-muted">
          {deal.notes ?? "No notes yet."}
        </p>
      </div>
    </div>
  );
}
function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-[color:var(--color-panel)] p-3">
      <div className="text-[10px] mono uppercase tracking-wider text-text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
