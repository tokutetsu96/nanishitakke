export interface Activity {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time?: string;
  content: string;
  created_at: string;
}
