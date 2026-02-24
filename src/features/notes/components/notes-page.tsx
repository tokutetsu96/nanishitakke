import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
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

  const isMobile = useIsMobile(1024);

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
      <div className="h-[calc(100vh-80px)]">
        {mobileView === "folders" && (
          <FolderList
            selectedFolderId={selectedFolderId}
            onSelectFolder={handleSelectFolder}
          />
        )}

        {mobileView === "notes" && selectedFolderId && (
          <div className="h-full">
            <div className="flex items-center p-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                aria-label="戻る"
                onClick={handleBackToFolders}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="font-bold text-sm ml-1">
                ノート一覧
              </span>
            </div>
            <NoteList
              folderId={selectedFolderId}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              onNoteDeleted={handleNoteDeleted}
            />
          </div>
        )}

        {mobileView === "detail" && selectedNoteId && (
          <div className="h-full">
            <NoteDetailView
              noteId={selectedNoteId}
              onBack={handleBackToNotes}
              onEdit={handleEdit}
            />
          </div>
        )}

        {mobileView === "editor" && selectedNoteId && (
          <div className="h-full">
            <NoteEditor noteId={selectedNoteId} onBack={handleBackToDetail} />
          </div>
        )}
      </div>
    );
  }

  // Desktop: full-screen view when a note is selected
  if (selectedNoteId) {
    return (
      <div className="h-[calc(100vh-80px)] border rounded-md overflow-hidden">
        {isEditing ? (
          <NoteEditor noteId={selectedNoteId} onBack={handleBackToDetail} />
        ) : (
          <NoteDetailView
            noteId={selectedNoteId}
            onBack={handleBackToNotes}
            onEdit={handleEdit}
          />
        )}
      </div>
    );
  }

  // Desktop: 2-column layout for folder/note browsing
  return (
    <div className="flex h-[calc(100vh-80px)] border rounded-md overflow-hidden">
      {/* Folder column */}
      <div className="w-[250px] border-r shrink-0">
        <FolderList
          selectedFolderId={selectedFolderId}
          onSelectFolder={handleSelectFolder}
        />
      </div>

      {/* Note list column */}
      <div className="flex-1 min-w-0">
        {selectedFolderId ? (
          <NoteList
            folderId={selectedFolderId}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            onNoteDeleted={handleNoteDeleted}
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-sm">
              フォルダを選択してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
