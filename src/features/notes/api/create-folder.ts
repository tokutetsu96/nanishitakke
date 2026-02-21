import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type CreateFolderData = {
  user_id: string;
  name: string;
};

export const createFolder = async (data: CreateFolderData) => {
  const { error } = await supabase.from("note_folders").insert(data);

  if (error) {
    throw error;
  }
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["noteFolders", user?.id] });
    },
  });
};
