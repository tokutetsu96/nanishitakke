import { useState, useMemo } from "react";
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
import {
  format,
  parseISO,
  differenceInMinutes,
  differenceInDays,
  addDays,
} from "date-fns";
import { Loader2, Bot } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import "@/features/activities/components/activities.scss";
import { useActivities } from "@/features/activities/api/get-activities";
import { useWorkMemos } from "@/features/work-memos/api/get-work-memos";
import { generateContent } from "@/lib/gemini";
import { useCreateReport } from "@/features/reports/api/create-report";
import { useAuth } from "@/lib/auth";
import { Calendar } from "lucide-react";

// Chart.jsの登録
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

registerLocale("ja", ja);

export const DashboardRoute = () => {
  const { user } = useAuth();
  const createReport = useCreateReport();

  const [report, setReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(),
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
      (m) => Math.round((m / 60) * 10) / 10,
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
      (m) => Math.round((m / 60) * 10) / 10,
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
      toast.warning(
        "レポートを作成するための活動記録または仕事メモがありません。",
      );
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `以下の期間の活動記録と仕事メモをもとに、一週間の活動レポートを作成してください。
期間: ${startDate ? format(startDate, "yyyy/MM/dd") : ""} - ${endDate ? format(endDate, "yyyy/MM/dd") : ""}

## 活動記録
${activities
  .map(
    (a) =>
      `- ${a.date} ${a.start_time}~${a.end_time || ""}: ${a.content} (タグ: ${
        a.tags?.join(", ") || "なし"
      })`,
  )
  .join("\n")}

## 仕事メモ
${workMemos
  .map(
    (w) => `- ${w.date}:
  やったこと: ${w.done_text}
  詰まったこと: ${w.stuck_text || "なし"}
  原因: ${w.cause_text || "なし"}
  対策: ${w.improvement_text || "なし"}`,
  )
  .join("\n")}

レポートは以下の構成で、Markdown形式で出力してください。
1. 全体の振り返り（要約）
2. 日ごとのハイライト
3. 達成できたこと
4. 今後の課題と改善点

注意: 通勤時間については言及しないでください。
`;

      const result = await generateContent(prompt);
      setReport(result);

      // Save report
      if (user) {
        try {
          await createReport.mutateAsync({
            user_id: user.id,
            start_date: startDate
              ? format(startDate, "yyyy-MM-dd")
              : format(new Date(), "yyyy-MM-dd"),
            end_date: endDate
              ? format(endDate, "yyyy-MM-dd")
              : format(new Date(), "yyyy-MM-dd"),
            content: result,
          });
          toast.success("レポートをアーカイブに保存しました。");
        } catch (e) {
          console.error("Failed to save report:", e);
          // Don't block the user from seeing the report even if save fails
          toast.warning(
            "レポートの表示は成功しましたが、アーカイブへの保存に失敗しました。",
          );
        }
      }
    } catch (error: unknown) {
      console.error("Report generation error:", error);
      toast.error(
        `レポートの生成に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <h2 className="text-2xl font-bold">ダッシュボード</h2>

      <div className="flex flex-col md:flex-row justify-end gap-2">
        <Button
          onClick={() => setDateRange([new Date(), new Date()])}
          variant={isTodaySelected ? "default" : "outline"}
          className={
            !isTodaySelected
              ? "bg-white border-gray-200 hover:bg-gray-100 w-full md:w-auto"
              : "w-full md:w-auto"
          }
        >
          今日
        </Button>
        <div className="relative w-full md:w-[300px]">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            locale="ja"
            dateFormat="yyyy/MM/dd"
            customInput={
              <Input
                className="bg-white border-gray-200 text-center cursor-pointer pr-10"
              />
            }
            wrapperClassName="datepicker-full-width"
            portalId="react-datepicker-portal"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Report Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            AI 週間レポート
          </h3>
          <Button
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white"
            onClick={handleGenerateReport}
            isLoading={isGenerating}
            loadingText="生成中..."
          >
            レポートを生成
          </Button>
        </div>
        {report && (
          <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm">
            {report}
          </div>
        )}
        {!report && !isGenerating && (
          <p className="text-gray-400 text-sm">
            「レポートを生成」ボタンを押すと、表示中の期間のデータをもとにAIが振り返りを作成します。
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">記録数</p>
                  <p className="text-2xl font-bold">{summary.totalActivities}</p>
                  <p className="text-xs text-muted-foreground">件</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">総活動時間</p>
                  <p className="text-2xl font-bold">{summary.totalTime}</p>
                  <p className="text-xs text-muted-foreground">時間</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">平均活動時間</p>
                  <p className="text-2xl font-bold">{summary.averageTime}</p>
                  <p className="text-xs text-muted-foreground">分/回</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-center">
                カテゴリ別割合
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                {categoryData.labels.length > 0 ? (
                  <Pie
                    data={categoryData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: "#718096" },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400">データがありません</p>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-center">
                日別活動時間
              </h3>
              <div className="h-[300px]">
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
                          color: "#718096",
                        },
                        grid: { color: "#E2E8F0" },
                        ticks: { color: "#718096" },
                      },
                      x: {
                        grid: { color: "#E2E8F0" },
                        ticks: { color: "#718096" },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
