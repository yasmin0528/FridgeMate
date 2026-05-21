"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { MOCK_RECIPES, RECIPE_BY_ID } from "@/mock/recipes";
import { computeIDF } from "@/lib/tfidf";
import {
  rankRecipes,
  slotMachineCandidates,
  type ScoredRecipe,
} from "@/lib/match";
import type { Recipe } from "@/types";
import { useFridgeStore } from "./fridgeStore";

interface RecipeContextValue {
  allRecipes: Recipe[];
  getRecipe: (id: string) => Recipe | undefined;
  rankedForSelected: ScoredRecipe[];
  slotCandidates: ScoredRecipe[];
}

const RecipeContext = createContext<RecipeContextValue | null>(null);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const { selectedSet } = useFridgeStore();

  const idf = useMemo(
    () =>
      computeIDF(MOCK_RECIPES.map((r) => r.ingredients.map((i) => i.id))),
    []
  );

  const ranked = useMemo(
    () => rankRecipes(MOCK_RECIPES, selectedSet, idf),
    [selectedSet, idf]
  );

  const candidates = useMemo(() => slotMachineCandidates(ranked), [ranked]);

  const value: RecipeContextValue = useMemo(
    () => ({
      allRecipes: MOCK_RECIPES,
      getRecipe: (id) => RECIPE_BY_ID.get(id),
      rankedForSelected: ranked,
      slotCandidates: candidates,
    }),
    [ranked, candidates]
  );

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
}

export function useRecipeStore(): RecipeContextValue {
  const ctx = useContext(RecipeContext);
  if (!ctx)
    throw new Error("useRecipeStore must be used inside <RecipeProvider>");
  return ctx;
}
