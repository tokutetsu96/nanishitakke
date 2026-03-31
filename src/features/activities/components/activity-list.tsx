import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/features/activities/types";
import { CuteBox } from "@/components/ui/cute-box";
import { ACTIVITY_CATEGORIES } from "@/config/constants";
import { useActivities } from "@/features/activities/api/get-activities";
import {
  useDeleteActivityDialog,
  DeleteActivityDialog,
} from "@/features/activities/hooks/use-delete-activity-dialog";

interface ActivityListProps {
  selectedDate: string;
  onEditActivity: (activity: Activity) => void;
}

const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return "";

  return timeString.slice(0, 5);
};

export const ActivityList = React.memo(
  ({ selectedDate, onEditActivity }: ActivityListProps) => {
    // Data Fetching
    const {
      data: activities = [],
      isLoading: loading,
      error: queryError,
    } = useActivities({ date: selectedDate });

    // Mutation
    const {
      deleteMutation,
      activityIdToDelete,
      handleClickDelete,
      confirmDelete,
      isOpen,
      onClose,
    } = useDeleteActivityDialog();

    if (loading) {
      return (
        <div className="flex justify-center p-10">
          <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
        </div>
      );
    }

    if (queryError) {
      const errorMessage =
        queryError instanceof Error ? queryError.message : String(queryError);
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {errorMessage}
        </div>
      );
    }

    if (activities.length === 0) {
      return (
        <p className="p-10 text-center text-gray-500">
          指定した日付の記録はありません。
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {activities.map((activity) => (
          <CuteBox
            key={activity.id}
            className="cursor-pointer bg-white p-4"
            onClick={() => onEditActivity(activity)}
          >
            <div className="flex items-center">
              <div className="flex-1">
                <p className="font-bold text-gray-700">
                  {activity.date !== selectedDate && (
                    <span className="mr-1 text-xs font-normal text-blue-500">
                      前日から
                    </span>
                  )}
                  {formatTime(activity.start_time)} -{" "}
                  {formatTime(activity.end_time)}
                  {activity.end_date !== selectedDate && (
                    <span className="ml-1 text-xs font-normal text-blue-500">
                      翌日へ
                    </span>
                  )}
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
