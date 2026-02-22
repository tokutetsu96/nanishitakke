import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FolderList } from "./folder-list";
import { NoteList } from "./note-list";
import { NoteDetailView } from "./note-detail-view";
import { NoteEditor } from "./note-editor";

type MobileView = "folders" | "notes" | "detail" | "editor";

export const NotesPage = () => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("folders");

  const isMobile = useBreakpointValue({ base: true, lg: false });

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId || null);
    setSelectedNoteId(null);
    setIsEditing(false);
    if (isMobile) {
      setMobileView("notes");
    }
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsEditing(false);
    if (isMobile) {
      setMobileView("detail");
    }
  };

  const handleNoteDeleted = () => {
    setSelectedNoteId(null);
    setIsEditing(false);
    if (isMobile) {
      setMobileView("notes");
    }
  };

  const handleBackToFolders = () => {
    setMobileView("folders");
    setSelectedFolderId(null);
    setSelectedNoteId(null);
    setIsEditing(false);
  };

  const handleBackToNotes = () => {
    setSelectedNoteId(null);
    setIsEditing(false);
    if (isMobile) {
      setMobileView("notes");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (isMobile) {
      setMobileView("editor");
    }
  };

  const handleBackToDetail = () => {
    setIsEditing(false);
    if (isMobile) {
      setMobileView("detail");
    }
  };

  // Mobile layout
  if (isMobile) {
    return (
      <Box h="calc(100vh - 80px)">
        {mobileView === "folders" && (
          <FolderList
            selectedFolderId={selectedFolderId}
            onSelectFolder={handleSelectFolder}
          />
        )}

        {mobileView === "notes" && selectedFolderId && (
          <Box h="full">
            <Flex align="center" p={2} borderBottomWidth="1px">
              <IconButton
                aria-label="戻る"
                icon={<ArrowBackIcon />}
                size="sm"
                variant="ghost"
                onClick={handleBackToFolders}
              />
              <Text fontWeight="bold" fontSize="sm" ml={1}>
                ノート一覧
              </Text>
            </Flex>
            <NoteList
              folderId={selectedFolderId}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              onNoteDeleted={handleNoteDeleted}
            />
          </Box>
        )}

        {mobileView === "detail" && selectedNoteId && (
          <Box h="full">
            <NoteDetailView
              noteId={selectedNoteId}
              onBack={handleBackToNotes}
              onEdit={handleEdit}
            />
          </Box>
        )}

        {mobileView === "editor" && selectedNoteId && (
          <Box h="full">
            <NoteEditor noteId={selectedNoteId} onBack={handleBackToDetail} />
          </Box>
        )}
      </Box>
    );
  }

  // Desktop: full-screen view when a note is selected
  if (selectedNoteId) {
    return (
      <Box h="calc(100vh - 80px)" borderWidth="1px" borderRadius="md" overflow="hidden">
        {isEditing ? (
          <NoteEditor noteId={selectedNoteId} onBack={handleBackToDetail} />
        ) : (
          <NoteDetailView
            noteId={selectedNoteId}
            onBack={handleBackToNotes}
            onEdit={handleEdit}
          />
        )}
      </Box>
    );
  }

  // Desktop: 2-column layout for folder/note browsing
  return (
    <Flex h="calc(100vh - 80px)" borderWidth="1px" borderRadius="md" overflow="hidden">
      {/* Folder column */}
      <Box w="250px" borderRightWidth="1px" flexShrink={0}>
        <FolderList
          selectedFolderId={selectedFolderId}
          onSelectFolder={handleSelectFolder}
        />
      </Box>

      {/* Note list column */}
      <Box flex={1} minW={0}>
        {selectedFolderId ? (
          <NoteList
            folderId={selectedFolderId}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            onNoteDeleted={handleNoteDeleted}
          />
        ) : (
          <Flex justify="center" align="center" h="full">
            <Text color="gray.500" fontSize="sm">
              フォルダを選択してください
            </Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};
