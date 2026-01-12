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
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { useState, useEffect, useMemo } from "react";
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
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import type { Activity } from "@/features/activities/types";
import {
  subDays,
  startOfDay,
  endOfDay,
  format,
  parseISO,
  differenceInMinutes,
  differenceInDays,
  addDays,
} from "date-fns";
import "./activities.scss";

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
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 6),
    new Date(),
  ]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      // 両方の日付が選択されていない場合はスキップ（またはstartDateのみで取得などの仕様も可だが、範囲指定完了を待つ）
      if (!startDate || !endDate) return;

      setLoading(true);
      try {
        const queryEndDate = endOfDay(endDate);
        const queryStartDate = startOfDay(startDate);

        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", format(queryStartDate, "yyyy-MM-dd"))
          .lte("date", format(queryEndDate, "yyyy-MM-dd"));

        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, startDate, endDate]);

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

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            統計レポート
          </Heading>
          <Text color="gray.600">あなたの活動傾向を可視化します</Text>
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
    </Container>
  );
};
