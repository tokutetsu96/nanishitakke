import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const deleteFolder = async (data: { id: string; user_id: string }) => {
  // フォルダ内のノートを先に削除
  const { error: notesError } = await supabase
    .from("notes")
    .delete()
    .eq("folder_id", data.id)
    .eq("user_id", data.user_id);

  if (notesError) {
    throw notesError;
  }

  // フォルダを削除
  const { error } = await supabase
    .from("note_folders")
    .delete()
    .eq("id", data.id)
    .eq("user_id", data.user_id);

  if (error) {
    throw error;
  }
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["noteFolders", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
    },
  });
};
