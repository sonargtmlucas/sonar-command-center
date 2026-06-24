import { useQuery } from "@tanstack/react-query";
import { sonar, SONAR_TABLES } from "./client";
import type {
  AgentLog,
  Campaign,
  Lead,
  MetricsSnapshot,
  Meeting,
  PipelineAccount,
  Signal,
} from "./types";

const REFRESH_MS = 30_000;

export function useLeads(limit = 200) {
  return useQuery({
    queryKey: ["sonar", "leads", limit],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await sonar
        .from(SONAR_TABLES.leads)
        .select("*")
        .order("icp_score", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
    refetchInterval: REFRESH_MS,
  });
}

export function useSignals(limit = 50) {
  return useQuery({
    queryKey: ["sonar", "signals", limit],
    queryFn: async (): Promise<Signal[]> => {
      const { data, error } = await sonar
        .from(SONAR_TABLES.signals)
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Signal[];
    },
    refetchInterval: REFRESH_MS,
  });
}

export function useCampaigns() {
  return useQuery({
    queryKey: ["sonar", "campaigns"],
    queryFn: async (): Promise<Campaign[]> => {
      const { data, error } = await sonar
        .from(SONAR_TABLES.campaigns)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Campaign[];
    },
    refetchInterval: REFRESH_MS,
  });
}

export function usePipeline() {
  return useQuery({
    queryKey: ["sonar", "pipeline"],
    queryFn: async (): Promise<PipelineAccount[]> => {
      const { data, error } = await sonar
        .from(SONAR_TABLES.pipeline)
        .select("*")
        .order("last_activity_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as PipelineAccount[];
    },
    refetchInterval: REFRESH_MS,
  });
}

export function useMeetings() {
  return useQuery({
    queryKey: ["sonar", "meetings"],
    queryFn: async (): Promise<Meeting[]> => {
      const { data, error } = await sonar
        .from(SONAR_TABLES.meetings)
        .select("*");
      if (error) throw error;
      return (data ?? []) as Meeting[];
    },
    refetchInterval: REFRESH_MS,
  });
}

export function useAgentLogs(limit = 15) {
  return useQuery({
    queryKey: ["sonar", "agent_logs", limit],
    queryFn: async (): Promise<AgentLog[]> => {
      const { data, error } = await sonar
        .from(SONAR_TABLES.agentLogs)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as AgentLog[];
    },
    refetchInterval: REFRESH_MS,
  });
}

export function useMetricsSnapshots(days = 7) {
  return useQuery({
    queryKey: ["sonar", "metrics", days],
    queryFn: async (): Promise<MetricsSnapshot[]> => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data, error } = await sonar
        .from(SONAR_TABLES.metrics)
        .select("*")
        .gte("snapshot_date", since.toISOString().slice(0, 10))
        .order("snapshot_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MetricsSnapshot[];
    },
    refetchInterval: REFRESH_MS,
  });
}
