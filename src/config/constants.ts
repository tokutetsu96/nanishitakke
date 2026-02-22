export const ACTIVITY_CATEGORIES = {
  仕事: "blue",
  学習: "cyan",
  "生活・家事": "orange",
  食事: "yellow",
  "睡眠・休憩": "purple",
  "趣味・娯楽": "green",
  移動: "gray",
  ジム: "pink",
  その他: "teal",
} as const;

export type ActivityCategory = keyof typeof ACTIVITY_CATEGORIES;
