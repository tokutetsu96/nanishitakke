/**
 * 活動の終了日を計算する
 * end_time が start_time より小さい場合（日付を跨ぐ活動）は翌日の日付を返す
 */
export const computeEndDate = (
  date: string,
  startTime: string,
  endTime?: string | null,
): string => {
  if (!endTime) return date;

  // "HH:MM" 文字列の比較: end_time < start_time なら翌日に跨ぐ
  if (endTime < startTime) {
    // タイムゾーン問題を避けるため UTC で計算する
    const [year, month, day] = date.split("-").map(Number);
    const d = new Date(Date.UTC(year, month - 1, day + 1));
    return d.toISOString().slice(0, 10);
  }

  return date;
};
