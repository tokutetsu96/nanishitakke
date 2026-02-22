import { Box, Flex, IconButton, Spinner, Text, Button } from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon } from "@chakra-ui/icons";
import MDEditor from "@uiw/react-md-editor";
import { useNote } from "../api/get-notes";

interface NoteDetailViewProps {
  noteId: string;
  onBack?: () => void;
  onEdit?: () => void;
}

export const NoteDetailView = ({
  noteId,
  onBack,
  onEdit,
}: NoteDetailViewProps) => {
  const { data: note, isLoading } = useNote(noteId);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="full">
        <Spinner />
      </Flex>
    );
  }

  if (!note) {
    return (
      <Flex justify="center" align="center" h="full">
        <Text color="gray.500">ノートが見つかりません</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="full">
      <Flex align="center" p={3} borderBottomWidth="1px" gap={2}>
        {onBack && (
          <IconButton
            aria-label="一覧に戻る"
            icon={<ArrowBackIcon />}
            size="sm"
            variant="ghost"
            onClick={onBack}
            flexShrink={0}
          />
        )}
        <Text fontWeight="bold" fontSize="lg" flex={1} noOfLines={1}>
          {note.title}
        </Text>
        {onEdit && (
          <Button
            leftIcon={<EditIcon />}
            size="sm"
            variant="ghost"
            onClick={onEdit}
            flexShrink={0}
          >
            編集
          </Button>
        )}
      </Flex>

      <Box flex={1} overflow="auto" p={4} data-color-mode="light">
        <MDEditor.Markdown source={note.content} />
      </Box>
    </Flex>
  );
};
