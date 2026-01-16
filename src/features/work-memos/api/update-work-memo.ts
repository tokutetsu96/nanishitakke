import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type UpdateWorkMemoData = {
  id: string;
  user_id: string;
  date: string;
  done_text: string;
  stuck_text?: string | null;
  cause_text?: string | null;
  improvement_text?: string | null;
};

export const updateWorkMemo = async (data: UpdateWorkMemoData) => {
  const { id, ...updateData } = data;
  const { error } = await supabase
    .from("work_memos")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", updateData.user_id);

  if (error) {
    throw error;
  }
};

export const useUpdateWorkMemo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: updateWorkMemo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-memos", user?.id] });
    },
  });
};
