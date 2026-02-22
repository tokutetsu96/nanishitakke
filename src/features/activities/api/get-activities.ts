import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Activity } from "../types";

type GetActivitiesParams = {
  date?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  tags?: string[];
};

export const getActivities = async (
  userId: string,
  params: GetActivitiesParams
): Promise<Activity[]> => {
  let query = supabase.from("activities").select("*").eq("user_id", userId);

  const isSearchMode = params.keyword || (params.tags && params.tags.length > 0);

  if (isSearchMode) {
    if (params.keyword) {
      query = query.ilike("content", `%${params.keyword}%`);
    }
    if (params.tags && params.tags.length > 0) {
      query = query.overlaps("tags", params.tags);
    }
    query = query.order("date", { ascending: false }).order("start_time", { ascending: true });
  } else if (params.date) {
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

export const useSearchActivities = (params: { keyword?: string; tags?: string[] }) => {
  const { user } = useAuth();
  const hasSearchParams = !!params.keyword || (params.tags && params.tags.length > 0);

  return useQuery({
    queryKey: ["activities", "search", user?.id, params],
    queryFn: () => getActivities(user!.id, params),
    enabled: !!user && !!hasSearchParams,
  });
};
