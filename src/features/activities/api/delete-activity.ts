import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const deleteActivity = async (id: string) => {
  const { error } = await supabase.from("activities").delete().eq("id", id);

  if (error) {
    throw error;
  }
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", user?.id] });
    },
  });
};
