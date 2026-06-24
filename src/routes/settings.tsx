import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Power, X } from "lucide-react";

import { PageHeader } from "@/components/sonar/AppShell";
import { Panel, PanelHeader } from "@/components/sonar/Panel";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const initialWorkflows = [
  { name: "Signal Scan", lastRun: "12 min ago", active: true },
  { name: "Lead Enrichment", lastRun: "1 hour ago", active: true },
  { name: "Outreach Sequencer", lastRun: "23 min ago", active: true },
  { name: "Daily Brief", lastRun: "7 hours ago", active: false },
];

function SettingsPage() {
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [telegram, setTelegram] = useState<Record<string, boolean>>({
    "Signal Scan": true,
    "Lead Enrichment": false,
    "Outreach Sequencer": true,
    "Daily Brief": true,
  });

  return (
    <>
      <PageHeader title="Settings" subtitle="Integrations, workflows and team." />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="API Connections" />
          <div className="flex flex-col gap-3">
            <Connection name="Instantly" status="connected" detail="API key valid · 4 workspaces" />
            <Connection name="Apify" status="connected" detail="LinkedIn scraper active" />
            <Connection name="Supabase" status="connected" detail="pdfonsharlebsmfncwkj" />
            <Connection name="Phantom Buster" status="disconnected" detail="Add API key to enable LinkedIn touchpoints" />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="n8n Workflows" />
          <div className="flex flex-col gap-3">
            {workflows.map((w) => (
              <div
                key={w.name}
                className="flex items-center justify-between rounded-md border border-border bg-[color:var(--color-panel)] p-3"
              >
                <div>
                  <div className="text-sm font-semibold">{w.name}</div>
                  <div className="text-[11px] mono text-text-muted">
                    Last run · {w.lastRun}
                  </div>
                </div>
                <button
                  onClick={() =>
                    setWorkflows((prev) =>
                      prev.map((p) =>
                        p.name === w.name ? { ...p, active: !p.active } : p,
                      ),
                    )
                  }
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] mono font-semibold ${
                    w.active
                      ? "bg-success/15 text-success"
                      : "bg-text-dim/20 text-text-muted"
                  }`}
                >
                  <Power size={12} />
                  {w.active ? "Active" : "Paused"}
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Team" />
          <div className="flex flex-col gap-3">
            <TeamMember name="Tiago Castro" role="Owner" initials="TC" />
            <TeamMember name="Lucas Mendes" role="Operator" initials="LM" />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Notifications" subtitle="Telegram alerts per workflow" />
          <div className="flex flex-col gap-2">
            {workflows.map((w) => (
              <label
                key={w.name}
                className="flex items-center justify-between rounded-md border border-border bg-[color:var(--color-panel)] p-3 cursor-pointer"
              >
                <span className="text-sm">{w.name}</span>
                <input
                  type="checkbox"
                  checked={telegram[w.name] ?? false}
                  onChange={(e) =>
                    setTelegram((p) => ({ ...p, [w.name]: e.target.checked }))
                  }
                  className="h-4 w-4 accent-[color:var(--color-signal)]"
                />
              </label>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function Connection({
  name,
  status,
  detail,
}: {
  name: string;
  status: "connected" | "disconnected";
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-[color:var(--color-panel)] p-3">
      <div>
        <div className="text-sm font-semibold">{name}</div>
        <div className="text-[11px] mono text-text-muted">{detail}</div>
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] mono font-semibold ${
          status === "connected"
            ? "bg-success/15 text-success"
            : "bg-danger/15 text-danger"
        }`}
      >
        {status === "connected" ? <Check size={12} /> : <X size={12} />}
        {status}
      </span>
    </div>
  );
}

function TeamMember({
  name,
  role,
  initials,
}: {
  name: string;
  role: string;
  initials: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-[color:var(--color-panel)] p-3">
      <div className="grid h-9 w-9 place-items-center rounded-full border border-border-bright bg-[color:var(--color-panel-elevated)] text-[11px] mono font-semibold text-signal">
        {initials}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{name}</div>
        <div className="text-[11px] mono uppercase tracking-wider text-text-muted">
          {role}
        </div>
      </div>
    </div>
  );
}
