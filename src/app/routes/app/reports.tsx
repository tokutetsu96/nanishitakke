import {
  Box,
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
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useReports } from "@/features/reports/api/get-reports";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale/ja";
import { useState, forwardRef } from "react";
import type { WeeklyReport } from "@/features/reports/types";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("ja", ja);

const MonthPickerButton = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void }
>(({ value, onClick }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    style={{
      fontWeight: "bold",
      fontSize: "1.125rem",
      minWidth: "140px",
      textAlign: "center",
      cursor: "pointer",
      background: "none",
      border: "none",
      padding: 0,
    }}
  >
    {value}
  </button>
));

export const ReportsRoute = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { data: reports = [], isLoading } = useReports({ startDate, endDate });
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
    <VStack spacing={8} align="stretch" py={4}>
        <Box>
          <Heading size="lg" mb={2}>
            レポートアーカイブ
          </Heading>
          <Text color="gray.600">過去の週間レポートを振り返ります</Text>
        </Box>

        <HStack spacing={2}>
          <IconButton
            aria-label="前の月"
            icon={<ChevronLeftIcon boxSize={5} />}
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          />
          <Box>
            <DatePicker
              selected={currentMonth}
              onChange={(date: Date | null) => date && setCurrentMonth(date)}
              showMonthYearPicker
              dateFormat="yyyy年M月"
              locale="ja"
              customInput={<MonthPickerButton />}
              portalId="react-datepicker-portal"
            />
          </Box>
          <IconButton
            aria-label="次の月"
            icon={<ChevronRightIcon boxSize={5} />}
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          />
        </HStack>

        {reports.length === 0 ? (
          <Center p={10} bg="white" borderRadius="lg" shadow="sm">
            <Text color="gray.500">この月のレポートはありません</Text>
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
    </VStack>
  );
};
