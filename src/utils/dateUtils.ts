// src/utils/dateUtils.ts

export const formatDateWithDay = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString; // Return original string if invalid date
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dayOfWeek = new Intl.DateTimeFormat('ja-JP', { weekday: 'short' }).format(date);

  return `${year}/${month}/${day} (${dayOfWeek})`;
};
