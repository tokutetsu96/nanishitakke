import { useState } from "react";
import {
  Box,
  Button,
  VStack,
  useDisclosure,
  Heading,
  IconButton,
  HStack,
  Text,
  Input,
} from "@chakra-ui/react";
import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { WorkMemoList } from "@/features/work-memos/components/work-memo-list";
import { AddWorkMemoModal } from "@/features/work-memos/components/add-work-memo-modal";
import type { WorkMemo } from "@/features/work-memos/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale/ja";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("ja", ja);

export const WorkMemosRoute = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [editingMemo, setEditingMemo] = useState<WorkMemo | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const handleMemoAdded = () => {};

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
      <VStack spacing={8} align="stretch" py={4}>
        <Box>
          <Heading as="h2" size="lg" mb={2}>
            仕事メモ
          </Heading>
          <Text color="gray.600">日々の仕事の振り返りを記録します</Text>
        </Box>

        <HStack justify="space-between">
          <HStack spacing={2}>
            <IconButton
              aria-label="前の月"
              icon={<ChevronLeftIcon boxSize={5} />}
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            />
            <Box>
              <DatePicker
                selected={currentMonth}
                onChange={(date: Date | null) => date && setCurrentMonth(date)}
                showMonthYearPicker
                dateFormat="yyyy年M月"
                locale="ja"
                customInput={
                  <Input
                    as="button"
                    fontWeight="bold"
                    fontSize="lg"
                    minW="140px"
                    textAlign="center"
                    variant="unstyled"
                    cursor="pointer"
                    _hover={{ color: "pink.500" }}
                  />
                }
                portalId="react-datepicker-portal"
              />
            </Box>
            <IconButton
              aria-label="次の月"
              icon={<ChevronRightIcon boxSize={5} />}
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            />
          </HStack>
          <Button
            onClick={onOpen}
            leftIcon={<AddIcon />}
            colorScheme="pink"
            size="sm"
          >
            記録する
          </Button>
        </HStack>

        <Box w="full">
          <WorkMemoList
            onEditMemo={handleEditMemo}
            startDate={startDate}
            endDate={endDate}
          />
        </Box>
      </VStack>

      <AddWorkMemoModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onMemoAdded={handleMemoAdded}
        initialMemo={editingMemo}
      />
    </>
  );
};
