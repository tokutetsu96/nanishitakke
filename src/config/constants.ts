export const ACTIVITY_CATEGORIES = {
  仕事: "blue",
  学習: "cyan",
  生活: "orange",
  家事: "red",
  食事: "yellow",
  睡眠: "purple",
  休憩: "teal",
  趣味: "green",
  娯楽: "pink",
  移動: "gray",
  ジム: "pink",
  その他: "teal",
} as const;

export type ActivityCategory = keyof typeof ACTIVITY_CATEGORIES;

export const CATEGORY_COLOR_CODES: Record<string, string> = {
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
