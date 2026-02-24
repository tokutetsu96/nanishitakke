import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useDisclosure } from "@/hooks/use-disclosure";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import { useAuth } from "@/lib/auth";
import { useActivityTemplates } from "@/features/activity-templates/api/get-activity-templates";
import { useCreateActivityTemplate } from "@/features/activity-templates/api/create-activity-template";
import { useDeleteActivityTemplate } from "@/features/activity-templates/api/delete-activity-template";

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateManagerModal = ({
  isOpen,
  onClose,
}: TemplateManagerModalProps) => {
  const { user } = useAuth();
  const [templateName, setTemplateName] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: templates = [] } = useActivityTemplates();
  const createMutation = useCreateActivityTemplate();
  const deleteMutation = useDeleteActivityTemplate();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    if (selectedCategory) {
      setTags([selectedCategory]);
    } else {
      setTags([]);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user || !content || !templateName) {
      toast.error("テンプレート名と内容は必須です。");
      return;
    }

    try {
      await createMutation.mutateAsync({
        user_id: user.id,
        template_name: templateName,
        content: content,
        tags: tags,
      });
      toast.success("テンプレートを保存しました。");
      setTemplateName("");
      setContent("");
      setTags([]);
    } catch (error) {
      toast.error(`保存に失敗しました: ${(error as Error).message}`);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteMutation.mutateAsync(deleteTargetId);
      toast.success("テンプレートを削除しました。");
    } catch (error) {
      toast.error(`削除に失敗しました: ${(error as Error).message}`);
    } finally {
      setDeleteTargetId(null);
      onDeleteClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>テンプレート管理</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            {/* 新規テンプレート作成セクション */}
            <div>
              <p className="font-bold mb-3">新規テンプレート作成</p>
              <div className="flex flex-col gap-3">
                <div>
                  <Label>
                    テンプレート名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="例: 朝のルーティン"
                  />
                </div>
                <div>
                  <Label>
                    内容 <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="活動の内容を入力"
                  />
                </div>
                <div>
                  <Label>タグ</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={tags[0] || ""}
                    onChange={handleCategoryChange}
                  >
                    <option value="">カテゴリを選択</option>
                    {Object.keys(ACTIVITY_CATEGORIES).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleSaveTemplate}
                  isLoading={createMutation.status === "pending"}
                  className="w-full"
                >
                  テンプレートを保存
                </Button>
              </div>
            </div>

            {/* 既存テンプレート一覧セクション */}
            <div>
              <p className="font-bold mb-3">
                保存済みテンプレート ({templates.length}件)
              </p>
              {templates.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  テンプレートがありません
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                  {templates.map((template) => (
                    <Card key={template.id} className="shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {template.template_name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {template.content}
                            </p>
                            {template.tags && template.tags.length > 0 && (
                              <div className="flex items-center mt-1 gap-1">
                                {template.tags.map((tag) => (
                                  <Badge key={tag} variant="pink">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="削除"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => !open && onDeleteClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>テンプレートを削除</AlertDialogTitle>
            <AlertDialogDescription>
              このテンプレートを削除してもよろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onDeleteClose}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.status === "pending" ? "削除中..." : "削除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
