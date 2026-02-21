import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Flex, Input, Spinner, Text } from "@chakra-ui/react";
import MDEditor from "@uiw/react-md-editor";
import { useAuth } from "@/lib/auth";
import { useNote } from "../api/get-notes";
import { useUpdateNote } from "../api/update-note";

interface NoteEditorProps {
  noteId: string;
}

export const NoteEditor = ({ noteId }: NoteEditorProps) => {
  const { user } = useAuth();
  const { data: note, isLoading } = useNote(noteId);
  const updateMutation = useUpdateNote();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (note && initializedRef.current !== note.id) {
      setTitle(note.title);
      setContent(note.content);
      initializedRef.current = note.id;
    }
  }, [note]);

  const save = useCallback(
    (newTitle: string, newContent: string) => {
      if (!user || !noteId) return;

      setIsSaving(true);
      updateMutation.mutate(
        {
          id: noteId,
          user_id: user.id,
          title: newTitle,
          content: newContent,
        },
        {
          onSettled: () => {
            setIsSaving(false);
          },
        }
      );
    },
    [user, noteId, updateMutation]
  );

  const debouncedSave = useCallback(
    (newTitle: string, newContent: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        save(newTitle, newContent);
      }, 500);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave(newTitle, content);
  };

  const handleContentChange = (value?: string) => {
    const newContent = value ?? "";
    setContent(newContent);
    debouncedSave(title, newContent);
  };

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
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="タイトル"
          variant="unstyled"
          fontWeight="bold"
          fontSize="lg"
          flex={1}
        />
        <Text fontSize="xs" color="gray.400" flexShrink={0}>
          {isSaving ? "保存中..." : "保存済み"}
        </Text>
      </Flex>

      <Box flex={1} overflow="auto" data-color-mode="light">
        <MDEditor
          value={content}
          onChange={handleContentChange}
          height="100%"
          preview="live"
          visibleDragbar={false}
        />
      </Box>
    </Flex>
  );
};
