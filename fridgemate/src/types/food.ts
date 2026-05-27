export interface Food {
  id: number;
  ingredientId?: string;
  name: string;
  count: number;
  expire: string;
  category: "vegetable" | "fruit" | "meat" | "drink" | "seafood" | "grain" | "protein" | "other";
  zone: "fridge" | "freeze";
  status?: "fresh" | "soon" | "urgent";
}

export type FoodCategory = Food["category"];
export type FoodZone = Food["zone"];
