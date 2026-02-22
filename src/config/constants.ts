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
