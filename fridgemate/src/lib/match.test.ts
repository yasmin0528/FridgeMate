import { describe, it, expect } from "vitest";
import {
  scoreRecipe,
  coverageCircles,
  rankRecipes,
  slotMachineCandidates,
  activeIngredients,
} from "./match";
import type { Ingredient, Recipe } from "@/types";

const idf = new Map([
  ["chicken_breast", 1.0],
  ["broccoli", 1.0],
  ["garlic", 0.5],
  ["salt", 0.1],
]);

const baseIngredientMap = new Map<string, Ingredient>([
  ["chicken_breast", { id: "chicken_breast", name: "鸡胸", category: "protein" }],
  ["broccoli", { id: "broccoli", name: "西兰花", category: "veg" }],
  ["garlic", { id: "garlic", name: "蒜", category: "aromatic" }],
  ["salt", { id: "salt", name: "盐", category: "seasoning" }],
]);

const recipe: Recipe = {
  id: "test",
  name: "test",
  coverImage: "",
  ingredients: [
    { id: "chicken_breast", amount: "" },
    { id: "broccoli", amount: "" },
    { id: "garlic", amount: "" },
    { id: "salt", amount: "" },
  ],
  kcal: 300,
  protein: 30,
  cookTimeMin: 18,
  difficulty: 1,
  fatLossScore: 5,
  steps: [],
};

describe("scoreRecipe", () => {
  it("returns higher score when more ingredients overlap", () => {
    const full = scoreRecipe(
      recipe,
      new Set(["chicken_breast", "broccoli", "garlic", "salt"]),
      idf,
      baseIngredientMap
    );
    const partial = scoreRecipe(
      recipe,
      new Set(["chicken_breast"]),
      idf,
      baseIngredientMap
    );
    expect(full).toBeGreaterThan(partial);
  });

  it("boosts high fatLossScore recipes", () => {
    const lowFatLoss: Recipe = { ...recipe, fatLossScore: 1 };
    const selected = new Set(["chicken_breast", "broccoli", "garlic", "salt"]);
    expect(scoreRecipe(recipe, selected, idf, baseIngredientMap)).toBeGreaterThan(
      scoreRecipe(lowFatLoss, selected, idf, baseIngredientMap)
    );
  });

  it("boosts shorter cookTime recipes", () => {
    const slow: Recipe = { ...recipe, cookTimeMin: 60 };
    const selected = new Set(["chicken_breast", "broccoli", "garlic", "salt"]);
    expect(scoreRecipe(recipe, selected, idf, baseIngredientMap)).toBeGreaterThan(
      scoreRecipe(slow, selected, idf, baseIngredientMap)
    );
  });
});

describe("coverageCircles", () => {
  it("returns 0 when no overlap", () => {
    expect(coverageCircles(recipe, new Set(["nope"]), baseIngredientMap)).toBe(0);
  });
  it("returns 5 when all ingredients are selected", () => {
    expect(
      coverageCircles(
        recipe,
        new Set(["chicken_breast", "broccoli", "garlic", "salt"]),
        baseIngredientMap
      )
    ).toBe(5);
  });
  it("returns 3 for 50% coverage (2/4 → ceil(0.5*5)=3)", () => {
    expect(
      coverageCircles(
        recipe,
        new Set(["chicken_breast", "broccoli"]),
        baseIngredientMap
      )
    ).toBe(3);
  });
});

describe("rankRecipes", () => {
  it("returns recipes sorted by score descending", () => {
    const r1: Recipe = { ...recipe, id: "r1", fatLossScore: 5 };
    const r2: Recipe = { ...recipe, id: "r2", fatLossScore: 1 };
    const ranked = rankRecipes(
      [r2, r1],
      new Set(["chicken_breast", "broccoli", "garlic", "salt"]),
      idf,
      baseIngredientMap
    );
    expect(ranked[0].recipe.id).toBe("r1");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});

describe("slotMachineCandidates", () => {
  it("filters out recipes below 0.5 score threshold", () => {
    const r1: Recipe = { ...recipe, id: "r1" };
    const r2: Recipe = { ...recipe, id: "r2" };
    const ranked = rankRecipes(
      [r1, r2],
      new Set(["chicken_breast"]),
      idf,
      baseIngredientMap
    );
    const candidates = slotMachineCandidates(ranked);
    for (const c of candidates) {
      expect(c.score).toBeGreaterThanOrEqual(0.5);
    }
  });
});

// ─── v2: pantry filtering ─────────────────────────────────────
describe("activeIngredients", () => {
  const ingredientMap = new Map<string, Ingredient>([
    ["chicken_breast", { id: "chicken_breast", name: "鸡胸", category: "protein" }],
    ["rice", { id: "rice", name: "米饭", category: "carb", isPantry: true }],
  ]);

  it("filters out pantry ingredients from recipe ingredient list", () => {
    const r: Recipe = {
      ...recipe,
      ingredients: [
        { id: "chicken_breast", amount: "" },
        { id: "rice", amount: "" },
      ],
    };
    const filtered = activeIngredients(r, ingredientMap);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("chicken_breast");
  });

  it("returns all ingredients when none are pantry", () => {
    const r: Recipe = {
      ...recipe,
      ingredients: [{ id: "chicken_breast", amount: "" }],
    };
    expect(activeIngredients(r, ingredientMap)).toHaveLength(1);
  });
});

describe("coverageCircles with pantry", () => {
  const ingredientMap = new Map<string, Ingredient>([
    ["chicken_breast", { id: "chicken_breast", name: "鸡胸", category: "protein" }],
    ["broccoli", { id: "broccoli", name: "西兰花", category: "veg" }],
    ["rice", { id: "rice", name: "米饭", category: "carb", isPantry: true }],
  ]);

  it("ignores pantry ingredients in coverage denominator", () => {
    const r: Recipe = {
      ...recipe,
      ingredients: [
        { id: "chicken_breast", amount: "" },
        { id: "broccoli", amount: "" },
        { id: "rice", amount: "" },
      ],
    };
    // 2 active ingredients, both selected → coverage 1.0 → 5 circles
    const circles = coverageCircles(
      r,
      new Set(["chicken_breast", "broccoli"]),
      ingredientMap
    );
    expect(circles).toBe(5);
  });
});
