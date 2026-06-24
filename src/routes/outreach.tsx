import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { ExternalLink, Mail, Linkedin, RefreshCw, Send } from "lucide-react";

import { PageHeader } from "@/components/sonar/AppShell";
import { KpiCard } from "@/components/sonar/KpiCard";
import { Panel, PanelHeader } from "@/components/sonar/Panel";
import { DataTable, Td, Tr } from "@/components/sonar/Table";
import { StatusBadge } from "@/components/sonar/Badges";
import { EmptyState } from "@/components/sonar/EmptyState";
import { SkeletonRows } from "@/components/sonar/SkeletonRow";
import { SlideOver } from "@/components/sonar/SlideOver";
import { useCampaigns } from "@/integrations/sonar/queries";
import type { Campaign } from "@/integrations/sonar/types";

export const Route = createFileRoute("/outreach")({
  component: OutreachPage,
});

function OutreachPage() {
  const campaigns = useCampaigns();
  const [active, setActive] = useState<Campaign | null>(null);
  const [syncing, setSyncing] = useState(false);

  const stats = useMemo(() => {
    const rows = campaigns.data ?? [];
    if (rows.length === 0) {
      return { sent: 0, open: 0, reply: 0, positive: 0 };
    }
    const sent = rows.reduce((s, c) => s + (c.emails_sent ?? 0), 0);
    const open =
      rows.reduce((s, c) => s + (c.open_rate ?? 0), 0) / rows.length;
    const reply =
      rows.reduce((s, c) => s + (c.reply_rate ?? 0), 0) / rows.length;
    const positive = rows.reduce((s, c) => s + (c.positive_reply_count ?? 0), 0);
    return { sent, open, reply, positive };
  }, [campaigns.data]);

  const onSync = async () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("Instantly sync queued", {
        description: "Latest campaign metrics will refresh in ~30 seconds.",
      });
    }, 1200);
  };

  return (
    <>
      <PageHeader
        title="Outreach"
        subtitle="Multi-channel sequences: email via Instantly, LinkedIn touchpoints, strategy call booking."
        actions={
          <button
            onClick={onSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-md border border-border-bright bg-signal/10 px-3 py-1.5 text-xs font-semibold mono text-signal hover:bg-signal/20 disabled:opacity-50"
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            Sync Instantly
          </button>
        }
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Emails Sent"
          value={stats.sent.toLocaleString()}
          accent="signal"
          loading={campaigns.isLoading}
        />
        <KpiCard
          label="Open Rate"
          value={`${stats.open.toFixed(1)}%`}
          accent="signal"
          loading={campaigns.isLoading}
        />
        <KpiCard
          label="Reply Rate"
          value={`${stats.reply.toFixed(1)}%`}
          accent={stats.reply >= 5 ? "success" : "warning"}
          loading={campaigns.isLoading}
        />
        <KpiCard
          label="Positive Replies"
          value={stats.positive.toLocaleString()}
          accent="success"
          loading={campaigns.isLoading}
        />
      </div>

      <Panel className="mt-6">
        <PanelHeader title="Campaigns" subtitle="Click a row for sequence detail" />
        {campaigns.isLoading ? (
          <SkeletonRows rows={6} cols={7} />
        ) : (campaigns.data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={Send}
            title="No campaigns yet"
            description="Connect Instantly and your first sequences will appear here."
          />
        ) : (
          <DataTable
            headers={[
              "Campaign",
              "Status",
              "Sent",
              "Open",
              "Reply",
              "Meetings",
              "Last Synced",
              "",
            ]}
          >
            {campaigns.data!.map((c) => (
              <Tr key={c.id} onClick={() => setActive(c)}>
                <Td className="font-medium">{c.name}</Td>
                <Td><StatusBadge status={c.status} /></Td>
                <Td className="num text-xs">{(c.emails_sent ?? 0).toLocaleString()}</Td>
                <Td className="num text-xs">{(c.open_rate ?? 0).toFixed(1)}%</Td>
                <Td className="num text-xs">{(c.reply_rate ?? 0).toFixed(1)}%</Td>
                <Td className="num text-xs">{c.meetings_booked ?? 0}</Td>
                <Td className="text-[11px] mono text-text-muted">
                  {c.last_synced_at
                    ? formatDistanceToNow(new Date(c.last_synced_at), { addSuffix: true })
                    : "—"}
                </Td>
                <Td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive(c);
                    }}
                    className="text-[11px] mono text-signal hover:underline"
                  >
                    View
                  </button>
                </Td>
              </Tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <SlideOver
        open={!!active}
        onClose={() => setActive(null)}
        title="Sequence Preview"
      >
        {active && <SequenceView campaign={active} />}
      </SlideOver>
    </>
  );
}

const previewEmails = [
  {
    day: 1,
    subject: "{{first_name}}, a thought on {{company}}'s {{signal_topic}}",
    body: "Saw {{trigger_event}} — usually that means {{pain_hypothesis}}. We help {{ICP}} get to {{outcome}} in {{timeframe}}. Worth a 15-min look?",
  },
  {
    day: 4,
    subject: "Re: {{company}} + {{signal_topic}}",
    body: "Quick follow-up. Specifically on {{signal_evidence}} — here's how a similar team handled it: {{mini_case}}.",
  },
  {
    day: 8,
    subject: "Last ping from Sonar",
    body: "Closing the loop. If now isn't the moment, no problem — happy to share the playbook anyway.",
  },
  {
    day: 11,
    subject: "{{first_name}} — should I keep checking in?",
    body: "Yes/no will do. If yes, here's our calendar: tidycal.com/castro",
  },
];

function SequenceView({ campaign }: { campaign: Campaign }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-bold">{campaign.name}</div>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={campaign.status} />
            <span className="text-[11px] mono text-text-muted">
              Reply rate {(campaign.reply_rate ?? 0).toFixed(1)}%
            </span>
          </div>
        </div>
        <a
          href="https://app.instantly.ai"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs mono text-signal hover:underline"
        >
          <ExternalLink size={12} /> Instantly
        </a>
      </div>

      <div className="rounded-md border border-border bg-[color:var(--color-panel)] p-3">
        <div className="text-[10px] mono uppercase tracking-wider text-text-muted mb-2">
          Multi-channel flow
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Step icon={Mail} label="Email 1-4" />
          <Connector />
          <Step icon={Linkedin} label="LinkedIn" />
          <Connector />
          <Step icon={Send} label="Strategy Call" />
        </div>
        <div className="mt-2 text-[11px] text-text-muted">
          If no response after Email 3 → LinkedIn touchpoint via Phantom Buster → book at tidycal.com/castro
        </div>
      </div>

      <ol className="flex flex-col gap-3">
        {previewEmails.map((e, idx) => (
          <li
            key={idx}
            className="relative rounded-md border border-border bg-[color:var(--color-panel)] p-4"
          >
            <div className="absolute -left-2 top-4 grid h-5 w-5 place-items-center rounded-full border border-border-bright bg-background text-[10px] num text-signal">
              {idx + 1}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[10px] mono uppercase tracking-wider text-text-muted">
                Day {e.day} · Email {idx + 1}
              </div>
              <Mail size={12} className="text-text-muted" />
            </div>
            <div className="mt-1 text-sm font-semibold">{e.subject}</div>
            <p className="mt-2 text-xs text-text-muted whitespace-pre-wrap">
              {e.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Step({
  icon: Icon,
  label,
}: {
  icon: typeof Mail;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-[color:var(--color-panel-elevated)] px-2 py-1 mono">
      <Icon size={12} className="text-signal" />
      {label}
    </span>
  );
}
function Connector() {
  return <span className="h-px w-4 bg-border-bright" />;
}
