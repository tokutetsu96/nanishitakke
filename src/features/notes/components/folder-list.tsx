import {
  Box,
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
  useToast,
  VStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Spinner,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiMoreVertical, FiFolder } from "react-icons/fi";
import { useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useFolders } from "../api/get-folders";
import { useDeleteFolder } from "../api/delete-folder";
import { CreateFolderModal } from "./create-folder-modal";
import type { NoteFolder } from "../types";

interface FolderListProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
}

export const FolderList = ({
  selectedFolderId,
  onSelectFolder,
}: FolderListProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const { data: folders, isLoading } = useFolders();
  const deleteMutation = useDeleteFolder();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [editingFolder, setEditingFolder] = useState<NoteFolder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<NoteFolder | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleEdit = (folder: NoteFolder) => {
    setEditingFolder(folder);
    onCreateOpen();
  };

  const handleDeleteClick = (folder: NoteFolder) => {
    setDeletingFolder(folder);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!user || !deletingFolder) return;

    try {
      await deleteMutation.mutateAsync({
        id: deletingFolder.id,
        user_id: user.id,
      });
      toast({
        title: "成功",
        description: "フォルダを削除しました。",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (selectedFolderId === deletingFolder.id) {
        onSelectFolder("");
      }
    } catch (err: unknown) {
      toast({
        title: "エラー",
        description: `削除に失敗しました: ${(err as Error).message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteClose();
      setDeletingFolder(null);
    }
  };

  const handleCreateClose = () => {
    setEditingFolder(null);
    onCreateClose();
  };

  if (isLoading) {
    return (
      <Flex justify="center" py={8}>
        <Spinner />
      </Flex>
    );
  }

  return (
    <>
      <VStack spacing={0} align="stretch" h="full">
        <Flex justify="space-between" align="center" p={3} borderBottomWidth="1px">
          <Text fontWeight="bold" fontSize="sm">
            フォルダ
          </Text>
          <IconButton
            aria-label="新規フォルダ"
            icon={<AddIcon />}
            size="xs"
            variant="ghost"
            onClick={onCreateOpen}
          />
        </Flex>

        <VStack spacing={0} align="stretch" overflowY="auto" flex={1}>
          {folders?.map((folder) => (
            <Flex
              key={folder.id}
              align="center"
              px={3}
              py={2}
              cursor="pointer"
              bg={selectedFolderId === folder.id ? "pink.50" : "transparent"}
              color={selectedFolderId === folder.id ? "pink.600" : undefined}
              _hover={{ bg: "pink.50" }}
              onClick={() => onSelectFolder(folder.id)}
              role="group"
            >
              <Box as={FiFolder} mr={2} flexShrink={0} />
              <Text fontSize="sm" noOfLines={1} flex={1}>
                {folder.name}
              </Text>
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="フォルダメニュー"
                  icon={<FiMoreVertical />}
                  size="xs"
                  variant="ghost"
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  onClick={(e) => e.stopPropagation()}
                />
                <MenuList>
                  <MenuItem onClick={() => handleEdit(folder)}>
                    名前を変更
                  </MenuItem>
                  <MenuItem
                    color="red.500"
                    onClick={() => handleDeleteClick(folder)}
                  >
                    削除
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          ))}

          {folders?.length === 0 && (
            <Box p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">
                フォルダがありません
              </Text>
              <Button
                size="sm"
                colorScheme="pink"
                variant="ghost"
                mt={2}
                onClick={onCreateOpen}
              >
                フォルダを作成
              </Button>
            </Box>
          )}
        </VStack>
      </VStack>

      <CreateFolderModal
        isOpen={isCreateOpen}
        onClose={handleCreateClose}
        editingFolder={editingFolder}
      />

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              フォルダを削除
            </AlertDialogHeader>
            <AlertDialogBody>
              「{deletingFolder?.name}
              」を削除しますか？フォルダ内のすべてのノートも削除されます。
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                キャンセル
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={deleteMutation.status === "pending"}
              >
                削除する
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
