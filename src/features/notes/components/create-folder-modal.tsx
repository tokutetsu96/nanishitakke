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
import { useCreateFolder } from "../api/create-folder";
import { useUpdateFolder } from "../api/update-folder";
import type { NoteFolder } from "../types";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingFolder?: NoteFolder | null;
}

export const CreateFolderModal = ({
  isOpen,
  onClose,
  editingFolder,
}: CreateFolderModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");

  const createMutation = useCreateFolder();
  const updateMutation = useUpdateFolder();

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(editingFolder?.name || "");
    }
  }, [isOpen, editingFolder]);

  const handleSubmit = async () => {
    if (!user || !name.trim()) {
      toast.error("入力エラー: フォルダ名を入力してください。");
      return;
    }

    try {
      if (editingFolder) {
        await updateMutation.mutateAsync({
          id: editingFolder.id,
          user_id: user.id,
          name: name.trim(),
        });
        toast.success("成功: フォルダ名を更新しました。");
      } else {
        await createMutation.mutateAsync({
          user_id: user.id,
          name: name.trim(),
        });
        toast.success("成功: フォルダを作成しました。");
      }
      onClose();
    } catch (err: unknown) {
      toast.error(`エラー: 操作に失敗しました: ${(err as Error).message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingFolder ? "フォルダ名を変更" : "新しいフォルダ"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">
              フォルダ名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="フォルダ名を入力"
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
            disabled={
              createMutation.status === "pending" ||
              updateMutation.status === "pending"
            }
          >
            {(createMutation.status === "pending" ||
              updateMutation.status === "pending") ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            {editingFolder ? "更新する" : "作成する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
