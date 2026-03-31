import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useDeleteActivity } from "@/features/activities/api/delete-activity";

export const useDeleteActivityDialog = () => {
  const deleteMutation = useDeleteActivity();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activityIdToDelete, setActivityIdToDelete] = useState<string | null>(
    null,
  );

  const handleClickDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActivityIdToDelete(id);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!activityIdToDelete) return;

    try {
      await deleteMutation.mutateAsync(activityIdToDelete);
      toast.success("活動を削除しました。");
    } catch (err: unknown) {
      let errorMessage = "活動の削除に失敗しました。";
      if (err instanceof Error) {
        errorMessage = `活動の削除に失敗しました: ${err.message}`;
      }
      toast.error(errorMessage);
    } finally {
      onClose();
      setActivityIdToDelete(null);
    }
  };

  return {
    deleteMutation,
    activityIdToDelete,
    handleClickDelete,
    confirmDelete,
    isOpen,
    onClose,
  };
};

export const DeleteActivityDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) => (
  <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>活動を削除</AlertDialogTitle>
        <AlertDialogDescription>
          この活動を本当に削除しますか？この操作は取り消せません。
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>キャンセル</AlertDialogCancel>
        <AlertDialogAction
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          削除
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
