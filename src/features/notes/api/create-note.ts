import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Note } from "../types";

type CreateNoteData = {
  user_id: string;
  folder_id: string;
  title: string;
  content?: string;
};

export const createNote = async (data: CreateNoteData): Promise<Note> => {
  const { data: note, error } = await supabase
    .from("notes")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return note;
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
    },
  });
};
