import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const deleteWorkMemo = async (id: string) => {
  const { error } = await supabase.from("work_memos").delete().eq("id", id);

  if (error) {
    throw error;
  }
};

export const useDeleteWorkMemo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: deleteWorkMemo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-memos", user?.id] });
    },
  });
};
