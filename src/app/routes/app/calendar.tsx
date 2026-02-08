import { Container, Heading, VStack } from "@chakra-ui/react";
import { CalendarView } from "@/features/calendar/components/CalendarView";

export const CalendarRoute = () => {
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">カレンダー</Heading>
        <CalendarView />
      </VStack>
    </Container>
  );
};
