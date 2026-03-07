import { useState, forwardRef } from "react";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkMemoList } from "@/features/work-memos/components/work-memo-list";
import { AddWorkMemoModal } from "@/features/work-memos/components/add-work-memo-modal";
import type { WorkMemo } from "@/features/work-memos/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale/ja";
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

export const WorkMemosRoute = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [editingMemo, setEditingMemo] = useState<WorkMemo | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const handleMemoAdded = () => {};

  const handleEditMemo = (memo: WorkMemo) => {
    setEditingMemo(memo);
    onOpen();
  };

  const handleCloseModal = () => {
    setEditingMemo(null);
    onClose();
  };

  return (
    <>
      <div className="flex flex-col gap-8 py-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">仕事メモ</h2>
          <p className="text-gray-600">日々の仕事の振り返りを記録します</p>
        </div>

        <div className="flex items-center justify-between">
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
          <Button onClick={onOpen} size="sm">
            <Plus className="h-4 w-4" />
            記録する
          </Button>
        </div>

        <div className="w-full">
          <WorkMemoList
            onEditMemo={handleEditMemo}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>

      <AddWorkMemoModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onMemoAdded={handleMemoAdded}
        initialMemo={editingMemo}
      />
    </>
  );
};
