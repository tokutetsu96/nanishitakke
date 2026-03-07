import { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDisclosure } from "@/hooks/use-disclosure";
import { ActivityList } from "@/features/activities/components/activity-list";
import { ActivitySearchResults } from "@/features/activities/components/activity-search-results";
import { AddActivityModal } from "@/features/activities/components/add-activity-modal";
import DatePicker, { registerLocale } from "react-datepicker";
import { ja } from "date-fns/locale/ja";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import type { Activity } from "@/features/activities/types";
import { ACTIVITY_CATEGORIES, type ActivityCategory } from "@/config/constants";

registerLocale("ja", ja);

const categoryEntries = Object.entries(ACTIVITY_CATEGORIES) as [
  ActivityCategory,
  string,
][];

export const ActivitiesRoute = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [startDate, setStartDate] = useState(new Date());
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Debounce keyword input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const isSearchMode = debouncedKeyword !== "" || selectedTags.length > 0;

  const selectedDateString = format(startDate, "yyyy-MM-dd");

  const handleActivityAdded = () => {
    // No manual refresh needed thanks to React Query invalidation
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    onOpen();
  };

  const handleCloseModal = () => {
    setEditingActivity(null);
    onClose();
  };

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedKeyword("");
    setSelectedTags([]);
  };

  return (
    <>
      <div className="flex flex-col gap-4 py-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Input
            placeholder="キーワードで検索..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-12 bg-gray-100 border-transparent pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {searchInput ? (
              <X
                className="h-3 w-3 text-gray-400 cursor-pointer"
                onClick={() => setSearchInput("")}
              />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categoryEntries.map(([category, color]) => (
            <Badge
              key={category}
              variant={
                selectedTags.includes(category)
                  ? (color as BadgeVariant)
                  : "outline"
              }
              className={`cursor-pointer px-3 py-1 ${
                selectedTags.includes(category)
                  ? ""
                  : `text-${color}-600 border-${color}-200 hover:bg-${color}-50`
              }`}
              onClick={() => toggleTag(category)}
            >
              {category}
            </Badge>
          ))}
          {isSearchMode && (
            <Badge
              variant="outline"
              className="cursor-pointer px-3 py-1 text-gray-600 border-gray-200 hover:bg-gray-50"
              onClick={clearSearch}
            >
              クリア ✕
            </Badge>
          )}
        </div>

        {!isSearchMode && (
          /* Date Selector */
          <div className="relative w-full">
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date || new Date())}
              locale="ja"
              dateFormat="yyyy/MM/dd (eee)"
              customInput={
                <Input className="h-12 bg-gray-100 border-transparent text-center font-bold cursor-pointer pr-10" />
              }
              wrapperClassName="datepicker-full-width"
              portalId="react-datepicker-portal"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        )}

        {/* Activity List or Search Results */}
        <div className="w-full">
          {isSearchMode ? (
            <ActivitySearchResults
              keyword={debouncedKeyword || undefined}
              tags={selectedTags.length > 0 ? selectedTags : undefined}
              onEditActivity={handleEditActivity}
            />
          ) : (
            <ActivityList
              selectedDate={selectedDateString}
              onEditActivity={handleEditActivity}
            />
          )}
        </div>

        {!isSearchMode && (
          <Button onClick={onOpen} size="lg" className="w-full py-7">
            <Plus className="h-4 w-4" />
            やったことを追加する
          </Button>
        )}
      </div>

      <AddActivityModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onActivityAdded={handleActivityAdded}
        initialActivity={editingActivity}
      />
    </>
  );
};

type BadgeVariant =
  | "pink"
  | "gray"
  | "blue"
  | "orange"
  | "purple"
  | "green"
  | "teal"
  | "red"
  | "yellow"
  | "cyan";
