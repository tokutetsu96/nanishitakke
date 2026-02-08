import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ActivityTemplate } from "@/features/activity-templates/types";

type CreateActivityTemplateDto = Omit<ActivityTemplate, "id" | "created_at">;

const createActivityTemplate = async (template: CreateActivityTemplateDto) => {
  const { data, error } = await supabase
    .from("activity_templates")
    .insert(template)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useCreateActivityTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivityTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity_templates"] });
    },
  });
};
