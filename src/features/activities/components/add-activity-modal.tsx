import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Activity } from "@/features/activities/types";

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialActivity) {
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

    setIsLoading(true);
    try {
      if (initialActivity) {
        // Update existing activity
        const { error } = await supabase
          .from("activities")
          .update({
            date: date,
            start_time: startTime,
            end_time: endTime || null,
            content: content,
            tags: tags,
          })
          .eq("id", initialActivity.id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "成功",
          description: "活動を更新しました。",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Insert new activity
        const { error } = await supabase.from("activities").insert({
          user_id: user.id,
          date: date,
          start_time: startTime,
          end_time: endTime || null,
          content: content,
          tags: tags,
        });

        if (error) throw error;

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
    } finally {
      setIsLoading(false);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {initialActivity ? "活動を編集" : "新しい活動を記録"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <FormControl isRequired>
              <FormLabel>日付</FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
          <Button variant="ghost" mr={3} onClick={onClose}>
            キャンセル
          </Button>
          <Button
            colorScheme="pink"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {initialActivity ? "更新する" : "記録する"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
