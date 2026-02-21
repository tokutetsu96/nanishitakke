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
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
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
  const toast = useToast();
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
      toast({
        title: "入力エラー",
        description: "タイトルを入力してください。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const note = await createMutation.mutateAsync({
        user_id: user.id,
        folder_id: folderId,
        title: title.trim(),
      });
      toast({
        title: "成功",
        description: "ノートを作成しました。",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onNoteCreated?.(note);
      onClose();
    } catch (err: unknown) {
      toast({
        title: "エラー",
        description: `作成に失敗しました: ${(err as Error).message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>新しいノート</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel>タイトル</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ノートのタイトルを入力"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            キャンセル
          </Button>
          <Button
            colorScheme="pink"
            onClick={handleSubmit}
            isLoading={createMutation.status === "pending"}
          >
            作成する
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
