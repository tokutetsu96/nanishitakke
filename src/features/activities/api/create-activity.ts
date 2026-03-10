import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { computeEndDate } from "../utils";

type CreateActivityData = {
  user_id: string;
  date: string;
  start_time: string;
  end_time?: string | null;
  content: string;
  tags?: string[] | null;
};

export const createActivity = async (data: CreateActivityData) => {
  const end_date = computeEndDate(data.date, data.start_time, data.end_time);
  const { error } = await supabase.from("activities").insert({ ...data, end_date });

  if (error) {
    throw error;
  }
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", user?.id] });
    },
  });
};
