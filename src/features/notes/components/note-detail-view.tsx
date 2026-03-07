import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import MDEditor from "@uiw/react-md-editor";
import { useNote } from "../api/get-notes";
import { useDeleteNote } from "../api/delete-note";

interface NoteDetailViewProps {
  noteId: string;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const NoteDetailView = ({
  noteId,
  onBack,
  onEdit,
  onDelete,
}: NoteDetailViewProps) => {
  const { user } = useAuth();
  const { data: note, isLoading } = useNote(noteId);
  const deleteMutation = useDeleteNote();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = async () => {
    if (!user || !note) return;

    try {
      await deleteMutation.mutateAsync({
        id: note.id,
        user_id: user.id,
      });
      toast.success("成功: ノートを削除しました。");
      setIsDeleteOpen(false);
      onDelete?.();
    } catch (err: unknown) {
      toast.error(`エラー: 削除に失敗しました: ${(err as Error).message}`);
    }
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
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4 mr-1" />
              編集
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              削除
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4" data-color-mode="light">
        <MDEditor.Markdown source={note.content} />
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ノートを削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{note.title || "無題"}」を削除しますか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.status === "pending"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.status === "pending" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
