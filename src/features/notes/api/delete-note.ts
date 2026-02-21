import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const deleteNote = async (data: { id: string; user_id: string }) => {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", data.id)
    .eq("user_id", data.user_id);

  if (error) {
    throw error;
  }
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
    },
  });
};
