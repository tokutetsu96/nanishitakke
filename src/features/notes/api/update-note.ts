import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type UpdateNoteData = {
  id: string;
  user_id: string;
  title?: string;
  content?: string;
};

export const updateNote = async (data: UpdateNoteData) => {
  const { id, user_id, ...updateData } = data;
  const { error } = await supabase
    .from("notes")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user_id);

  if (error) {
    throw error;
  }
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: updateNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["note", user?.id] });
    },
  });
};
