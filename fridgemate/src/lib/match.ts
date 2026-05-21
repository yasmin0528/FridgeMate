import type { Ingredient, Recipe, RecipeIngredientRef } from "@/types";
import { cosineSimilarity } from "./tfidf";

export function activeIngredients(
  recipe: Recipe,
  ingredientMap: Map<string, Ingredient>
): RecipeIngredientRef[] {
  return recipe.ingredients.filter((ref) => {
    const ing = ingredientMap.get(ref.id);
    return ing && !ing.isPantry;
  });
}

export function scoreRecipe(
  recipe: Recipe,
  selected: Set<string>,
  idf: Map<string, number>,
  ingredientMap: Map<string, Ingredient>
): number {
  const activeIds = new Set(activeIngredients(recipe, ingredientMap).map((i) => i.id));
  const sim = cosineSimilarity(selected, activeIds, idf);
  const fatLossBoost = 0.2 * (recipe.fatLossScore / 5);
  const timeBoost = 0.1 * (1 - Math.min(recipe.cookTimeMin, 60) / 60);
  return sim * (1 + fatLossBoost + timeBoost);
}

export function coverageCircles(
  recipe: Recipe,
  selected: Set<string>,
  ingredientMap: Map<string, Ingredient>
): number {
  const active = activeIngredients(recipe, ingredientMap);
  const total = active.length;
  if (total === 0) return 0;
  let hit = 0;
  for (const ref of active) {
    if (selected.has(ref.id)) hit++;
  }
  const coverage = hit / total;
  if (coverage === 0) return 0;
  return Math.ceil(coverage * 5);
}

export interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  coverage: number; // 0..5 circles
}

export function rankRecipes(
  recipes: Recipe[],
  selected: Set<string>,
  idf: Map<string, number>,
  ingredientMap: Map<string, Ingredient>
): ScoredRecipe[] {
  return recipes
    .map((r) => ({
      recipe: r,
      score: scoreRecipe(r, selected, idf, ingredientMap),
      coverage: coverageCircles(r, selected, ingredientMap),
    }))
    .sort((a, b) => b.score - a.score);
}

export function slotMachineCandidates(
  ranked: ScoredRecipe[]
): ScoredRecipe[] {
  return ranked.filter((r) => r.score >= 0.5);
}
