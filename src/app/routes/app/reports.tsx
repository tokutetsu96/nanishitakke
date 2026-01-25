import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackDivider,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useReports } from "@/features/reports/api/get-reports";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import type { WeeklyReport } from "@/features/reports/types";

export const ReportsRoute = () => {
  const { data: reports = [], isLoading } = useReports();
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpenReport = (report: WeeklyReport) => {
    setSelectedReport(report);
    onOpen();
  };

  if (isLoading) {
    return (
      <Center p={10}>
        <Spinner color="pink.500" />
      </Center>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            レポートアーカイブ
          </Heading>
          <Text color="gray.600">過去の週間レポートを振り返ります</Text>
        </Box>

        {reports.length === 0 ? (
          <Center p={10} bg="white" borderRadius="lg" shadow="sm">
            <Text color="gray.500">まだレポートが保存されていません</Text>
          </Center>
        ) : (
          <Card>
            <CardHeader>
              <Heading size="md">生成履歴</Heading>
            </CardHeader>
            <CardBody>
              <Stack divider={<StackDivider />} spacing="4">
                {reports.map((report) => (
                  <Box
                    key={report.id}
                    p={2}
                    _hover={{
                      bg: "gray.50",
                      cursor: "pointer",
                      borderRadius: "md",
                    }}
                    onClick={() => handleOpenReport(report)}
                  >
                    <Heading
                      size="xs"
                      textTransform="uppercase"
                      mb={1}
                      color="pink.500"
                    >
                      {format(parseISO(report.start_date), "yyyy/MM/dd")} -{" "}
                      {format(parseISO(report.end_date), "yyyy/MM/dd")}
                    </Heading>
                    <Text fontSize="sm" noOfLines={2}>
                      {report.content.split("\n")[0]}...
                    </Text>
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      作成日:{" "}
                      {format(parseISO(report.created_at), "yyyy/MM/dd HH:mm")}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Detail Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedReport &&
              `${format(parseISO(selectedReport.start_date), "MM/dd")} - ${format(parseISO(selectedReport.end_date), "MM/dd")} のレポート`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box whiteSpace="pre-wrap" fontSize="sm">
              {selectedReport?.content}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="pink" mr={3} onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};
