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
  company_domain: string | null;
  linkedin_url: string | null;
  email: string | null;
  icp_score: number | null;
  status: string | null;
  source: string | null;
  signals: SignalType[] | null;
  why_now: string | null;
  personalized_line: string | null;
  created_at: string;
}

export interface Signal {
  id: string;
  company: string | null;
  company_domain: string | null;
  signal_type: SignalType;
  signal_detail: string | null;
  evidence: string | null;
  icp_score: number | null;
  status: "new" | "actioned" | "watch" | "passed" | null;
  detected_at: string;
  source: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "draft" | "completed";
  emails_sent: number | null;
  open_rate: number | null;
  reply_rate: number | null;
  positive_reply_count: number | null;
  meetings_booked: number | null;
  last_synced_at: string | null;
  created_at: string;
}

export interface PipelineAccount {
  id: string;
  company: string | null;
  contact_name: string | null;
  contact_title: string | null;
  deal_value: number | null;
  stage: PipelineStage;
  last_activity: string | null;
  next_action: string | null;
  notes: string | null;
}

export interface Meeting {
  id: string;
  contact_name: string | null;
  company: string | null;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  meeting_date: string | null;
  meeting_type: string | null;
}

export interface AgentLog {
  id: string;
  agent: AgentName;
  action: string;
  result: string | null;
  status: "success" | "error" | "running" | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface MetricsSnapshot {
  id: string;
  snapshot_date: string;
  signals_detected: number | null;
  emails_sent: number | null;
  reply_rate: number | null;
  leads_added: number | null;
  meetings_booked: number | null;
  pipeline_value: number | null;
  mrr: number | null;
}
