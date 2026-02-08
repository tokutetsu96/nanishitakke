import { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Select,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import { useAuth } from "@/lib/auth";
import type { Activity } from "@/features/activities/types";
import DatePicker, { registerLocale } from "react-datepicker";
import { ja } from "date-fns/locale/ja";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import "./add-activity-modal.css"; // We might need some css, but dashboard uses global? dashboard.tsx imports ./activities.scss. I'll assume global or default styles for now. Or just inline.
// dashboard.tsx imported activities.scss. I won't import css file if it doesn't exist.
// dashboard.tsx imported "react-datepicker/dist/react-datepicker.css"; -> I included this.

import { useCreateActivity } from "@/features/activities/api/create-activity";
import { useUpdateActivity } from "@/features/activities/api/update-activity";
import { useActivityTemplates } from "@/features/activity-templates/api/get-activity-templates";
import { useCreateActivityTemplate } from "@/features/activity-templates/api/create-activity-template";

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
  const toast = useToast();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [templateName, setTemplateName] = useState("");

  const { data: templates = [] } = useActivityTemplates();
  const createTemplateMutation = useCreateActivityTemplate();

  const {
    isOpen: isTemplateOpen,
    onOpen: onTemplateOpen,
    onClose: onTemplateClose,
  } = useDisclosure();
  const cancelRef = useRef(null);

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
      toast({
        title: "入力エラー",
        description: "日付、開始時刻、内容は必須です。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const isSubmitting =
      createMutation.status === "pending" ||
      updateMutation.status === "pending";
    if (isSubmitting) return;

    try {
      if (initialActivity) {
        // Update existing activity
        await updateMutation.mutateAsync({
          id: initialActivity.id,
          user_id: user.id,
          date: date,
          start_time: startTime,
          end_time: endTime || null,
          content: content,
          tags: tags,
        });

        toast({
          title: "成功",
          description: "活動を更新しました。",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Insert new activity
        await createMutation.mutateAsync({
          user_id: user.id,
          date: date,
          start_time: startTime,
          end_time: endTime || null,
          content: content,
          tags: tags,
        });

        toast({
          title: "成功",
          description: "新しい活動を記録しました。",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
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
      toast({
        title: "エラー",
        description: `記録に失敗しました: ${(err as Error).message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
    const selectedTemplate = templates.find(
      (t) => t.id === selectedTemplateId
    );
    if (selectedTemplate) {
      setContent(selectedTemplate.content);
      setTags(selectedTemplate.tags || []);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user || !content || !templateName) {
      toast({
        title: "入力エラー",
        description: "テンプレート名と内容は必須です。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await createTemplateMutation.mutateAsync({
        user_id: user.id,
        template_name: templateName,
        content: content,
        tags: tags,
      });
      toast({
        title: "成功",
        description: "テンプレートを保存しました。",
        status: "success",
      });
      onTemplateClose();
      setTemplateName("");
    } catch (error) {
      toast({
        title: "エラー",
        description: `保存に失敗しました: ${(error as Error).message}`,
        status: "error",
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {initialActivity ? "活動を編集" : "新しい活動を記録"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack gap={4}>
              <FormControl>
                <FormLabel>テンプレートから読み込む</FormLabel>
                <Select
                  placeholder="テンプレートを選択"
                  onChange={handleTemplateChange}
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.template_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>日付</FormLabel>
                <DatePicker
                  selected={
                    date
                      ? new Date(
                          parseInt(date.split("-")[0]),
                          parseInt(date.split("-")[1]) - 1,
                          parseInt(date.split("-")[2])
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
              </FormControl>
              <FormControl isRequired>
                <FormLabel>開始時刻</FormLabel>
                <Input
                  type="time"
                  step="300"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>終了時刻</FormLabel>
                <Input
                  type="time"
                  step="300"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>内容</FormLabel>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="何をした？"
                />
              </FormControl>
              <FormControl>
                <FormLabel>タグ</FormLabel>
                <Select
                  placeholder="カテゴリを選択"
                  value={tags[0] || ""}
                  onChange={handleCategoryChange}
                >
                  {Object.keys(ACTIVITY_CATEGORIES).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onTemplateOpen} mr="auto">
              この内容をテンプレートとして保存
            </Button>
            <Button variant="ghost" mr={3} onClick={onClose}>
              キャンセル
            </Button>
            <Button
              colorScheme="pink"
              onClick={handleSubmit}
              isLoading={
                createMutation.status === "pending" ||
                updateMutation.status === "pending"
              }
            >
              {initialActivity ? "更新する" : "記録する"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isTemplateOpen}
        leastDestructiveRef={cancelRef}
        onClose={onTemplateClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              テンプレートとして保存
            </AlertDialogHeader>

            <AlertDialogBody>
              <Input
                placeholder="テンプレート名を入力"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onTemplateClose}>
                キャンセル
              </Button>
              <Button
                colorScheme="pink"
                onClick={handleSaveTemplate}
                ml={3}
                isLoading={createTemplateMutation.status === "pending"}
              >
                保存
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
