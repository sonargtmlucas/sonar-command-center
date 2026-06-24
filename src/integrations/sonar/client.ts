import { createClient } from "@supabase/supabase-js";

// External Sonar GTM Supabase project (publishable anon key — safe in client).
const SUPABASE_URL =
  (import.meta.env.VITE_SONAR_SUPABASE_URL as string | undefined) ??
  "https://pdfonsharlebsmfncwkj.supabase.co";

const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SONAR_SUPABASE_ANON_KEY as string | undefined) ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZm9uc2hhcmxlYnNtZm5jd2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwOTQ0NjEsImV4cCI6MjA5NzY3MDQ2MX0.zDH7jAJZHl9xsiq5tRUcrZXTege858dbHerI7CPPu4Q";

export const sonar = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const SONAR_TABLES = {
  leads: "leads",
  signals: "signals",
  campaigns: "campaigns",
  pipeline: "pipeline_accounts",
  meetings: "meetings",
  agentLogs: "agent_logs",
  metrics: "metrics_snapshots",
} as const;
