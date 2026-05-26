export interface Food {
  id: number;
  name: string;
  count: number;
  expire: string;
  category: "vegetable" | "fruit" | "meat" | "drink" | "seafood" | "grain" | "other";
  zone: "fridge" | "freeze";
}

export type FoodCategory = Food["category"];
export type FoodZone = Food["zone"];
