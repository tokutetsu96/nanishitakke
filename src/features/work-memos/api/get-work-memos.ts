import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { WorkMemo } from "../types";

export const getWorkMemos = async (userId: string): Promise<WorkMemo[]> => {
  const { data, error } = await supabase
    .from("work_memos")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const useWorkMemos = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["work-memos", user?.id],
    queryFn: () => getWorkMemos(user!.id),
    enabled: !!user,
  });
};
