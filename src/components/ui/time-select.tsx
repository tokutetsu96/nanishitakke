import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const TimeSelect = ({ value, onChange, className }: TimeSelectProps) => {
  const [hour, minute] = value ? value.split(":") : ["", ""];

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    if (!newHour) {
      onChange("");
      return;
    }
    onChange(`${newHour}:${minute || "00"}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    if (!newMinute) {
      onChange("");
      return;
    }
    onChange(`${hour || "00"}:${newMinute}`);
  };

  const selectClassName =
    "h-10 rounded-2xl border border-input bg-background px-2 py-2 text-sm text-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 appearance-none";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <select
        className={cn(selectClassName, "flex-1")}
        value={hour}
        onChange={handleHourChange}
      >
        <option value="">--</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-sm font-medium">:</span>
      <select
        className={cn(selectClassName, "flex-1")}
        value={minute}
        onChange={handleMinuteChange}
      >
        <option value="">--</option>
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
};
