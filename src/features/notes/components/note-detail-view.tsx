import { ArrowLeft, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MDEditor from "@uiw/react-md-editor";
import { useNote } from "../api/get-notes";

interface NoteDetailViewProps {
  noteId: string;
  onBack?: () => void;
  onEdit?: () => void;
}

export const NoteDetailView = ({
  noteId,
  onBack,
  onEdit,
}: NoteDetailViewProps) => {
  const { data: note, isLoading } = useNote(noteId);

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
        <p className="text-gray-500">ノートが見つかりません</p>
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
        <span className="font-bold text-lg flex-1 line-clamp-1">
          {note.title}
        </span>
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="shrink-0"
          >
            <Pencil className="h-4 w-4 mr-1" />
            編集
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4" data-color-mode="light">
        <MDEditor.Markdown source={note.content} />
      </div>
    </div>
  );
};
