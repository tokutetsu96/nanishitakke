import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Note } from "../types";

export const getNotes = async (
  userId: string,
  folderId: string
): Promise<Note[]> => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .eq("folder_id", folderId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const getNote = async (
  userId: string,
  noteId: string
): Promise<Note | null> => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .eq("id", noteId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const useNotes = (folderId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notes", user?.id, folderId],
    queryFn: () => getNotes(user!.id, folderId!),
    enabled: !!user && !!folderId,
  });
};

export const useNote = (noteId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["note", user?.id, noteId],
    queryFn: () => getNote(user!.id, noteId!),
    enabled: !!user && !!noteId,
  });
};
