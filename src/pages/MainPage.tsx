import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  VStack,
  useDisclosure,
  Input,
  Text, // Import Text component
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { supabase } from '@/lib/supabase';
import ActivityList from '@/components/activities/ActivityList';
import AddActivityModal from '@/components/activities/AddActivityModal';
import AppHeader from '@/components/layout/AppHeader';
import { formatDateWithDay } from '@/utils/dateUtils'; // Import the utility function

const MainPage = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const handleActivityAdded = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <>
      <Box bg="gray.50" minH="100vh">
        <AppHeader onLogout={handleLogout} />

        {/* Main Content */}
        <Container maxW="container.md" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Date Selector */}
            <Box w="full" textAlign="center">
              <Text fontSize="xl" fontWeight="bold" mb={2}>
                {formatDateWithDay(selectedDate)}
              </Text>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                size="lg"
                variant="filled"
              />
            </Box>

            {/* Activity List */}
            <Box w="full">
              <ActivityList key={refreshKey} selectedDate={selectedDate} />
            </Box>

            {/* Add Activity Button */}
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
    </>
  );
};

export default MainPage;