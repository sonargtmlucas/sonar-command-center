export type SignalType =
  | "hiring"
  | "leadership_change"
  | "funding"
  | "expansion"
  | "tech_shift"
  | "public_pain";

export type PipelineStage =
  | "identified"
  | "contacted"
  | "replied"
  | "meeting_booked"
  | "proposal_sent"
  | "closed_won"
  | "closed_lost";

export type AgentName =
  | "scout"
  | "signal_engine"
  | "outreach"
  | "enrichment"
  | "daily_brief";

export interface Lead {
  id: string;
  name: string | null;
  title: string | null;
  company: string | null;
  domain: string | null;
  linkedin_url: string | null;
  icp_score: number | null;
  status: string | null;
  source: string | null;
  signals: SignalType[] | null;
  created_at: string;
}

export interface Signal {
  id: string;
  company: string | null;
  domain: string | null;
  signal_type: SignalType;
  evidence: string | null;
  icp_score: number | null;
  status: "new" | "actioned" | "watch" | "passed" | null;
  detected_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "draft" | "completed";
  emails_sent: number | null;
  open_rate: number | null;
  reply_rate: number | null;
  positive_replies: number | null;
  meetings_booked: number | null;
  last_synced_at: string | null;
  created_at: string;
}

export interface PipelineAccount {
  id: string;
  company: string | null;
  contact_name: string | null;
  contact_title: string | null;
  icp_score: number | null;
  deal_value: number | null;
  stage: PipelineStage;
  last_activity_at: string | null;
  notes: string | null;
}

export interface Meeting {
  id: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  scheduled_at: string | null;
}

export interface AgentLog {
  id: string;
  agent: AgentName;
  action: string;
  status: "ok" | "warn" | "error" | null;
  created_at: string;
}

export interface MetricsSnapshot {
  id: string;
  snapshot_date: string; // ISO date
  signals_detected: number | null;
}
