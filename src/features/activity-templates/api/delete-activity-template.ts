import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const deleteActivityTemplate = async (id: string) => {
  const { error } = await supabase
    .from("activity_templates")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

export const useDeleteActivityTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivityTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity_templates"] });
    },
  });
};
