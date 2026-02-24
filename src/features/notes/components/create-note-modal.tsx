import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateNote } from "../api/create-note";
import type { Note } from "../types";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  onNoteCreated?: (note: Note) => void;
}

export const CreateNoteModal = ({
  isOpen,
  onClose,
  folderId,
  onNoteCreated,
}: CreateNoteModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");

  const createMutation = useCreateNote();

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!user || !title.trim()) {
      toast.error("入力エラー: タイトルを入力してください。");
      return;
    }

    try {
      const note = await createMutation.mutateAsync({
        user_id: user.id,
        folder_id: folderId,
        title: title.trim(),
      });
      toast.success("成功: ノートを作成しました。");
      onNoteCreated?.(note);
      onClose();
    } catch (err: unknown) {
      toast.error(`エラー: 作成に失敗しました: ${(err as Error).message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新しいノート</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="note-title">
              タイトル <span className="text-red-500">*</span>
            </Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ノートのタイトルを入力"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.status === "pending"}
          >
            {createMutation.status === "pending" ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            作成する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
