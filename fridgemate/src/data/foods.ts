import { Food } from "@/types/food";

export const FOODS_DATA: Food[] = [
  // 冰箱食材
  {
    id: 1,
    name: "鸡蛋",
    count: 6,
    expire: "8天",
    category: "other",
    zone: "fridge",
  },
  {
    id: 2,
    name: "牛奶",
    count: 1,
    expire: "1天",
    category: "drink",
    zone: "fridge",
  },
  {
    id: 3,
    name: "番茄",
    count: 3,
    expire: "5天",
    category: "vegetable",
    zone: "fridge",
  },
  {
    id: 4,
    name: "苹果",
    count: 5,
    expire: "15天",
    category: "fruit",
    zone: "fridge",
  },
  {
    id: 5,
    name: "菠菜",
    count: 2,
    expire: "3天",
    category: "vegetable",
    zone: "fridge",
  },
  {
    id: 6,
    name: "面包",
    count: 1,
    expire: "2天",
    category: "grain",
    zone: "fridge",
  },
  {
    id: 7,
    name: "鱼",
    count: 2,
    expire: "2天",
    category: "seafood",
    zone: "fridge",
  },
  {
    id: 8,
    name: "鸡肉",
    count: 1,
    expire: "4天",
    category: "meat",
    zone: "fridge",
  },

  // 冷冻层食材
  {
    id: 9,
    name: "香蕉",
    count: 4,
    expire: "30天",
    category: "fruit",
    zone: "freeze",
  },
  {
    id: 10,
    name: "牛肉",
    count: 1,
    expire: "60天",
    category: "meat",
    zone: "freeze",
  },
  {
    id: 11,
    name: "虾",
    count: 10,
    expire: "45天",
    category: "seafood",
    zone: "freeze",
  },
  {
    id: 12,
    name: "玉米",
    count: 3,
    expire: "90天",
    category: "vegetable",
    zone: "freeze",
  },
  {
    id: 13,
    name: "冰淇淋",
    count: 1,
    expire: "120天",
    category: "other",
    zone: "freeze",
  },
  {
    id: 14,
    name: "豌豆",
    count: 2,
    expire: "90天",
    category: "vegetable",
    zone: "freeze",
  },
];

// Emoji 映射表
export const EMOJI_MAP: Record<string, string> = {
  鸡蛋: "🥚",
  牛奶: "🥛",
  番茄: "🍅",
  苹果: "🍎",
  菠菜: "🥬",
  面包: "🍞",
  香蕉: "🍌",
  鱼: "🐟",
  鸡肉: "🍗",
  牛肉: "🥩",
  虾: "🦐",
  玉米: "🌽",
  冰淇淋: "🍦",
  豌豆: "🫛",
};

// 按类别的 Emoji 映射
export const CATEGORY_EMOJI_MAP: Record<string, string> = {
  vegetable: "🥬",
  fruit: "🍎",
  meat: "🍖",
  drink: "🥤",
  seafood: "🐟",
  grain: "🌾",
  other: "🍽",
};

export function getFoodEmoji(name: string, category: string): string {
  // 优先使用具体食材 emoji
  if (EMOJI_MAP[name]) {
    return EMOJI_MAP[name];
  }
  // 其次使用类别 emoji
  if (CATEGORY_EMOJI_MAP[category]) {
    return CATEGORY_EMOJI_MAP[category];
  }
  // 默认 emoji
  return "🍽";
}
