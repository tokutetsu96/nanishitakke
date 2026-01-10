import React, { useEffect, useState, useRef } from "react";
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
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Activity } from "@/features/activities/types";
import { CuteBox } from "@/components/ui/cute-box";
import { ACTIVITY_CATEGORIES } from "@/config/constants";

interface ActivityListProps {
  selectedDate: string;
  onEditActivity: (activity: Activity) => void;
}

const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return "";

  return timeString.slice(0, 5);
};

export const ActivityList = React.memo(
  ({ selectedDate, onEditActivity }: ActivityListProps) => {
    const { user } = useAuth();
    const toast = useToast();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activityIdToDelete, setActivityIdToDelete] = useState<string | null>(
      null
    );
    const cancelRef = useRef(null);

    useEffect(() => {
      const fetchActivities = async () => {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          const { data, error } = await supabase
            .from("activities")
            .select("*")
            .eq("user_id", user.id)
            .eq("date", selectedDate)
            .order("start_time", { ascending: true });

          if (error) {
            throw error;
          }

          setActivities(data || []);
        } catch (err: unknown) {
          let errorMessage = "活動の読み込みに失敗しました。";
          if (err instanceof Error) {
            errorMessage = `活動の読み込みに失敗しました: ${err.message}`;
          } else if (
            typeof err === "object" &&
            err !== null &&
            "message" in err
          ) {
            errorMessage = `活動の読み込みに失敗しました: ${(err as Error).message}`;
          }
          setError(errorMessage);
          toast({
            title: "エラー",
            description: errorMessage,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchActivities();
      // userにした場合、タブ切り替えで再レンダリングされてしまう
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, selectedDate, toast]);

    const handleClickDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setActivityIdToDelete(id);
      onOpen();
    };

    const confirmDelete = async () => {
      if (!activityIdToDelete) return;

      try {
        const { error } = await supabase
          .from("activities")
          .delete()
          .eq("id", activityIdToDelete);
        if (error) {
          throw error;
        }
        setActivities(
          activities.filter((act) => act.id !== activityIdToDelete)
        );
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
        } else if (
          typeof err === "object" &&
          err !== null &&
          "message" in err
        ) {
          errorMessage = `活動の削除に失敗しました: ${(err as Error).message}`;
        }
        setError(errorMessage);
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

    if (loading) {
      return (
        <Center p={10}>
          <Spinner color="pink.500" />
        </Center>
      );
    }

    if (error) {
      return (
        <Alert status="error">
          <AlertIcon />
          Error: {error}
        </Alert>
      );
    }

    if (activities.length === 0) {
      return (
        <Text color="gray.500" textAlign="center" p={10}>
          指定した日付の記録はありません。
        </Text>
      );
    }

    return (
      <VStack spacing={4} align="stretch">
        {activities.map((activity) => (
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
              />
            </Flex>
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
                活動を削除
              </AlertDialogHeader>

              <AlertDialogBody>
                この活動を本当に削除しますか？この操作は取り消せません。
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  キャンセル
                </Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3}>
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
