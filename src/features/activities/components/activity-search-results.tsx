import React, { useMemo } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/features/activities/types";
import { CuteBox } from "@/components/ui/cute-box";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import { useSearchActivities } from "@/features/activities/api/get-activities";
import {
  useDeleteActivityDialog,
  DeleteActivityDialog,
} from "@/features/activities/hooks/use-delete-activity-dialog";

interface ActivitySearchResultsProps {
  keyword?: string;
  tags?: string[];
  onEditActivity: (activity: Activity) => void;
}

const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return "";
  return timeString.slice(0, 5);
};

const groupByDate = (activities: Activity[]): Map<string, Activity[]> => {
  const grouped = new Map<string, Activity[]>();
  for (const activity of activities) {
    const existing = grouped.get(activity.date);
    if (existing) {
      existing.push(activity);
    } else {
      grouped.set(activity.date, [activity]);
    }
  }
  return grouped;
};

type BadgeVariant =
  | "pink"
  | "gray"
  | "blue"
  | "orange"
  | "purple"
  | "green"
  | "teal"
  | "red"
  | "yellow"
  | "cyan";

export const ActivitySearchResults = React.memo(
  ({ keyword, tags, onEditActivity }: ActivitySearchResultsProps) => {
    const {
      data: activities = [],
      isLoading,
      error,
    } = useSearchActivities({ keyword, tags });

    const {
      deleteMutation,
      activityIdToDelete,
      handleClickDelete,
      confirmDelete,
      isOpen,
      onClose,
    } = useDeleteActivityDialog();

    const grouped = useMemo(() => groupByDate(activities), [activities]);

    if (isLoading) {
      return (
        <div className="flex justify-center p-10">
          <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
        </div>
      );
    }

    if (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {errorMessage}
        </div>
      );
    }

    if (activities.length === 0) {
      return (
        <p className="p-10 text-center text-gray-500">
          検索条件に一致する活動はありません。
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          {activities.length}件の活動が見つかりました
        </p>
        {Array.from(grouped.entries()).map(([date, dateActivities]) => (
          <div key={date}>
            <p className="mb-2 text-sm font-bold text-gray-600">
              {format(parseISO(date), "yyyy/MM/dd (eee)", { locale: ja })}
            </p>
            <div className="flex flex-col gap-3">
              {dateActivities.map((activity) => (
                <CuteBox
                  key={activity.id}
                  className="cursor-pointer bg-white p-4"
                  onClick={() => onEditActivity(activity)}
                >
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="font-bold text-gray-700">
                        {formatTime(activity.start_time)} -{" "}
                        {formatTime(activity.end_time)}
                      </p>
                      <p className="whitespace-pre-wrap text-gray-600">
                        {activity.content}
                      </p>
                      {activity.tags && activity.tags.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {activity.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant={
                                (ACTIVITY_CATEGORIES[
                                  tag as keyof typeof ACTIVITY_CATEGORIES
                                ] as BadgeVariant) || "gray"
                              }
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      aria-label="Delete activity"
                      onClick={(e) => handleClickDelete(e, activity.id)}
                      isLoading={
                        deleteMutation.status === "pending" &&
                        activityIdToDelete === activity.id
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CuteBox>
              ))}
            </div>
          </div>
        ))}
        <DeleteActivityDialog
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={confirmDelete}
          isPending={deleteMutation.status === "pending"}
        />
      </div>
    );
  },
);
