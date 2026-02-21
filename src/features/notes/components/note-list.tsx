import {
  Box,
  Flex,
  IconButton,
  Text,
  useDisclosure,
  useToast,
  VStack,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiMoreVertical, FiFileText } from "react-icons/fi";
import { useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useNotes } from "../api/get-notes";
import { useDeleteNote } from "../api/delete-note";
import { CreateNoteModal } from "./create-note-modal";
import type { Note } from "../types";
import { format } from "date-fns";

interface NoteListProps {
  folderId: string;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onNoteDeleted?: () => void;
}

export const NoteList = ({
  folderId,
  selectedNoteId,
  onSelectNote,
  onNoteDeleted,
}: NoteListProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const { data: notes, isLoading } = useNotes(folderId);
  const deleteMutation = useDeleteNote();

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

  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleDeleteClick = (note: Note) => {
    setDeletingNote(note);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!user || !deletingNote) return;

    try {
      await deleteMutation.mutateAsync({
        id: deletingNote.id,
        user_id: user.id,
      });
      toast({
        title: "成功",
        description: "ノートを削除しました。",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (selectedNoteId === deletingNote.id) {
        onNoteDeleted?.();
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
      setDeletingNote(null);
    }
  };

  const handleNoteCreated = (note: Note) => {
    onSelectNote(note.id);
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
            ノート
          </Text>
          <IconButton
            aria-label="新規ノート"
            icon={<AddIcon />}
            size="xs"
            variant="ghost"
            onClick={onCreateOpen}
          />
        </Flex>

        <VStack spacing={0} align="stretch" overflowY="auto" flex={1}>
          {notes?.map((note) => (
            <Flex
              key={note.id}
              align="center"
              px={3}
              py={2}
              cursor="pointer"
              bg={selectedNoteId === note.id ? "pink.50" : "transparent"}
              color={selectedNoteId === note.id ? "pink.600" : undefined}
              _hover={{ bg: "pink.50" }}
              onClick={() => onSelectNote(note.id)}
              role="group"
            >
              <Box as={FiFileText} mr={2} flexShrink={0} />
              <Box flex={1} minW={0}>
                <Text fontSize="sm" noOfLines={1}>
                  {note.title || "無題"}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {format(new Date(note.updated_at), "yyyy/MM/dd HH:mm")}
                </Text>
              </Box>
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="ノートメニュー"
                  icon={<FiMoreVertical />}
                  size="xs"
                  variant="ghost"
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  onClick={(e) => e.stopPropagation()}
                />
                <MenuList>
                  <MenuItem
                    color="red.500"
                    onClick={() => handleDeleteClick(note)}
                  >
                    削除
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          ))}

          {notes?.length === 0 && (
            <Box p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">
                ノートがありません
              </Text>
              <Button
                size="sm"
                colorScheme="pink"
                variant="ghost"
                mt={2}
                onClick={onCreateOpen}
              >
                ノートを作成
              </Button>
            </Box>
          )}
        </VStack>
      </VStack>

      <CreateNoteModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        folderId={folderId}
        onNoteCreated={handleNoteCreated}
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
              ノートを削除
            </AlertDialogHeader>
            <AlertDialogBody>
              「{deletingNote?.title || "無題"}」を削除しますか？
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
