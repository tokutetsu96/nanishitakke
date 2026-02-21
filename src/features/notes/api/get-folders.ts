import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { NoteFolder } from "../types";

export const getNoteFolders = async (
  userId: string
): Promise<NoteFolder[]> => {
  const { data, error } = await supabase
    .from("note_folders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

export const useFolders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["noteFolders", user?.id],
    queryFn: () => getNoteFolders(user!.id),
    enabled: !!user,
  });
};
