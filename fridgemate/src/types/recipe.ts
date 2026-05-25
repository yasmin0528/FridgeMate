export interface RecipeStep {
  text: string;
  timerMin?: number;
}

export interface RecipeIngredientRef {
  id: string;
  amount: string;
  isOptional?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  coverImage: string;
  ingredients: RecipeIngredientRef[];
  kcal: number;
  protein: number;
  cookTimeMin: number;
  difficulty: 1 | 2 | 3;
  fatLossScore: number; // 1..5
  steps: RecipeStep[];
  videoUrl?: string;
}
