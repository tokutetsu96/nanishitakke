import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { ActivityTemplate } from "@/features/activity-templates/types";

const fetchActivityTemplates = async (userId: string): Promise<ActivityTemplate[]> => {
  const { data, error } = await supabase
    .from("activity_templates")
    .select("*")
    .eq("user_id", userId)
    .order("template_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const useActivityTemplates = () => {
  const { user } = useAuth();

  return useQuery<ActivityTemplate[], Error>({
    queryKey: ["activity_templates", user?.id],
    queryFn: () => fetchActivityTemplates(user!.id),
    enabled: !!user,
  });
};
