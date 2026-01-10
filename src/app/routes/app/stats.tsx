import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  SimpleGrid,
  Select,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Center,
  Spinner,
} from "@chakra-ui/react";
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
} from "date-fns";

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

export const StatsRoute = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7"); // デフォルトは過去7日間

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const endDate = endOfDay(new Date());
        const startDate = startOfDay(subDays(new Date(), parseInt(period) - 1));

        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", format(startDate, "yyyy-MM-dd"))
          .lte("date", format(endDate, "yyyy-MM-dd"));

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
  }, [user?.id, period]);

  const { categoryData, dailyData, summary } = useMemo(() => {
    const categoryMinutes: Record<string, number> = {};
    const dailyMinutes: Record<string, number> = {};
    let totalMinutes = 0;

    // 初期化
    const days = parseInt(period);
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), "MM/dd");
      dailyMinutes[date] = 0;
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
          // タグが複数ある場合は単純に等分するか、全てに加算するかだが、
          // ここでは重複計上を許容して全てに加算する方針（または最初のタグのみ等の仕様次第だが、
          // 総時間と合わなくなるので、各タグに時間を加算する形にする。
          // ただし円グラフで合計が総時間と合わない可能性が出るため、
          // シンプルに「タグごとの累積時間」として扱う）
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
      // Chakra UIの色名から実際の色コードへの簡易マッピング (本来はthemeから取得すべきだが簡易実装)
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

    // 棒グラフ用データ (日付順にソート)
    // subDaysで作ったキー順序は新しい順なので、逆順（古い順）にする
    const barLabels = Object.keys(dailyMinutes).reverse();
    const barData = Object.values(dailyMinutes)
      .reverse()
      .map((m) => Math.round((m / 60) * 10) / 10); // 時間単位に変換

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
  }, [activities, period]);

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner color="pink.500" size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            統計レポート
          </Heading>
          <Text color="gray.600">あなたの活動傾向を可視化します</Text>
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <Select
            w="200px"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            bg="white"
          >
            <option value="7">過去7日間</option>
            <option value="30">過去30日間</option>
            <option value="90">過去3ヶ月</option>
          </Select>
        </Box>

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
      </VStack>
    </Container>
  );
};
