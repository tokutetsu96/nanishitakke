import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { WeeklyReport } from "../types";

export const getReports = async (
  userId: string,
  options?: { startDate?: string; endDate?: string }
): Promise<WeeklyReport[]> => {
  let query = supabase
    .from("weekly_reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options?.startDate) {
    query = query.gte("created_at", options.startDate);
  }
  if (options?.endDate) {
    query = query.lte("created_at", options.endDate + "T23:59:59");
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

export const useReports = (options?: {
  startDate?: string;
  endDate?: string;
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["reports", user?.id, options?.startDate, options?.endDate],
    queryFn: () => getReports(user!.id, options),
    enabled: !!user,
  });
};
