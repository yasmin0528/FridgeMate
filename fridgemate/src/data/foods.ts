import { Food } from "@/types/food";

export const FOODS_DATA: Food[] = [
  // ─── 冷藏层：蔬菜 ───
  {
    id: "1",
    name: "鸡蛋",
    count: 6,
    expire: "8天",
    category: "other",
    zone: "fridge",
  },
  {
    id: "2",
    name: "牛奶",
    count: 1,
    expire: "1天",
    category: "drink",
    zone: "fridge",
  },
  {
    id: "3",
    name: "番茄",
    count: 3,
    expire: "5天",
    category: "vegetable",
    zone: "fridge",
  },
  {
    id: "4",
    name: "苹果",
    count: 5,
    expire: "15天",
    category: "fruit",
    zone: "fridge",
  },
  {
    id: "5",
    name: "菠菜",
    count: 2,
    expire: "3天",
    category: "vegetable",
    zone: "fridge",
  },
  {
    id: "6",
    name: "面包",
    count: 1,
    expire: "2天",
    category: "grain",
    zone: "fridge",
  },
  {
    id: "7",
    name: "鲈鱼",
    count: 1,
    expire: "2天",
    category: "seafood",
    zone: "fridge",
  },
  {
    id: "8",
    name: "鸡胸肉",
    count: 2,
    expire: "4天",
    category: "meat",
    zone: "fridge",
  },

  // ─── 冷藏层：更多蔬菜 ───
  {
    id: "15",
    name: "西兰花",
    count: 2,
    expire: "5天",
    category: "vegetable",
    zone: "fridge",
  },
  {
    id: "16",
    name: "黄瓜",
    count: 3,
    expire: "7天",
    category: "vegetable",
    zone: "fridge",
  },
  {
    id: "17",
    name: "青椒",
    count: 3,
    expire: "7天",
    category: "vegetable",
    zone: "fridge",
  },
  {
    id: "18",
    name: "胡萝卜",
    count: 2,
    expire: "21天",
    category: "vegetable",
    zone: "fridge",
  },
  {
    id: "19",
    name: "土豆",
    count: 4,
    expire: "30天",
    category: "vegetable",
    zone: "fridge",
  },
  {
    id: "20",
    name: "香菇",
    count: 5,
    expire: "5天",
    category: "vegetable",
    zone: "fridge",
  },
  {
    id: "21",
    name: "豆腐",
    count: 2,
    expire: "5天",
    category: "protein",
    zone: "fridge",
  },
  {
    id: "22",
    name: "酸奶",
    count: 3,
    expire: "14天",
    category: "drink",
    zone: "fridge",
  },
  {
    id: "23",
    name: "奶酪",
    count: 1,
    expire: "21天",
    category: "drink",
    zone: "fridge",
  },
  {
    id: "24",
    name: "猪肉",
    count: 1,
    expire: "3天",
    category: "meat",
    zone: "fridge",
  },

  // ─── 冷冻层食材 ───
  {
    id: "9",
    name: "香蕉",
    count: 4,
    expire: "30天",
    category: "fruit",
    zone: "freeze",
  },
  {
    id: "10",
    name: "牛肉",
    count: 2,
    expire: "60天",
    category: "meat",
    zone: "freeze",
  },
  {
    id: "11",
    name: "虾",
    count: 10,
    expire: "45天",
    category: "seafood",
    zone: "freeze",
  },
  {
    id: "12",
    name: "玉米",
    count: 3,
    expire: "90天",
    category: "vegetable",
    zone: "freeze",
  },
  {
    id: "13",
    name: "冰淇淋",
    count: 1,
    expire: "120天",
    category: "other",
    zone: "freeze",
  },
  {
    id: "14",
    name: "豌豆",
    count: 2,
    expire: "90天",
    category: "vegetable",
    zone: "freeze",
  },
  {
    id: "25",
    name: "排骨",
    count: 2,
    expire: "90天",
    category: "meat",
    zone: "freeze",
  },
  {
    id: "26",
    name: "鸡腿肉",
    count: 2,
    expire: "60天",
    category: "meat",
    zone: "freeze",
  },
  {
    id: "27",
    name: "牛腩",
    count: 1,
    expire: "90天",
    category: "meat",
    zone: "freeze",
  },
  {
    id: "28",
    name: "羊肉",
    count: 1,
    expire: "90天",
    category: "meat",
    zone: "freeze",
  },
  {
    id: "29",
    name: "蓝莓",
    count: 1,
    expire: "180天",
    category: "fruit",
    zone: "freeze",
  },
];

// Emoji 映射表
export const EMOJI_MAP: Record<string, string> = {
  // ─── 蛋白质 ───
  鸡胸肉: "🍗",
  鸡腿肉: "🍗",
  鸡蛋: "🥚",
  牛肉: "🥩",
  牛腩: "🥩",
  猪里脊: "🥓",
  五花肉: "🥓",
  排骨: "🍖",
  肉馅: "🥩",
  羊肉: "🍖",
  鲈鱼: "🐟",
  虾: "🦐",
  豆腐: "🟦",

  // ─── 蔬菜 ───
  西兰花: "🥦",
  番茄: "🍅",
  黄瓜: "🥒",
  菠菜: "🥬",
  香菇: "🍄",
  青椒: "🫑",
  紫菜: "🌿",
  白菜: "🥬",
  萝卜: "🥕",
  茄子: "🍆",
  韭菜: "🌱",
  香菜: "🌿",
  木耳: "🍄",
  豆芽: "🌱",
  胡萝卜: "🥕",
  土豆: "🥔",
  金针菇: "🍄",
  玉米: "🌽",
  豌豆: "🫛",

  // ─── 调味香料 ───
  葱: "🌱",
  姜: "🫚",
  蒜: "🧄",
  花椒: "🌶️",
  小米辣: "🌶️",
  辣椒: "🌶",
  黑椒: "🌶️",

  // ─── 调味料 ───
  盐: "🧂",
  酱油: "🥢",
  醋: "🫙",
  糖: "🍬",
  料酒: "🍶",
  香油: "🫗",
  蚝油: "🦪",

  // ─── 乳制品 ───
  牛奶: "🥛",
  酸奶: "🍶",
  奶酪: "🧀",

  // ─── 水果 ───
  苹果: "🍎",
  香蕉: "🍌",
  蓝莓: "🫐",
  草莓: "🍓",
  葡萄: "🍇",
  橙子: "🍊",
  西瓜: "🍉",
  桃子: "🍑",
  梨: "🍐",
  芒果: "🥭",
  猕猴桃: "🥝",

  // ─── 主食 ───
  米饭: "🍚",
  面条: "🍜",
  燕麦: "🌾",
  面包: "🍞",

  // ─── 其他 ───
  冰淇淋: "🍦",
  可乐: "🥤",
  果汁: "🧃",
  蜂蜜: "🍯",
  坚果: "🥜",
  巧克力: "🍫",
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
