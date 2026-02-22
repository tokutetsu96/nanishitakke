import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  VStack,
  useDisclosure,
  Input,
  InputGroup,
  InputRightElement,
  Tag,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { AddIcon, CalendarIcon, SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { ActivityList } from "@/features/activities/components/activity-list";
import { ActivitySearchResults } from "@/features/activities/components/activity-search-results";
import { AddActivityModal } from "@/features/activities/components/add-activity-modal";
import DatePicker, { registerLocale } from "react-datepicker";
import { ja } from "date-fns/locale/ja";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import type { Activity } from "@/features/activities/types";
import {
  ACTIVITY_CATEGORIES,
  type ActivityCategory,
} from "@/config/constants";
import "@/features/activities/components/activities.scss";

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
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedKeyword("");
    setSelectedTags([]);
  };

  return (
    <>
      <VStack spacing={4} align="stretch" py={4}>
        {/* Search Bar */}
        <Box w="full">
          <InputGroup size="lg">
            <Input
              placeholder="キーワードで検索..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              variant="filled"
            />
            <InputRightElement>
              {searchInput ? (
                <CloseIcon
                  color="gray.400"
                  cursor="pointer"
                  boxSize={3}
                  onClick={() => setSearchInput("")}
                />
              ) : (
                <SearchIcon color="gray.400" />
              )}
            </InputRightElement>
          </InputGroup>
        </Box>

        {/* Category Filter */}
        <Wrap spacing={2}>
          {categoryEntries.map(([category, color]) => (
            <WrapItem key={category}>
              <Tag
                size="md"
                borderRadius="full"
                variant={selectedTags.includes(category) ? "solid" : "outline"}
                colorScheme={color}
                cursor="pointer"
                onClick={() => toggleTag(category)}
                px={3}
                py={1}
              >
                {category}
              </Tag>
            </WrapItem>
          ))}
          {isSearchMode && (
            <WrapItem>
              <Tag
                size="md"
                borderRadius="full"
                variant="outline"
                colorScheme="gray"
                cursor="pointer"
                onClick={clearSearch}
                px={3}
                py={1}
              >
                クリア ✕
              </Tag>
            </WrapItem>
          )}
        </Wrap>

        {!isSearchMode && (
          /* Date Selector */
          <Box w="full">
            <InputGroup size="lg">
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) =>
                  setStartDate(date || new Date())
                }
                locale="ja"
                dateFormat="yyyy/MM/dd (eee)"
                customInput={
                  <Input
                    variant="filled"
                    textAlign="center"
                    fontWeight="bold"
                    cursor="pointer"
                  />
                }
                wrapperClassName="datepicker-full-width"
                portalId="react-datepicker-portal"
              />
              <InputRightElement pointerEvents="none">
                <CalendarIcon color="gray.500" />
              </InputRightElement>
            </InputGroup>
          </Box>
        )}

        {/* Activity List or Search Results */}
        <Box w="full">
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
        </Box>

        {!isSearchMode && (
          <Button
            onClick={onOpen}
            leftIcon={<AddIcon />}
            colorScheme="pink"
            variant="solid"
            size="lg"
            w="full"
            py={7}
          >
            やったことを追加する
          </Button>
        )}
      </VStack>

      <AddActivityModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onActivityAdded={handleActivityAdded}
        initialActivity={editingActivity}
      />
    </>
  );
};
