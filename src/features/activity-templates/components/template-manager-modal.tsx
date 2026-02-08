import { useState, useRef } from "react";
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
  HStack,
  useToast,
  Select,
  Box,
  Text,
  IconButton,
  Card,
  CardBody,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Badge,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import { useAuth } from "@/lib/auth";
import { useActivityTemplates } from "@/features/activity-templates/api/get-activity-templates";
import { useCreateActivityTemplate } from "@/features/activity-templates/api/create-activity-template";
import { useDeleteActivityTemplate } from "@/features/activity-templates/api/delete-activity-template";

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateManagerModal = ({
  isOpen,
  onClose,
}: TemplateManagerModalProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const [templateName, setTemplateName] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: templates = [] } = useActivityTemplates();
  const createMutation = useCreateActivityTemplate();
  const deleteMutation = useDeleteActivityTemplate();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef(null);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    if (selectedCategory) {
      setTags([selectedCategory]);
    } else {
      setTags([]);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user || !content || !templateName) {
      toast({
        title: "入力エラー",
        description: "テンプレート名と内容は必須です。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        user_id: user.id,
        template_name: templateName,
        content: content,
        tags: tags,
      });
      toast({
        title: "成功",
        description: "テンプレートを保存しました。",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setTemplateName("");
      setContent("");
      setTags([]);
    } catch (error) {
      toast({
        title: "エラー",
        description: `保存に失敗しました: ${(error as Error).message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteMutation.mutateAsync(deleteTargetId);
      toast({
        title: "成功",
        description: "テンプレートを削除しました。",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: `削除に失敗しました: ${(error as Error).message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleteTargetId(null);
      onDeleteClose();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>テンプレート管理</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack gap={6} align="stretch">
              {/* 新規テンプレート作成セクション */}
              <Box>
                <Text fontWeight="bold" mb={3}>
                  新規テンプレート作成
                </Text>
                <VStack gap={3}>
                  <FormControl isRequired>
                    <FormLabel>テンプレート名</FormLabel>
                    <Input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="例: 朝のルーティン"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>内容</FormLabel>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="活動の内容を入力"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>タグ</FormLabel>
                    <Select
                      placeholder="カテゴリを選択"
                      value={tags[0] || ""}
                      onChange={handleCategoryChange}
                    >
                      {Object.keys(ACTIVITY_CATEGORIES).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    colorScheme="pink"
                    onClick={handleSaveTemplate}
                    isLoading={createMutation.status === "pending"}
                    w="full"
                  >
                    テンプレートを保存
                  </Button>
                </VStack>
              </Box>

              {/* 既存テンプレート一覧セクション */}
              <Box>
                <Text fontWeight="bold" mb={3}>
                  保存済みテンプレート ({templates.length}件)
                </Text>
                {templates.length === 0 ? (
                  <Text color="gray.500" fontSize="sm">
                    テンプレートがありません
                  </Text>
                ) : (
                  <VStack gap={2} align="stretch" maxH="300px" overflowY="auto">
                    {templates.map((template) => (
                      <Card key={template.id} size="sm" variant="outline">
                        <CardBody>
                          <HStack justify="space-between">
                            <Box flex={1}>
                              <Text fontWeight="semibold" fontSize="sm">
                                {template.template_name}
                              </Text>
                              <Text
                                fontSize="xs"
                                color="gray.600"
                                noOfLines={1}
                              >
                                {template.content}
                              </Text>
                              {template.tags && template.tags.length > 0 && (
                                <HStack mt={1} gap={1}>
                                  {template.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      size="sm"
                                      colorScheme="pink"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </HStack>
                              )}
                            </Box>
                            <IconButton
                              aria-label="削除"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteClick(template.id)}
                            />
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 削除確認ダイアログ */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              テンプレートを削除
            </AlertDialogHeader>

            <AlertDialogBody>
              このテンプレートを削除してもよろしいですか？
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                キャンセル
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                isLoading={deleteMutation.status === "pending"}
              >
                削除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
