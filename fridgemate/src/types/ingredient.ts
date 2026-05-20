export type IngredientCategory =
  | "protein"
  | "veg"
  | "carb"
  | "seasoning"
  | "dairy"
  | "fruit";

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  emoji?: string;
  shelfLifeDays?: number;
}
