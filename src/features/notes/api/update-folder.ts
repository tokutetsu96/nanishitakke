import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type UpdateFolderData = {
  id: string;
  user_id: string;
  name: string;
};

export const updateFolder = async (data: UpdateFolderData) => {
  const { id, ...updateData } = data;
  const { error } = await supabase
    .from("note_folders")
    .update({ name: updateData.name, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", updateData.user_id);

  if (error) {
    throw error;
  }
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: updateFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["noteFolders", user?.id] });
    },
  });
};
