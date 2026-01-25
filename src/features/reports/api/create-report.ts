import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export type CreateReportData = {
  user_id: string;
  start_date: string;
  end_date: string;
  content: string;
};

export const createReport = async (data: CreateReportData) => {
  const { error } = await supabase.from("weekly_reports").insert(data);

  if (error) {
    throw error;
  }
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", user?.id] });
    },
  });
};
