import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast, // Use Chakra UI's useToast
} from '@chakra-ui/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface AddActivityModalProps {
  isOpen: boolean; // Revert to isOpen
  onClose: () => void;
  onActivityAdded: () => void;
}

const AddActivityModal = ({ isOpen, onClose, onActivityAdded }: AddActivityModalProps) => {
  const { user } = useAuth();
  const toast = useToast(); // Use Chakra UI's useToast
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Revert to isLoading

  const handleSubmit = async () => {
    if (!user || !content || !startTime) {
      toast({
        title: '入力エラー',
        description: '開始時刻と内容は必須です。',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true); // Revert to setIsLoading
    try {
      const { error } = await supabase.from('activities').insert({
        user_id: user.id,
        date: new Date().toISOString().slice(0, 10), // Today's date
        start_time: startTime,
        end_time: endTime || null,
        content: content,
      });

      if (error) throw error;

      toast({
        title: '成功',
        description: '新しい活動を記録しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onActivityAdded();
      onClose();
      // Reset form
      setStartTime('');
      setEndTime('');
      setContent('');
    } catch (err: any) { // Use 'any' for simpler error handling if no specific type is known
      toast({
        title: 'エラー',
        description: `記録に失敗しました: ${err.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false); // Revert to setIsLoading
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered> {/* Revert to isOpen and onClose */}
      <ModalOverlay />
      <ModalContent> {/* Remove borderRadius */}
        <ModalHeader>新しい活動を記録</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <FormControl isRequired> {/* Revert to FormControl isRequired */}
              <FormLabel>開始時刻</FormLabel>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>終了時刻</FormLabel>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired> {/* Revert to FormControl isRequired */}
              <FormLabel>内容</FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="何をした？"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            キャンセル
          </Button>
          <Button
            colorScheme="pink" // Revert to colorScheme
            onClick={handleSubmit}
            isLoading={isLoading} // Revert to isLoading
          >
            記録する
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddActivityModal;