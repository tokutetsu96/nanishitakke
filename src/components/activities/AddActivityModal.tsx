import { useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { prisma } from "@/lib/prisma";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
}

const AddActivityModal = ({
  isOpen,
  onClose,
  onActivityAdded,
}: AddActivityModalProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // New state for date
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !content || !startTime || !date) {
      // Add date to validation
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
      await prisma.activities.create({
        data: {
          user_id: user.id,
          date: date,
          start_time: startTime,
          end_time: endTime || null,
          content: content,
        },
      });

      toast({
        title: "成功",
        description: "新しい活動を記録しました。",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onActivityAdded();
      onClose();
      // Reset form
      setDate(new Date().toISOString().slice(0, 10)); // Reset date to today
      setStartTime("");
      setEndTime("");
      setContent("");
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>新しい活動を記録</ModalHeader>
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
            記録する
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddActivityModal;
