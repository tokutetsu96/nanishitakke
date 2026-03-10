import { useState, useMemo } from "react";
import Calendar from "react-calendar";
import { Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivities } from "@/features/activities/api/get-activities";
import type { Activity } from "@/features/activities/types";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import "react-calendar/dist/Calendar.css";

// Category colors for calendar tile dots
const CATEGORY_COLORS: Record<string, string> = {
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

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());

  // Calculate start and end of the currently viewed month
  const startDate = useMemo(
    () => format(startOfMonth(activeStartDate), "yyyy-MM-dd"),
    [activeStartDate],
  );
  const endDate = useMemo(
    () => format(endOfMonth(activeStartDate), "yyyy-MM-dd"),
    [activeStartDate],
  );

  // Fetch activities for the current month
  const { data: activities = [], isLoading } = useActivities({
    startDate,
    endDate,
  });

  // Group activities by date for easy lookup
  // 日付跨ぎ活動は start date と end_date の両方にグループ化する
  const activitiesByDate = useMemo(() => {
    const grouped: Record<string, Activity[]> = {};
    activities.forEach((activity) => {
      if (!grouped[activity.date]) {
        grouped[activity.date] = [];
      }
      grouped[activity.date].push(activity);

      // end_date が date と異なる場合（日付跨ぎ）は終了日にも追加
      if (activity.end_date && activity.end_date !== activity.date) {
        if (!grouped[activity.end_date]) {
          grouped[activity.end_date] = [];
        }
        grouped[activity.end_date].push(activity);
      }
    });
    return grouped;
  }, [activities]);

  // Selected date's activities
  const selectedDateActivities = useMemo(() => {
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return activitiesByDate[dateKey] || [];
  }, [activitiesByDate, selectedDate]);

  const onDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    }
  };

  const onActiveDateChange = ({
    activeStartDate,
  }: {
    activeStartDate: Date | null;
  }) => {
    if (activeStartDate) {
      setActiveStartDate(activeStartDate);
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const dateKey = format(date, "yyyy-MM-dd");
      const dayActivities = activitiesByDate[dateKey];

      if (dayActivities && dayActivities.length > 0) {
        return (
          <div className="activity-dot-container">
            {dayActivities.slice(0, 5).map((activity, index) => {
              // Determine color based on first tag or default
              let color = "#cbd5e0"; // default gray
              if (activity.tags && activity.tags.length > 0) {
                const category = activity.tags[0];
                const colorName =
                  ACTIVITY_CATEGORIES[
                    category as keyof typeof ACTIVITY_CATEGORIES
                  ];
                if (colorName) {
                  color = CATEGORY_COLORS[colorName] || color;
                }
              }
              return (
                <div
                  key={index}
                  className="activity-dot"
                  style={{ backgroundColor: color }}
                />
              );
            })}
            {dayActivities.length > 5 && (
              <div
                className="activity-dot"
                style={{ backgroundColor: "#718096" }}
              />
            )}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <Calendar
            onChange={onDateChange}
            value={selectedDate}
            locale="ja-JP"
            calendarType="gregory"
            onActiveStartDateChange={onActiveDateChange}
            tileContent={tileContent}
          />
        </CardContent>
      </Card>

      <h3 className="text-lg font-semibold mb-4">
        {format(selectedDate, "yyyy年M月d日 (E)", { locale: ja })} の活動
      </h3>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
        </div>
      ) : selectedDateActivities.length > 0 ? (
        <div className="flex flex-col gap-4">
          {selectedDateActivities.map((activity) => (
            <Card key={activity.id} className="border">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="font-bold">{activity.content}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="gray">
                        {activity.start_time.slice(0, 5)} -{" "}
                        {activity.end_time?.slice(0, 5)}
                      </Badge>
                      {activity.tags?.map((tag) => {
                        const color =
                          ACTIVITY_CATEGORIES[
                            tag as keyof typeof ACTIVITY_CATEGORIES
                          ] || "gray";
                        return (
                          <Badge
                            key={tag}
                            variant={
                              color as
                                | "pink"
                                | "gray"
                                | "blue"
                                | "orange"
                                | "purple"
                                | "green"
                                | "teal"
                                | "red"
                                | "yellow"
                                | "cyan"
                            }
                          >
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">この日の活動記録はありません。</p>
      )}
    </div>
  );
};
