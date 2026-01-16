import { useState } from "react";
import {
  Box,
  Button,
  Container,
  VStack,
  useDisclosure,
  Heading,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { WorkMemoList } from "@/features/work-memos/components/work-memo-list";
import { AddWorkMemoModal } from "@/features/work-memos/components/add-work-memo-modal";
import type { WorkMemo } from "@/features/work-memos/types";

export const WorkMemosRoute = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const [refreshKey, setRefreshKey] = useState(0); // Not needed with React Query
  const [editingMemo, setEditingMemo] = useState<WorkMemo | null>(null);

  const handleMemoAdded = () => {
    // setRefreshKey((prevKey) => prevKey + 1); // React Query handles invalidation
  };

  const handleEditMemo = (memo: WorkMemo) => {
    setEditingMemo(memo);
    onOpen();
  };

  const handleCloseModal = () => {
    setEditingMemo(null);
    onClose();
  };

  return (
    <>
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h2" size="lg" color="gray.700">
            仕事メモ
          </Heading>

          <Button
            onClick={onOpen}
            leftIcon={<AddIcon />}
            colorScheme="pink"
            variant="solid"
            size="lg"
            w="full"
            py={7}
          >
            仕事メモを記録する
          </Button>

          <Box w="full">
            <WorkMemoList onEditMemo={handleEditMemo} />
          </Box>
        </VStack>
      </Container>

      <AddWorkMemoModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onMemoAdded={handleMemoAdded}
        initialMemo={editingMemo}
      />
    </>
  );
};
