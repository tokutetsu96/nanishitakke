import { CalendarView } from "@/features/calendar/components/CalendarView";

export const CalendarRoute = () => {
  return (
    <div className="flex flex-col gap-8 py-4">
      <h2 className="text-2xl font-bold">カレンダー</h2>
      <CalendarView />
    </div>
  );
};
