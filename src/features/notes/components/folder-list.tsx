import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { FiMoreVertical, FiFolder } from "react-icons/fi";
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
import { useFolders } from "../api/get-folders";
import { useDeleteFolder } from "../api/delete-folder";
import { CreateFolderModal } from "./create-folder-modal";
import type { NoteFolder } from "../types";

interface FolderListProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
}

export const FolderList = ({
  selectedFolderId,
  onSelectFolder,
}: FolderListProps) => {
  const { user } = useAuth();
  const { data: folders, isLoading } = useFolders();
  const deleteMutation = useDeleteFolder();

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

  const [editingFolder, setEditingFolder] = useState<NoteFolder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<NoteFolder | null>(null);

  const handleEdit = (folder: NoteFolder) => {
    setEditingFolder(folder);
    onCreateOpen();
  };

  const handleDeleteClick = (folder: NoteFolder) => {
    setDeletingFolder(folder);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!user || !deletingFolder) return;

    try {
      await deleteMutation.mutateAsync({
        id: deletingFolder.id,
        user_id: user.id,
      });
      toast.success("成功: フォルダを削除しました。");
      if (selectedFolderId === deletingFolder.id) {
        onSelectFolder("");
      }
    } catch (err: unknown) {
      toast.error(`エラー: 削除に失敗しました: ${(err as Error).message}`);
    } finally {
      onDeleteClose();
      setDeletingFolder(null);
    }
  };

  const handleCreateClose = () => {
    setEditingFolder(null);
    onCreateClose();
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
            フォルダ
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="新規フォルダ"
            onClick={onCreateOpen}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex flex-col overflow-y-auto flex-1">
          {folders?.map((folder) => (
            <div
              key={folder.id}
              className={`flex items-center px-3 py-2 cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-50/10 group ${
                selectedFolderId === folder.id
                  ? "bg-pink-50 text-pink-600 dark:bg-pink-50/10 dark:text-pink-400"
                  : "bg-transparent"
              }`}
              onClick={() => onSelectFolder(folder.id)}
            >
              <FiFolder className="mr-2 shrink-0" />
              <span className="text-sm line-clamp-1 flex-1">
                {folder.name}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    aria-label="フォルダメニュー"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <FiMoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(folder); }}>
                    名前を変更
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(folder); }}
                  >
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {folders?.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">
                フォルダがありません
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={onCreateOpen}
              >
                フォルダを作成
              </Button>
            </div>
          )}
        </div>
      </div>

      <CreateFolderModal
        isOpen={isCreateOpen}
        onClose={handleCreateClose}
        editingFolder={editingFolder}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={(open) => { if (!open) onDeleteClose(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>フォルダを削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{deletingFolder?.name}」を削除しますか？フォルダ内のすべてのノートも削除されます。
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
