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
} from "@chakra-ui/react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { WorkMemo } from "@/features/work-memos/types";
import DatePicker, { registerLocale } from "react-datepicker";
import { ja } from "date-fns/locale/ja";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

registerLocale("ja", ja);

interface AddWorkMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoAdded: () => void;
  initialMemo?: WorkMemo | null;
}

export const AddWorkMemoModal = ({
  isOpen,
  onClose,
  onMemoAdded,
  initialMemo,
}: AddWorkMemoModalProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [doneText, setDoneText] = useState("");
  const [stuckText, setStuckText] = useState("");
  const [causeText, setCauseText] = useState("");
  const [improvementText, setImprovementText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialMemo) {
        setDate(initialMemo.date);
        setDoneText(initialMemo.done_text);
        setStuckText(initialMemo.stuck_text || "");
        setCauseText(initialMemo.cause_text || "");
        setImprovementText(initialMemo.improvement_text || "");
      } else {
        setDate(new Date().toISOString().slice(0, 10));
        setDoneText("");
        setStuckText("");
        setCauseText("");
        setImprovementText("");
      }
    }
  }, [isOpen, initialMemo]);

  const checkDuplicateDate = async (checkDate: string) => {
    if (!user) return false;

    // If editing and date hasn't changed, no need to check (or check excluding self)
    if (initialMemo && initialMemo.date === checkDate) return false;

    const { data, error } = await supabase
      .from("work_memos")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", checkDate)
      .maybeSingle();

    if (error) {
      console.error("Duplicate check error:", error);
      return false; // Fail open but db will catch it
    }

    return !!data;
  };

  const handleSubmit = async () => {
    if (!user || !doneText || !date) {
      toast({
        title: "入力エラー",
        description: "日付とやったことは必須です。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const isDuplicate = await checkDuplicateDate(date);
      if (isDuplicate) {
        toast({
          title: "エラー",
          description: "この日付のメモは既に存在します。",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      const memoData = {
        user_id: user.id,
        date: date,
        done_text: doneText,
        stuck_text: stuckText || null,
        cause_text: causeText || null,
        improvement_text: improvementText || null,
      };

      if (initialMemo) {
        // Update existing memo
        const { error } = await supabase
          .from("work_memos")
          .update(memoData)
          .eq("id", initialMemo.id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "成功",
          description: "メモを更新しました。",
          status: "success",
        });
      } else {
        // Insert new memo
        const { error } = await supabase.from("work_memos").insert(memoData);

        if (error) throw error;

        toast({
          title: "成功",
          description: "メモを記録しました。",
          status: "success",
        });
      }

      onMemoAdded();
      onClose();

      if (!initialMemo) {
        setDoneText("");
        setStuckText("");
        setCauseText("");
        setImprovementText("");
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {initialMemo ? "メモを編集" : "仕事メモを作成"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
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
              <FormLabel>やったこと</FormLabel>
              <Textarea
                value={doneText}
                onChange={(e) => setDoneText(e.target.value)}
                placeholder="今日やったことを記入してください"
                minH="100px"
              />
            </FormControl>
            <FormControl>
              <FormLabel>詰まったこと</FormLabel>
              <Textarea
                value={stuckText}
                onChange={(e) => setStuckText(e.target.value)}
                placeholder="作業中に詰まったことや問題点"
              />
            </FormControl>
            <FormControl>
              <FormLabel>原因</FormLabel>
              <Textarea
                value={causeText}
                onChange={(e) => setCauseText(e.target.value)}
                placeholder="詰まった原因"
              />
            </FormControl>
            <FormControl>
              <FormLabel>原因の改善案</FormLabel>
              <Textarea
                value={improvementText}
                onChange={(e) => setImprovementText(e.target.value)}
                placeholder="次回どうすれば改善できるか"
              />
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
            {initialMemo ? "更新する" : "記録する"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
