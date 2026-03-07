import React, { useState } from "react";
import { Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { WorkMemo } from "@/features/work-memos/types";
import { CuteBox } from "@/components/ui/cute-box";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { useWorkMemos } from "@/features/work-memos/api/get-work-memos";
import { useDeleteWorkMemo } from "@/features/work-memos/api/delete-work-memo";
import { useDisclosure } from "@/hooks/use-disclosure";
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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface WorkMemoListProps {
  onEditMemo: (memo: WorkMemo) => void;
  startDate?: string;
  endDate?: string;
}

export const WorkMemoList = React.memo(({ onEditMemo, startDate, endDate }: WorkMemoListProps) => {
  // Data Fetching
  const {
    data: memos = [],
    isLoading: loading,
    error: queryError,
  } = useWorkMemos({ startDate, endDate });

  // Mutation
  const deleteMutation = useDeleteWorkMemo();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [memoIdToDelete, setMemoIdToDelete] = useState<string | null>(null);

  const handleClickDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMemoIdToDelete(id);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!memoIdToDelete) return;

    try {
      await deleteMutation.mutateAsync(memoIdToDelete);
      toast.success("メモを削除しました。");
    } catch (err: unknown) {
      let errorMessage = "メモの削除に失敗しました。";
      if (err instanceof Error) {
        errorMessage = `メモの削除に失敗しました: ${err.message}`;
      }
      toast.error(errorMessage);
    } finally {
      onClose();
      setMemoIdToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
      </div>
    );
  }

  if (queryError) {
    const errorMessage =
      queryError instanceof Error ? queryError.message : String(queryError);
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        Error: {errorMessage}
      </div>
    );
  }

  if (memos.length === 0) {
    return (
      <p className="text-gray-500 text-center p-10">
        記録された仕事メモはありません。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {memos.map((memo) => (
        <CuteBox key={memo.id} className="p-4 bg-white rounded-xl">
          <div className="mb-2 flex justify-between items-center">
            <p className="font-bold text-lg text-pink-500">
              {format(new Date(memo.date), "yyyy年MM月dd日 (eee)", {
                locale: ja,
              })}
            </p>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-2"
                aria-label="Edit"
                onClick={() => onEditMemo(memo)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                aria-label="Delete"
                onClick={(e) => handleClickDelete(e, memo.id)}
                isLoading={
                  deleteMutation.status === "pending" &&
                  memoIdToDelete === memo.id
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value={`memo-${memo.id}`} className="border-none">
              <AccordionTrigger className="px-0 hover:no-underline">
                <span className="font-bold">記録詳細</span>
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="font-bold text-sm text-gray-600">
                      やったこと
                    </p>
                    <p className="whitespace-pre-wrap">{memo.done_text}</p>
                  </div>
                  {memo.good_text && (
                    <div>
                      <p className="font-bold text-sm text-gray-600">
                        良かったこと
                      </p>
                      <p className="whitespace-pre-wrap">{memo.good_text}</p>
                    </div>
                  )}
                  {memo.stuck_text && (
                    <div>
                      <p className="font-bold text-sm text-gray-600">
                        詰まったこと
                      </p>
                      <p className="whitespace-pre-wrap">{memo.stuck_text}</p>
                    </div>
                  )}
                  {memo.cause_text && (
                    <div>
                      <p className="font-bold text-sm text-gray-600">
                        原因
                      </p>
                      <p className="whitespace-pre-wrap">{memo.cause_text}</p>
                    </div>
                  )}
                  {memo.improvement_text && (
                    <div>
                      <p className="font-bold text-sm text-gray-600">
                        改善案
                      </p>
                      <p className="whitespace-pre-wrap">{memo.improvement_text}</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CuteBox>
      ))}

      <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>メモを削除</AlertDialogTitle>
            <AlertDialogDescription>
              このメモを本当に削除しますか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={deleteMutation.status === "pending"}
            >
              {deleteMutation.status === "pending" ? (
                <>
                  <Loader2 className="animate-spin" />
                  削除
                </>
              ) : (
                "削除"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
