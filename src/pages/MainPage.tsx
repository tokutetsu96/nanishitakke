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
import ActivityList from "@/components/activities/ActivityList";
import AddActivityModal from "@/components/activities/AddActivityModal";
import AppHeader from "@/components/layout/AppHeader";
import DatePicker, { registerLocale } from "react-datepicker";
import { ja } from "date-fns/locale/ja";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

registerLocale("ja", ja);

const MainPage = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [refreshKey, setRefreshKey] = useState(0);

  // Date型で管理すると操作しやすいため変更
  const [startDate, setStartDate] = useState(new Date());

  // ActivityListに渡す用の文字列 (YYYY-MM-DD)
  const selectedDateString = format(startDate, "yyyy-MM-dd");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const handleActivityAdded = () => {
    setRefreshKey((prevKey) => prevKey + 1);
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
        onClose={onClose}
        onActivityAdded={handleActivityAdded}
      />

      {/* CSSの微調整：DatePickerを親要素の幅いっぱいに広げる */}
      <style>{`
        .datepicker-full-width {
          width: 100%;
        }
      `}</style>
    </>
  );
};

export default MainPage;
