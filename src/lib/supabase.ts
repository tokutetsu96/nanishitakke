import { createClient } from '@supabase/supabase-js';

// SupabaseのプロジェクトURLとanonキーを環境変数から取得
// .env.local ファイルなどに実際の値を設定してください
// 例:
// VITE_SUPABASE_URL=YOUR_SUPABASE_URL
// VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are not defined. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
