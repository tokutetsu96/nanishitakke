import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Activity } from "../types";

type GetActivitiesParams = {
  date?: string;
  startDate?: string;
  endDate?: string;
};

export const getActivities = async (
  userId: string,
  params: GetActivitiesParams
): Promise<Activity[]> => {
  let query = supabase.from("activities").select("*").eq("user_id", userId);

  if (params.date) {
    query = query
      .eq("date", params.date)
      .order("start_time", { ascending: true });
  } else if (params.startDate && params.endDate) {
    query = query.gte("date", params.startDate).lte("date", params.endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

export const useActivities = (params: GetActivitiesParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["activities", user?.id, params],
    queryFn: () => getActivities(user!.id, params),
    enabled: !!user,
  });
};
