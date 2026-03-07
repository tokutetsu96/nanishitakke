import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MDEditor from "@uiw/react-md-editor";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth";
import { useNote } from "../api/get-notes";
import { useUpdateNote } from "../api/update-note";

interface NoteEditorProps {
  noteId: string;
  onBack?: () => void;
}

export const NoteEditor = ({ noteId, onBack }: NoteEditorProps) => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const { data: note, isLoading } = useNote(noteId);
  const updateMutation = useUpdateNote();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (note && initializedRef.current !== note.id) {
      setTitle(note.title);
      setContent(note.content);
      initializedRef.current = note.id;
    }
  }, [note]);

  const save = useCallback(
    (newTitle: string, newContent: string) => {
      if (!user || !noteId) return;

      setIsSaving(true);
      updateMutation.mutate(
        {
          id: noteId,
          user_id: user.id,
          title: newTitle,
          content: newContent,
        },
        {
          onSettled: () => {
            setIsSaving(false);
          },
        }
      );
    },
    [user, noteId, updateMutation]
  );

  const debouncedSave = useCallback(
    (newTitle: string, newContent: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        save(newTitle, newContent);
      }, 500);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave(newTitle, content);
  };

  const handleContentChange = (value?: string) => {
    const newContent = value ?? "";
    setContent(newContent);
    debouncedSave(title, newContent);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500 dark:text-gray-400">ノートが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-3 border-b gap-2">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            aria-label="一覧に戻る"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="タイトル"
          className="border-0 shadow-none focus-visible:ring-0 font-bold text-lg flex-1"
        />
        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
          {isSaving ? "保存中..." : "保存済み"}
        </span>
      </div>

      <div className="flex-1 overflow-auto" data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}>
        <MDEditor
          value={content}
          onChange={handleContentChange}
          height="100%"
          preview="live"
          visibleDragbar={false}
        />
      </div>
    </div>
  );
};
