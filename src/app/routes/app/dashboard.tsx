import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  VStack,
  useDisclosure,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { AddIcon, CalendarIcon } from "@chakra-ui/icons";
import { supabase } from "@/lib/supabase";
import { ActivityList } from "@/features/activities/components/activity-list";
import { AddActivityModal } from "@/features/activities/components/add-activity-modal";
import { AppHeader } from "@/components/layouts/app-header";
import DatePicker, { registerLocale } from "react-datepicker";
import { ja } from "date-fns/locale/ja";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import type { Activity } from "@/features/activities/types";
import "./dashboard.scss";

registerLocale("ja", ja);

export const DashboardRoute = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [refreshKey, setRefreshKey] = useState(0);

  const [startDate, setStartDate] = useState(new Date());

  // State to track the activity being edited
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const selectedDateString = format(startDate, "yyyy-MM-dd");

  const handleLogout = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("ログアウト警告:", error);
      }
    } catch (error) {
      console.error("ログアウトエラー:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleActivityAdded = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    onOpen();
  };

  const handleCloseModal = () => {
    setEditingActivity(null);
    onClose();
  };

  return (
    <>
      <Box bg="gray.50" minH="100vh">
        <AppHeader onLogout={handleLogout} />

        <Container maxW="container.md" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Date Selector */}
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

            {/* Activity List */}
            <Box w="full">
              <ActivityList
                key={refreshKey}
                selectedDate={selectedDateString}
                onEditActivity={handleEditActivity}
              />
            </Box>

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
          </VStack>
        </Container>
      </Box>

      <AddActivityModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onActivityAdded={handleActivityAdded}
        initialActivity={editingActivity}
      />
    </>
  );
};
