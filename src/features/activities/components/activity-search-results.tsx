import React, { useState, useRef } from "react";
import {
  Box,
  Flex,
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
  HStack,
  Tag,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale/ja";
import type { Activity } from "@/features/activities/types";
import { CuteBox } from "@/components/ui/cute-box";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import { useSearchActivities } from "@/features/activities/api/get-activities";
import { useDeleteActivity } from "@/features/activities/api/delete-activity";

interface ActivitySearchResultsProps {
  keyword?: string;
  tags?: string[];
  onEditActivity: (activity: Activity) => void;
}

const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return "";
  return timeString.slice(0, 5);
};

const groupByDate = (activities: Activity[]): Map<string, Activity[]> => {
  const grouped = new Map<string, Activity[]>();
  for (const activity of activities) {
    const existing = grouped.get(activity.date);
    if (existing) {
      existing.push(activity);
    } else {
      grouped.set(activity.date, [activity]);
    }
  }
  return grouped;
};

export const ActivitySearchResults = React.memo(
  ({ keyword, tags, onEditActivity }: ActivitySearchResultsProps) => {
    const toast = useToast();

    const {
      data: activities = [],
      isLoading,
      error,
    } = useSearchActivities({ keyword, tags });

    const deleteMutation = useDeleteActivity();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activityIdToDelete, setActivityIdToDelete] = useState<string | null>(
      null
    );
    const cancelRef = useRef(null);

    const handleClickDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setActivityIdToDelete(id);
      onOpen();
    };

    const confirmDelete = async () => {
      if (!activityIdToDelete) return;

      try {
        await deleteMutation.mutateAsync(activityIdToDelete);
        toast({
          title: "成功",
          description: "活動を削除しました。",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err: unknown) {
        let errorMessage = "活動の削除に失敗しました。";
        if (err instanceof Error) {
          errorMessage = `活動の削除に失敗しました: ${err.message}`;
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
        setActivityIdToDelete(null);
      }
    };

    if (isLoading) {
      return (
        <Center p={10}>
          <Spinner color="pink.500" />
        </Center>
      );
    }

    if (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return (
        <Alert status="error">
          <AlertIcon />
          Error: {errorMessage}
        </Alert>
      );
    }

    if (activities.length === 0) {
      return (
        <Text color="gray.500" textAlign="center" p={10}>
          検索条件に一致する活動はありません。
        </Text>
      );
    }

    const grouped = groupByDate(activities);

    return (
      <VStack spacing={4} align="stretch">
        <Text color="gray.500" fontSize="sm">
          {activities.length}件の活動が見つかりました
        </Text>
        {Array.from(grouped.entries()).map(([date, dateActivities]) => (
          <Box key={date}>
            <Text fontWeight="bold" color="gray.600" mb={2} fontSize="sm">
              {format(parseISO(date), "yyyy/MM/dd (eee)", { locale: ja })}
            </Text>
            <VStack spacing={3} align="stretch">
              {dateActivities.map((activity) => (
                <CuteBox
                  key={activity.id}
                  p={4}
                  bg="white"
                  borderRadius="xl"
                  onClick={() => onEditActivity(activity)}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ transform: "scale(1.02)", shadow: "md" }}
                >
                  <Flex align="center">
                    <Box flex="1">
                      <Text fontWeight="bold" color="gray.700">
                        {formatTime(activity.start_time)} -{" "}
                        {formatTime(activity.end_time)}
                      </Text>
                      <Text color="gray.600" whiteSpace="pre-wrap">
                        {activity.content}
                      </Text>
                      {activity.tags && activity.tags.length > 0 && (
                        <HStack spacing={2} mt={2}>
                          {activity.tags.map((tag) => (
                            <Tag
                              key={tag}
                              size="sm"
                              borderRadius="full"
                              variant="subtle"
                              colorScheme={
                                ACTIVITY_CATEGORIES[
                                  tag as keyof typeof ACTIVITY_CATEGORIES
                                ] || "gray"
                              }
                            >
                              {tag}
                            </Tag>
                          ))}
                        </HStack>
                      )}
                    </Box>
                    <IconButton
                      aria-label="Delete activity"
                      icon={<DeleteIcon />}
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => handleClickDelete(e, activity.id)}
                      isLoading={
                        deleteMutation.status === "pending" &&
                        activityIdToDelete === activity.id
                      }
                    />
                  </Flex>
                </CuteBox>
              ))}
            </VStack>
          </Box>
        ))}
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                活動を削除
              </AlertDialogHeader>
              <AlertDialogBody>
                この活動を本当に削除しますか？この操作は取り消せません。
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
  }
);
