import { useState, useMemo } from "react";
import Calendar from "react-calendar";
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { useActivities } from "@/features/activities/api/get-activities";
import type { Activity } from "@/features/activities/types";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import "./calendar.scss";

// Chakra UI colors for categories (matching dashboard)
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
  const activitiesByDate = useMemo(() => {
    const grouped: Record<string, Activity[]> = {};
    activities.forEach((activity) => {
      // activity.date is typically YYYY-MM-DD
      if (!grouped[activity.date]) {
        grouped[activity.date] = [];
      }
      grouped[activity.date].push(activity);
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
    <Box>
      <Card mb={6}>
        <CardBody>
          <Calendar
            onChange={onDateChange}
            value={selectedDate}
            locale="ja-JP"
            calendarType="gregory"
            onActiveStartDateChange={onActiveDateChange}
            tileContent={tileContent}
          />
        </CardBody>
      </Card>

      <Heading size="md" mb={4}>
        {format(selectedDate, "yyyy年M月d日 (E)", { locale: ja })} の活動
      </Heading>

      {isLoading ? (
        <Center py={10}>
          <Spinner color="pink.500" />
        </Center>
      ) : selectedDateActivities.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {selectedDateActivities.map((activity) => (
            <Card key={activity.id} variant="outline">
              <CardBody py={3} px={4}>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="bold">{activity.content}</Text>
                    <HStack spacing={2}>
                      <Badge variant="subtle" colorScheme="gray">
                        {activity.start_time.slice(0, 5)} -{" "}
                        {activity.end_time?.slice(0, 5)}
                      </Badge>
                      {activity.tags?.map((tag) => {
                        const color =
                          ACTIVITY_CATEGORIES[
                            tag as keyof typeof ACTIVITY_CATEGORIES
                          ] || "gray";
                        return (
                          <Badge key={tag} colorScheme={color}>
                            {tag}
                          </Badge>
                        );
                      })}
                    </HStack>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      ) : (
        <Text color="gray.500">この日の活動記録はありません。</Text>
      )}
    </Box>
  );
};
