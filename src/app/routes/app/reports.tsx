import { useDisclosure } from "@/hooks/use-disclosure";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
    className="font-bold text-lg min-w-[140px] text-center cursor-pointer bg-transparent border-none p-0"
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
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* header section */}
      <div>
        <h2 className="text-2xl font-bold mb-2">レポートアーカイブ</h2>
        <p className="text-gray-600">過去の週間レポートを振り返ります</p>
      </div>

      {/* month navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="前の月"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <DatePicker
            selected={currentMonth}
            onChange={(date: Date | null) => date && setCurrentMonth(date)}
            showMonthYearPicker
            dateFormat="yyyy年M月"
            locale="ja"
            customInput={<MonthPickerButton />}
            portalId="react-datepicker-portal"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="次の月"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* report list or empty state */}
      {reports.length === 0 ? (
        <div className="flex justify-center items-center p-10 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">この月のレポートはありません</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">生成履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-2 hover:bg-gray-50 hover:cursor-pointer hover:rounded-md"
                  onClick={() => handleOpenReport(report)}
                >
                  <h4 className="text-xs font-bold uppercase mb-1 text-pink-500">
                    {format(parseISO(report.start_date), "yyyy/MM/dd")} -{" "}
                    {format(parseISO(report.end_date), "yyyy/MM/dd")}
                  </h4>
                  <p className="text-sm line-clamp-2">
                    {report.content.split("\n")[0]}...
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    作成日:{" "}
                    {format(parseISO(report.created_at), "yyyy/MM/dd HH:mm")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* detail Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport &&
                `${format(parseISO(selectedReport.start_date), "MM/dd")} - ${format(parseISO(selectedReport.end_date), "MM/dd")} のレポート`}
            </DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm">
            {selectedReport?.content}
          </div>
          <DialogFooter>
            <Button className="mr-3" onClick={onClose}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
