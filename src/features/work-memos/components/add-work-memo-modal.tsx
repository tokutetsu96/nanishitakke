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
import { useCreateWorkMemo } from "@/features/work-memos/api/create-work-memo";
import { useUpdateWorkMemo } from "@/features/work-memos/api/update-work-memo";

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
  const [goodText, setGoodText] = useState("");
  const [stuckText, setStuckText] = useState("");
  const [causeText, setCauseText] = useState("");
  const [improvementText, setImprovementText] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialMemo) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDate(initialMemo.date);
        setDoneText(initialMemo.done_text);
        setGoodText(initialMemo.good_text || "");
        setStuckText(initialMemo.stuck_text || "");
        setCauseText(initialMemo.cause_text || "");
        setImprovementText(initialMemo.improvement_text || "");
      } else {
        setDate(new Date().toISOString().slice(0, 10));
        setDoneText("");
        setGoodText("");
        setStuckText("");
        setCauseText("");
        setImprovementText("");
      }
    }
  }, [isOpen, initialMemo]);

  // Mutations
  const createMutation = useCreateWorkMemo();
  const updateMutation = useUpdateWorkMemo();

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

    const isSubmitting =
      createMutation.status === "pending" ||
      updateMutation.status === "pending";
    if (isSubmitting) return;

    try {
      // Duplicate check (Keeping manual for now as it's validation)
      if (!initialMemo || initialMemo.date !== date) {
        const { data } = await supabase
          .from("work_memos")
          .select("id")
          .eq("user_id", user.id)
          .eq("date", date)
          .maybeSingle();

        if (data) {
          toast({
            title: "エラー",
            description: "この日付のメモは既に存在します。",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
      }

      const memoData = {
        user_id: user.id,
        date: date,
        done_text: doneText,
        good_text: goodText || null,
        stuck_text: stuckText || null,
        cause_text: causeText || null,
        improvement_text: improvementText || null,
      };

      if (initialMemo) {
        await updateMutation.mutateAsync({ ...memoData, id: initialMemo.id });
        toast({
          title: "成功",
          description: "メモを更新しました。",
          status: "success",
        });
      } else {
        await createMutation.mutateAsync(memoData);
        toast({
          title: "成功",
          description: "メモを記録しました。",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      if (onMemoAdded) onMemoAdded();
      onClose();

      if (!initialMemo) {
        setDoneText("");
        setGoodText("");
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
              <FormLabel>良かったこと</FormLabel>
              <Textarea
                value={goodText}
                onChange={(e) => setGoodText(e.target.value)}
                placeholder="今日あった良かったこと"
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
            isLoading={
              createMutation.status === "pending" ||
              updateMutation.status === "pending"
            }
          >
            {initialMemo ? "更新する" : "記録する"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
