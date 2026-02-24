import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import { useAuth } from "@/lib/auth";
import type { Activity } from "@/features/activities/types";
import DatePicker, { registerLocale } from "react-datepicker";
import { ja } from "date-fns/locale/ja";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

import { useCreateActivity } from "@/features/activities/api/create-activity";
import { useUpdateActivity } from "@/features/activities/api/update-activity";
import { useActivityTemplates } from "@/features/activity-templates/api/get-activity-templates";

registerLocale("ja", ja);

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
  initialActivity?: Activity | null;
}

export const AddActivityModal = ({
  isOpen,
  onClose,
  onActivityAdded,
  initialActivity,
}: AddActivityModalProps) => {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const { data: templates = [] } = useActivityTemplates();

  useEffect(() => {
    if (isOpen) {
      if (initialActivity) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDate(initialActivity.date);
        setStartTime(initialActivity.start_time);
        setEndTime(initialActivity.end_time || "");
        setContent(initialActivity.content);
        setTags(initialActivity.tags || []);
      } else {
        setDate(new Date().toISOString().slice(0, 10));
        setStartTime("");
        setEndTime("");
        setContent("");
        setTags([]);
      }
    }
  }, [isOpen, initialActivity]);

  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();

  const handleSubmit = async () => {
    if (!user || !content || !startTime || !date) {
      toast.error("日付、開始時刻、内容は必須です。");
      return;
    }

    const isSubmitting =
      createMutation.status === "pending" ||
      updateMutation.status === "pending";
    if (isSubmitting) return;

    try {
      if (initialActivity) {
        await updateMutation.mutateAsync({
          id: initialActivity.id,
          user_id: user.id,
          date: date,
          start_time: startTime,
          end_time: endTime || null,
          content: content,
          tags: tags,
        });

        toast.success("活動を更新しました。");
      } else {
        await createMutation.mutateAsync({
          user_id: user.id,
          date: date,
          start_time: startTime,
          end_time: endTime || null,
          content: content,
          tags: tags,
        });

        toast.success("新しい活動を記録しました。");
      }

      onActivityAdded();
      onClose();

      if (!initialActivity) {
        setDate(new Date().toISOString().slice(0, 10));
        setStartTime("");
        setEndTime("");
        setContent("");
      }
    } catch (err: unknown) {
      toast.error(`記録に失敗しました: ${(err as Error).message}`);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    if (selectedCategory) {
      setTags([selectedCategory]);
    } else {
      setTags([]);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTemplateId = e.target.value;
    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    if (selectedTemplate) {
      setContent(selectedTemplate.content);
      setTags(selectedTemplate.tags || []);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialActivity ? "活動を編集" : "新しい活動を記録"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label>テンプレートから読み込む</Label>
            <select
              className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-0"
              onChange={handleTemplateChange}
              defaultValue=""
            >
              <option value="">テンプレートを選択</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.template_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>
              日付 <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              selected={
                date
                  ? new Date(
                      parseInt(date.split("-")[0]),
                      parseInt(date.split("-")[1]) - 1,
                      parseInt(date.split("-")[2]),
                    )
                  : null
              }
              onChange={(d: Date | null) => {
                if (d) {
                  setDate(format(d, "yyyy-MM-dd"));
                }
              }}
              locale="ja"
              dateFormat="yyyy/MM/dd(eee)"
              customInput={<Input />}
              wrapperClassName="datepicker-full-width"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                開始時刻 <span className="text-red-500">*</span>
              </Label>
              <Input
                type="time"
                step="300"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>終了時刻</Label>
              <Input
                type="time"
                step="300"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>
              内容 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="何をした？"
            />
          </div>
          <div className="space-y-2">
            <Label>タグ</Label>
            <select
              className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-0"
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
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={
              createMutation.status === "pending" ||
              updateMutation.status === "pending"
            }
          >
            {initialActivity ? "更新する" : "記録する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
