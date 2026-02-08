export interface WorkMemo {
  id: string;
  user_id: string;
  date: string;
  done_text: string;
  good_text?: string;
  stuck_text?: string;
  cause_text?: string;
  improvement_text?: string;
  created_at: string;
}
