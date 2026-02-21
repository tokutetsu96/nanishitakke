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
  const toast = useToast();
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
      toast({
        title: "入力エラー",
        description: "フォルダ名を入力してください。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (editingFolder) {
        await updateMutation.mutateAsync({
          id: editingFolder.id,
          user_id: user.id,
          name: name.trim(),
        });
        toast({
          title: "成功",
          description: "フォルダ名を更新しました。",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await createMutation.mutateAsync({
          user_id: user.id,
          name: name.trim(),
        });
        toast({
          title: "成功",
          description: "フォルダを作成しました。",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
    } catch (err: unknown) {
      toast({
        title: "エラー",
        description: `操作に失敗しました: ${(err as Error).message}`,
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
        <ModalHeader>
          {editingFolder ? "フォルダ名を変更" : "新しいフォルダ"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel>フォルダ名</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="フォルダ名を入力"
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
            isLoading={
              createMutation.status === "pending" ||
              updateMutation.status === "pending"
            }
          >
            {editingFolder ? "更新する" : "作成する"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
