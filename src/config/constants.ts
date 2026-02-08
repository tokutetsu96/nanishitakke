export const ACTIVITY_CATEGORIES = {
  "仕事・学習": "blue",
  "生活・家事": "orange",
  "睡眠・休憩": "purple",
  "趣味・娯楽": "green",
  移動: "gray",
  その他: "teal",
  ジム: "pink",
} as const;

export type ActivityCategory = keyof typeof ACTIVITY_CATEGORIES;
