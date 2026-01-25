import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { WeeklyReport } from "../types";

export const getReports = async (userId: string): Promise<WeeklyReport[]> => {
  const { data, error } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const useReports = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["reports", user?.id],
    queryFn: () => getReports(user!.id),
    enabled: !!user,
  });
};
