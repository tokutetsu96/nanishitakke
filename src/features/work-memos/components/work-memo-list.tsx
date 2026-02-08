import React, { useState, useRef } from "react";
import {
  Box,
  Text,
  IconButton,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Center,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import type { WorkMemo } from "@/features/work-memos/types";
import { CuteBox } from "@/components/ui/cute-box";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { useWorkMemos } from "@/features/work-memos/api/get-work-memos";
import { useDeleteWorkMemo } from "@/features/work-memos/api/delete-work-memo";

interface WorkMemoListProps {
  onEditMemo: (memo: WorkMemo) => void;
}

export const WorkMemoList = React.memo(({ onEditMemo }: WorkMemoListProps) => {
  // Removed refreshKey
  const toast = useToast();

  // Data Fetching
  const {
    data: memos = [],
    isLoading: loading,
    error: queryError,
  } = useWorkMemos();

  // Mutation
  const deleteMutation = useDeleteWorkMemo();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [memoIdToDelete, setMemoIdToDelete] = useState<string | null>(null);
  const cancelRef = useRef(null);

  const handleClickDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMemoIdToDelete(id);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!memoIdToDelete) return;

    try {
      await deleteMutation.mutateAsync(memoIdToDelete);
      toast({
        title: "成功",
        description: "メモを削除しました。",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      let errorMessage = "メモの削除に失敗しました。";
      if (err instanceof Error) {
        errorMessage = `メモの削除に失敗しました: ${err.message}`;
      }
      toast({
        title: "エラー",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
      setMemoIdToDelete(null);
    }
  };

  if (loading) {
    return (
      <Center p={10}>
        <Spinner color="pink.500" />
      </Center>
    );
  }

  if (queryError) {
    const errorMessage =
      queryError instanceof Error ? queryError.message : String(queryError);
    return (
      <Alert status="error">
        <AlertIcon />
        Error: {errorMessage}
      </Alert>
    );
  }

  if (memos.length === 0) {
    return (
      <Text color="gray.500" textAlign="center" p={10}>
        記録された仕事メモはありません。
      </Text>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {memos.map((memo) => (
        <CuteBox key={memo.id} p={4} bg="white" borderRadius="xl">
          <Box
            mb={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize="lg" color="pink.500">
              {format(new Date(memo.date), "yyyy年MM月dd日 (eee)", {
                locale: ja,
              })}
            </Text>
            <Box>
              <IconButton
                icon={<EditIcon />}
                aria-label="Edit"
                size="sm"
                mr={2}
                onClick={() => onEditMemo(memo)}
              />
              <IconButton
                icon={<DeleteIcon />}
                aria-label="Delete"
                colorScheme="red"
                variant="ghost"
                size="sm"
                onClick={(e) => handleClickDelete(e, memo.id)}
                isLoading={
                  deleteMutation.status === "pending" &&
                  memoIdToDelete === memo.id
                }
              />
            </Box>
          </Box>

          <Accordion allowToggle>
            <AccordionItem border="none">
              <h2>
                <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                  <Box flex="1" textAlign="left" fontWeight="bold">
                    記録詳細
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} px={0}>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">
                      やったこと
                    </Text>
                    <Text whiteSpace="pre-wrap">{memo.done_text}</Text>
                  </Box>
                  {memo.good_text && (
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">
                        良かったこと
                      </Text>
                      <Text whiteSpace="pre-wrap">{memo.good_text}</Text>
                    </Box>
                  )}
                  {memo.stuck_text && (
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">
                        詰まったこと
                      </Text>
                      <Text whiteSpace="pre-wrap">{memo.stuck_text}</Text>
                    </Box>
                  )}
                  {memo.cause_text && (
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">
                        原因
                      </Text>
                      <Text whiteSpace="pre-wrap">{memo.cause_text}</Text>
                    </Box>
                  )}
                  {memo.improvement_text && (
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">
                        改善案
                      </Text>
                      <Text whiteSpace="pre-wrap">{memo.improvement_text}</Text>
                    </Box>
                  )}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CuteBox>
      ))}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              メモを削除
            </AlertDialogHeader>

            <AlertDialogBody>
              このメモを本当に削除しますか？この操作は取り消せません。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                キャンセル
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteMutation.status === "pending"}
              >
                削除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
});
