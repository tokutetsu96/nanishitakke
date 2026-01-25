import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { WorkMemo } from "../types";

export const getWorkMemos = async (
  userId: string,
  options?: { startDate?: string; endDate?: string }
): Promise<WorkMemo[]> => {
  let query = supabase
    .from("work_memos")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (options?.startDate) {
    query = query.gte("date", options.startDate);
  }
  if (options?.endDate) {
    query = query.lte("date", options.endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

export const useWorkMemos = (options?: {
  startDate?: string;
  endDate?: string;
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["work-memos", user?.id, options?.startDate, options?.endDate],
    queryFn: () => getWorkMemos(user!.id, options),
    enabled: !!user,
  });
};
