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
    // 日付跨ぎ対応: 選択日に開始または終了する活動を取得
    // date <= 選択日 かつ end_date >= 選択日
    query = query
      .lte("date", params.date)
      .gte("end_date", params.date)
      .order("start_time", { ascending: true });
  } else if (params.startDate && params.endDate) {
    // 月表示用: 開始日が範囲内、または終了日が範囲内の活動を取得
    query = query
      .lte("date", params.endDate)
      .gte("end_date", params.startDate);
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
