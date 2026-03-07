import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { FiMoreVertical, FiFileText } from "react-icons/fi";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
import { useNotes } from "../api/get-notes";
import { useDeleteNote } from "../api/delete-note";
import { CreateNoteModal } from "./create-note-modal";
import type { Note } from "../types";
import { format } from "date-fns";

interface NoteListProps {
  folderId: string;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onNoteDeleted?: () => void;
}

export const NoteList = ({
  folderId,
  selectedNoteId,
  onSelectNote,
  onNoteDeleted,
}: NoteListProps) => {
  const { user } = useAuth();
  const { data: notes, isLoading } = useNotes(folderId);
  const deleteMutation = useDeleteNote();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  const handleDeleteClick = (note: Note) => {
    setDeletingNote(note);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!user || !deletingNote) return;

    try {
      await deleteMutation.mutateAsync({
        id: deletingNote.id,
        user_id: user.id,
      });
      toast.success("成功: ノートを削除しました。");
      if (selectedNoteId === deletingNote.id) {
        onNoteDeleted?.();
      }
    } catch (err: unknown) {
      toast.error(`エラー: 削除に失敗しました: ${(err as Error).message}`);
    } finally {
      onDeleteClose();
      setDeletingNote(null);
    }
  };

  const handleNoteCreated = (note: Note) => {
    onSelectNote(note.id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-3 border-b">
          <span className="font-bold text-sm">
            ノート
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="新規ノート"
            onClick={onCreateOpen}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex flex-col overflow-y-auto flex-1">
          {notes?.map((note) => (
            <div
              key={note.id}
              className={`flex items-center px-3 py-2 cursor-pointer hover:bg-pink-50 group ${
                selectedNoteId === note.id
                  ? "bg-pink-50 text-pink-600"
                  : "bg-transparent"
              }`}
              onClick={() => onSelectNote(note.id)}
            >
              <FiFileText className="mr-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-1">
                  {note.title || "無題"}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(note.updated_at), "yyyy/MM/dd HH:mm")}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    aria-label="ノートメニュー"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <FiMoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(note); }}
                  >
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {notes?.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">
                ノートがありません
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={onCreateOpen}
              >
                ノートを作成
              </Button>
            </div>
          )}
        </div>
      </div>

      <CreateNoteModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        folderId={folderId}
        onNoteCreated={handleNoteCreated}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={(open) => { if (!open) onDeleteClose(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ノートを削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{deletingNote?.title || "無題"}」を削除しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onDeleteClose}>
              キャンセル
            </AlertDialogCancel>
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
    </>
  );
};
