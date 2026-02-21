import { Heading, VStack } from "@chakra-ui/react";
import { CalendarView } from "@/features/calendar/components/CalendarView";

export const CalendarRoute = () => {
  return (
    <VStack spacing={8} align="stretch" py={4}>
      <Heading size="lg">カレンダー</Heading>
      <CalendarView />
    </VStack>
  );
};
