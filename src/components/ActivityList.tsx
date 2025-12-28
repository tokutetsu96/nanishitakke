import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Center,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Activity } from '../types';
import CuteBox from './CuteBox';

interface ActivityListProps {
  selectedDate: string;
}

const ActivityList = ({ selectedDate }: ActivityListProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', selectedDate) // Filter by selectedDate
          .order('start_time', { ascending: true });

        if (error) {
          throw error;
        }

        setActivities(data || []);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: 'エラー',
          description: `活動の読み込みに失敗しました: ${err.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, selectedDate]); // Add selectedDate to dependency array

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) {
        throw error;
      }
      setActivities(activities.filter((act) => act.id !== id));
      toast({
        title: '成功',
        description: '活動を削除しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'エラー',
        description: `活動の削除に失敗しました: ${err.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center p={10}>
        <Spinner color="pink.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error: {error}
      </Alert>
    );
  }

  if (activities.length === 0) {
    return (
      <Text color="gray.500" textAlign="center" p={10}>
        まだ今日の記録はありません。
      </Text>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {activities.map((activity) => (
        <CuteBox
          key={activity.id}
          p={4}
          bg="white"
          borderRadius="xl"
        >
          <Flex align="center">
            <Box flex="1">
              <Text fontWeight="bold" color="gray.700">
                {activity.start_time} - {activity.end_time || ''}
              </Text>
              <Text color="gray.600">{activity.content}</Text>
            </Box>
            <IconButton
              aria-label="Delete activity"
              icon={<DeleteIcon />}
              variant="ghost"
              colorScheme="red"
              onClick={() => handleDelete(activity.id)}
            />
          </Flex>
        </CuteBox>
      ))}
    </VStack>
  );
};

export default ActivityList;