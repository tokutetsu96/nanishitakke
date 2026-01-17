import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type UpdateActivityData = {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time?: string | null;
  content: string;
  tags?: string[] | null;
};

export const updateActivity = async (data: UpdateActivityData) => {
  const { id, ...updateData } = data;
  const { error } = await supabase
    .from("activities")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", updateData.user_id);

  if (error) {
    throw error;
  }
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: updateActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", user?.id] });
    },
  });
};
