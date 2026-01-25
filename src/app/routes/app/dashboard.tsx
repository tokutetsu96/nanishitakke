import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Center,
  Spinner,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import DatePicker, { registerLocale } from "react-datepicker";
import { ja } from "date-fns/locale/ja";
import "react-datepicker/dist/react-datepicker.css";

import { ACTIVITY_CATEGORIES } from "@/config/constants";

import {
  subDays,
  format,
  parseISO,
  differenceInMinutes,
  differenceInDays,
  addDays,
} from "date-fns";
import "@/features/activities/components/activities.scss";
import { useActivities } from "@/features/activities/api/get-activities";
import { useNavigate } from "react-router-dom";
import { useWorkMemos } from "@/features/work-memos/api/get-work-memos";
import { AddActivityModal } from "@/features/activities/components/add-activity-modal";
import { generateContent } from "@/lib/gemini";
import { FaRobot, FaCalendarPlus, FaBriefcase } from "react-icons/fa";

// Chart.jsの登録
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

registerLocale("ja", ja);

export const DashboardRoute = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    isOpen: isActivityOpen,
    onOpen: onOpenActivity,
    onClose: onCloseActivity,
  } = useDisclosure();

  const [report, setReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 6),
    new Date(),
  ]);
  const [startDate, endDate] = dateRange;

  const { data: activities = [], isLoading: loading } = useActivities({
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  const { data: workMemos = [] } = useWorkMemos({
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        onOpenActivity();
      }
      if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        navigate("/app/work-memos");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, onOpenActivity]);

  const { categoryData, dailyData, summary } = useMemo(() => {
    const categoryMinutes: Record<string, number> = {};
    const dailyMinutes: Record<string, number> = {};
    let totalMinutes = 0;

    // 初期化: 選択範囲のすべての日付を0で埋める
    if (startDate && endDate) {
      const daysDiff = differenceInDays(endDate, startDate);
      for (let i = 0; i <= daysDiff; i++) {
        const date = format(addDays(startDate, i), "MM/dd");
        dailyMinutes[date] = 0;
      }
    }

    activities.forEach((activity) => {
      // 時間計算
      if (activity.start_time && activity.end_time) {
        // 日付またぎの考慮は簡易的に無視（同日と仮定）
        const start = parseISO(`2000-01-01T${activity.start_time}`); // 日付部分はダミー
        const end = parseISO(`2000-01-01T${activity.end_time}`);
        let diff = differenceInMinutes(end, start);
        if (diff < 0) diff += 24 * 60; // 日付またぎ対応(簡易)

        totalMinutes += diff;

        const dateKey = format(parseISO(activity.date), "MM/dd");
        if (dailyMinutes[dateKey] !== undefined) {
          dailyMinutes[dateKey] += diff;
        }

        // カテゴリ集計 (タグベース) - 時間を加算
        if (activity.tags && activity.tags.length > 0) {
          activity.tags.forEach((tag) => {
            categoryMinutes[tag] = (categoryMinutes[tag] || 0) + diff;
          });
        } else {
          categoryMinutes["未分類"] = (categoryMinutes["未分類"] || 0) + diff;
        }
      }
    });

    // 円グラフ用データ
    const labels = Object.keys(categoryMinutes);
    const data = Object.values(categoryMinutes).map(
      (m) => Math.round((m / 60) * 10) / 10
    ); // 時間単位に変換
    const bgColors = labels.map((label) => {
      const colorName =
        ACTIVITY_CATEGORIES[label as keyof typeof ACTIVITY_CATEGORIES];
      // Chakra UIの色名から実際の色コードへの簡易マッピング
      const colorMap: Record<string, string> = {
        blue: "#3182CE",
        orange: "#DD6B20",
        purple: "#805AD5",
        green: "#38A169",
        gray: "#718096",
        teal: "#319795",
        pink: "#D53F8C",
        red: "#E53E3E",
        yellow: "#D69E2E",
        cyan: "#00B5D8",
      };
      return colorMap[colorName] || "#CBD5E0";
    });

    // 棒グラフ用データ (日付順)
    const barLabels = Object.keys(dailyMinutes);
    const barData = Object.values(dailyMinutes).map(
      (m) => Math.round((m / 60) * 10) / 10
    ); // 時間単位に変換

    return {
      categoryData: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: bgColors,
            borderWidth: 1,
          },
        ],
      },
      dailyData: {
        labels: barLabels,
        datasets: [
          {
            label: "活動時間 (時間)",
            data: barData,
            backgroundColor: "#D53F8C", // pink.500
          },
        ],
      },
      summary: {
        totalActivities: activities.length,
        totalTime: Math.round((totalMinutes / 60) * 10) / 10,
        averageTime: activities.length
          ? Math.round(totalMinutes / activities.length)
          : 0,
      },
    };
  }, [activities, startDate, endDate]);

  const isTodaySelected = useMemo(() => {
    if (!startDate || !endDate) return false;
    const today = format(new Date(), "yyyy-MM-dd");
    return (
      format(startDate, "yyyy-MM-dd") === today &&
      format(endDate, "yyyy-MM-dd") === today
    );
  }, [startDate, endDate]);

  const handleGenerateReport = async () => {
    if (activities.length === 0 && workMemos.length === 0) {
      toast({
        title: "データがありません",
        description:
          "レポートを作成するための活動記録または作業メモがありません。",
        status: "warning",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `以下の期間の活動記録と作業メモをもとに、一週間の活動レポートを作成してください。
期間: ${startDate ? format(startDate, "yyyy/MM/dd") : ""} - ${endDate ? format(endDate, "yyyy/MM/dd") : ""}

## 活動記録
${activities
  .map(
    (a) =>
      `- ${a.date} ${a.start_time}~${a.end_time || ""}: ${a.content} (タグ: ${
        a.tags?.join(", ") || "なし"
      })`
  )
  .join("\n")}

## 作業メモ
${workMemos
  .map(
    (w) => `- ${w.date}:
  やったこと: ${w.done_text}
  詰まったこと: ${w.stuck_text || "なし"}
  原因: ${w.cause_text || "なし"}
  対策: ${w.improvement_text || "なし"}`
  )
  .join("\n")}

レポートは以下の構成で、Markdown形式で出力してください。
1. 全体の振り返り（要約）
2. 日ごとのハイライト
3. 達成できたこと
4. 今後の課題と改善点
`;

      const result = await generateContent(prompt);
      setReport(result);
    } catch (error: unknown) {
      console.error("Report generation error:", error);
      toast({
        title: "エラー",
        description: `レポートの生成に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Heading size="lg" mb={2}>
              ダッシュボード
            </Heading>
            <Text color="gray.600">
              ショートカット: (A) 活動記録, (W) 作業メモ
            </Text>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              leftIcon={<Icon as={FaCalendarPlus} />}
              colorScheme="teal"
              onClick={onOpenActivity}
            >
              活動を記録 (A)
            </Button>
            <Button
              leftIcon={<Icon as={FaBriefcase} />}
              colorScheme="blue"
              onClick={() => navigate("/app/work-memos")}
            >
              作業メモ (W)
            </Button>
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            onClick={() => setDateRange([new Date(), new Date()])}
            colorScheme={isTodaySelected ? "pink" : "gray"}
            variant={isTodaySelected ? "solid" : "outline"}
            bg={isTodaySelected ? undefined : "white"}
            borderColor={isTodaySelected ? undefined : "gray.200"}
            _hover={{ bg: isTodaySelected ? "pink.600" : "gray.50" }}
          >
            今日
          </Button>
          <Box w="300px">
            <InputGroup>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                locale="ja"
                dateFormat="yyyy/MM/dd"
                customInput={
                  <Input bg="white" textAlign="center" cursor="pointer" />
                }
                wrapperClassName="datepicker-full-width"
                portalId="react-datepicker-portal"
              />
              <InputRightElement pointerEvents="none">
                <CalendarIcon color="gray.500" />
              </InputRightElement>
            </InputGroup>
          </Box>
        </Box>

        {/* Report Section */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Heading size="md" display="flex" alignItems="center" gap={2}>
              <Icon as={FaRobot} color="purple.500" />
              AI 週間レポート
            </Heading>
            <Button
              size="sm"
              colorScheme="purple"
              onClick={handleGenerateReport}
              isLoading={isGenerating}
              loadingText="生成中..."
            >
              レポートを生成
            </Button>
          </Box>
          {report && (
            <Box
              bg="gray.50"
              p={4}
              borderRadius="md"
              whiteSpace="pre-wrap"
              fontSize="sm"
            >
              {report}
            </Box>
          )}
          {!report && !isGenerating && (
            <Text color="gray.400" fontSize="sm">
              「レポートを生成」ボタンを押すと、表示中の期間のデータをもとにAIが振り返りを作成します。
            </Text>
          )}
        </Box>

        {loading ? (
          <Center h="50vh">
            <Spinner color="pink.500" size="xl" />
          </Center>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>記録数</StatLabel>
                    <StatNumber>{summary.totalActivities}</StatNumber>
                    <StatHelpText>件</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>総活動時間</StatLabel>
                    <StatNumber>{summary.totalTime}</StatNumber>
                    <StatHelpText>時間</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>平均活動時間</StatLabel>
                    <StatNumber>{summary.averageTime}</StatNumber>
                    <StatHelpText>分/回</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Charts ... */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                <Heading size="md" mb={4} textAlign="center">
                  カテゴリ別割合
                </Heading>
                <Box
                  h="300px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {categoryData.labels.length > 0 ? (
                    <Pie
                      data={categoryData}
                      options={{ maintainAspectRatio: false }}
                    />
                  ) : (
                    <Text color="gray.400">データがありません</Text>
                  )}
                </Box>
              </Box>
              <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                <Heading size="md" mb={4} textAlign="center">
                  日別活動時間
                </Heading>
                <Box h="300px">
                  <Bar
                    data={dailyData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "時間",
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            </SimpleGrid>
          </>
        )}
      </VStack>

      <AddActivityModal
        isOpen={isActivityOpen}
        onClose={onCloseActivity}
        onActivityAdded={() => {
          // Refetch if necessary. React Query should handle it if invalidation is set up in useCreateActivity.
        }}
        initialActivity={null}
      />
    </Container>
  );
};
