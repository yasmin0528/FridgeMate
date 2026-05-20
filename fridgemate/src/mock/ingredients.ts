import type { Ingredient } from "@/types";

export const MOCK_INGREDIENTS: Ingredient[] = [
  // protein
  { id: "chicken_breast", name: "鸡胸肉", category: "protein", emoji: "🍗", shelfLifeDays: 3 },
  { id: "beef", name: "牛肉", category: "protein", emoji: "🥩", shelfLifeDays: 3 },
  { id: "pork", name: "猪肉", category: "protein", emoji: "🥓", shelfLifeDays: 3 },
  { id: "fish", name: "鱼", category: "protein", emoji: "🐟", shelfLifeDays: 2 },
  { id: "egg", name: "鸡蛋", category: "protein", emoji: "🥚", shelfLifeDays: 14 },
  // veg
  { id: "broccoli", name: "西兰花", category: "veg", emoji: "🥦", shelfLifeDays: 5 },
  { id: "tomato", name: "番茄", category: "veg", emoji: "🍅", shelfLifeDays: 5 },
  { id: "cucumber", name: "黄瓜", category: "veg", emoji: "🥒", shelfLifeDays: 7 },
  { id: "spinach", name: "菠菜", category: "veg", emoji: "🥬", shelfLifeDays: 4 },
  { id: "mushroom", name: "香菇", category: "veg", emoji: "🍄", shelfLifeDays: 5 },
  { id: "bell_pepper", name: "青椒", category: "veg", emoji: "🫑", shelfLifeDays: 7 },
  { id: "scallion", name: "葱", category: "veg", emoji: "🌱", shelfLifeDays: 7 },
  { id: "garlic", name: "蒜", category: "veg", emoji: "🧄", shelfLifeDays: 30 },
  { id: "seaweed", name: "紫菜", category: "veg", emoji: "🌿", shelfLifeDays: 180 },
  // carb
  { id: "rice", name: "米饭", category: "carb", emoji: "🍚", shelfLifeDays: 365 },
  { id: "noodle", name: "面条", category: "carb", emoji: "🍜", shelfLifeDays: 365 },
  { id: "oat", name: "燕麦", category: "carb", emoji: "🌾", shelfLifeDays: 365 },
  { id: "potato", name: "土豆", category: "carb", emoji: "🥔", shelfLifeDays: 30 },
  { id: "tofu", name: "豆腐", category: "carb", emoji: "🟦", shelfLifeDays: 5 },
  // dairy
  { id: "milk", name: "牛奶", category: "dairy", emoji: "🥛", shelfLifeDays: 7 },
  { id: "yogurt", name: "酸奶", category: "dairy", emoji: "🍶", shelfLifeDays: 14 },
  { id: "cheese", name: "奶酪", category: "dairy", emoji: "🧀", shelfLifeDays: 21 },
  // fruit
  { id: "apple", name: "苹果", category: "fruit", emoji: "🍎", shelfLifeDays: 14 },
  { id: "banana", name: "香蕉", category: "fruit", emoji: "🍌", shelfLifeDays: 5 },
  { id: "blueberry", name: "蓝莓", category: "fruit", emoji: "🫐", shelfLifeDays: 7 },
  // seasoning
  { id: "salt", name: "盐", category: "seasoning", emoji: "🧂" },
  { id: "pepper", name: "黑椒", category: "seasoning", emoji: "🌶️" },
  { id: "soy_sauce", name: "酱油", category: "seasoning", emoji: "🥢" },
  { id: "vinegar", name: "醋", category: "seasoning", emoji: "🫙" },
  { id: "chili", name: "辣椒", category: "seasoning", emoji: "🌶" },
];

export const INGREDIENT_BY_ID: Map<string, Ingredient> = new Map(
  MOCK_INGREDIENTS.map((i) => [i.id, i])
);
