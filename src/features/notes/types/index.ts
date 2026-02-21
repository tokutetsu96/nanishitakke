export interface NoteFolder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  folder_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
