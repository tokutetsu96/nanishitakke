import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type CreateActivityData = {
  user_id: string;
  date: string;
  start_time: string;
  end_time?: string | null;
  content: string;
  tags?: string[] | null;
};

export const createActivity = async (data: CreateActivityData) => {
  const { error } = await supabase.from("activities").insert(data);

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
