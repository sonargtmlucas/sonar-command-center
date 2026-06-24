import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Plus, Search, Users } from "lucide-react";

import { PageHeader } from "@/components/sonar/AppShell";
import { Panel } from "@/components/sonar/Panel";
import { DataTable, Td, Tr } from "@/components/sonar/Table";
import { EmptyState } from "@/components/sonar/EmptyState";
import { SkeletonRows } from "@/components/sonar/SkeletonRow";
import { SlideOver } from "@/components/sonar/SlideOver";
import { useLeads } from "@/integrations/sonar/queries";
import type { Lead } from "@/integrations/sonar/types";

export const Route = createFileRoute("/accounts")({
  component: AccountsPage,
});

function fitLabel(score: number | null) {
  const s = score ?? 0;
  if (s >= 80) return { label: "HIGH FIT", cls: "bg-success/15 text-success" };
  if (s >= 60) return { label: "QUALIFIED", cls: "bg-warning/15 text-warning" };
  if (s >= 40) return { label: "WATCH", cls: "bg-text-dim/20 text-text-muted" };
  return { label: "PASS", cls: "bg-[color:var(--color-panel-elevated)] text-text-muted" };
}

function AccountsPage() {
  const leads = useLeads(500);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [sort, setSort] = useState<"score" | "date">("score");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    let rows = leads.data ?? [];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.name ?? "").toLowerCase().includes(q) ||
          (r.company ?? "").toLowerCase().includes(q),
      );
    }
    if (statusFilter) rows = rows.filter((r) => r.status === statusFilter);
    if (scoreFilter !== "all") {
      const [min, max] = scoreFilter.split("-").map(Number);
      rows = rows.filter((r) => {
        const s = r.icp_score ?? 0;
        return s >= min && s <= max;
      });
    }
    if (sort === "date") {
      rows = [...rows].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    } else {
      rows = [...rows].sort((a, b) => (b.icp_score ?? 0) - (a.icp_score ?? 0));
    }
    return rows;
  }, [leads.data, search, statusFilter, scoreFilter, sort]);

  return (
    <>
      <PageHeader
        title="Accounts"
        subtitle="Every account Sonar has identified, scored and tracked."
        actions={
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-border-bright bg-signal/10 px-3 py-1.5 text-xs font-semibold mono text-signal hover:bg-signal/20"
          >
            <Plus size={13} /> Add Lead
          </button>
        }
      />

      <Panel className="mb-4">
        <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or company"
              className="w-full rounded-md border border-border bg-[color:var(--color-panel-elevated)] pl-9 pr-3 py-2 text-sm placeholder:text-text-dim focus:border-border-bright focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-border bg-[color:var(--color-panel-elevated)] px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="replied">Replied</option>
            <option value="meeting">Meeting</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="rounded-md border border-border bg-[color:var(--color-panel-elevated)] px-3 py-2 text-sm"
          >
            <option value="all">All scores</option>
            <option value="80-100">80-100 · High fit</option>
            <option value="60-79">60-79 · Qualified</option>
            <option value="40-59">40-59 · Watch</option>
            <option value="0-39">0-39 · Pass</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "score" | "date")}
            className="rounded-md border border-border bg-[color:var(--color-panel-elevated)] px-3 py-2 text-sm"
          >
            <option value="score">Sort: ICP score</option>
            <option value="date">Sort: Newest</option>
          </select>
        </div>
      </Panel>

      <Panel>
        {leads.isLoading ? (
          <SkeletonRows rows={10} cols={8} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No accounts match"
            description="Adjust your filters or add a new lead from the top right."
          />
        ) : (
          <DataTable
            headers={["Name", "Title", "Company", "Score", "Signals", "Status", "Source", "Added"]}
          >
            {filtered.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </DataTable>
        )}
      </Panel>

      <SlideOver open={addOpen} onClose={() => setAddOpen(false)} title="Add Lead">
        <AddLeadForm onDone={() => setAddOpen(false)} />
      </SlideOver>
    </>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const fit = fitLabel(lead.icp_score);
  return (
    <Tr>
      <Td className="font-medium">{lead.name ?? "—"}</Td>
      <Td className="text-xs text-text-muted">{lead.title ?? "—"}</Td>
      <Td>{lead.company ?? "—"}</Td>
      <Td>
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] mono font-semibold ${fit.cls}`}>
          <span className="num">{lead.icp_score ?? 0}</span> {fit.label}
        </span>
      </Td>
      <Td>
        <div className="flex flex-wrap gap-1">
          {(lead.signals ?? []).slice(0, 3).map((s) => (
            <span key={s} className="rounded bg-signal/10 px-1.5 py-0.5 text-[10px] mono text-signal">
              {s.replace("_", " ")}
            </span>
          ))}
          {(lead.signals?.length ?? 0) > 3 && (
            <span className="text-[10px] mono text-text-muted">+{lead.signals!.length - 3}</span>
          )}
        </div>
      </Td>
      <Td className="text-xs text-text-muted">{lead.status ?? "new"}</Td>
      <Td className="text-[11px] mono text-text-muted">{lead.source ?? "—"}</Td>
      <Td className="text-[11px] mono text-text-muted">
        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
      </Td>
    </Tr>
  );
}

function AddLeadForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = import.meta.env.VITE_N8N_LEAD_ENRICHMENT_URL as string | undefined;
    setSubmitting(true);
    try {
      if (url) {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, linkedin_url: linkedin, company }),
        });
        toast.success("Lead queued for enrichment");
      } else {
        toast.message("Webhook URL not configured", {
          description: "Set VITE_N8N_LEAD_ENRICHMENT_URL to auto-process leads.",
        });
      }
      onDone();
    } catch {
      toast.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Name">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-border bg-[color:var(--color-panel)] px-3 py-2 text-sm"
        />
      </Field>
      <Field label="LinkedIn URL">
        <input
          required
          type="url"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          placeholder="https://linkedin.com/in/..."
          className="w-full rounded-md border border-border bg-[color:var(--color-panel)] px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Company (optional)">
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full rounded-md border border-border bg-[color:var(--color-panel)] px-3 py-2 text-sm"
        />
      </Field>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-fit items-center gap-2 rounded-md border border-border-bright bg-signal/10 px-4 py-2 text-sm font-semibold mono text-signal hover:bg-signal/20 disabled:opacity-50"
      >
        {submitting ? "Processing..." : "Enrich & Add"}
      </button>
    </form>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] mono uppercase tracking-wider text-text-muted">{label}</span>
      {children}
    </label>
  );
}
