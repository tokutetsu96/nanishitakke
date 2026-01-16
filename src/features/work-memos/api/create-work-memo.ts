import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type CreateWorkMemoData = {
  user_id: string;
  date: string;
  done_text: string;
  stuck_text?: string | null;
  cause_text?: string | null;
  improvement_text?: string | null;
};

export const createWorkMemo = async (data: CreateWorkMemoData) => {
  const { error } = await supabase.from("work_memos").insert(data);

  if (error) {
    throw error;
  }
};

export const useCreateWorkMemo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createWorkMemo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-memos", user?.id] });
    },
  });
};
