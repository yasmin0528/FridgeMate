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
  it("returns qualified (score>=0.5) recipes when there are at least 5", () => {
    const recipes = Array.from({ length: 7 }, (_, i) => ({
      ...recipe,
      id: `r${i}`,
    }));
    const ranked = rankRecipes(
      recipes,
      new Set(["chicken_breast", "broccoli", "garlic", "salt"]),
      idf,
      baseIngredientMap
    );
    const candidates = slotMachineCandidates(ranked);
    expect(candidates.length).toBeGreaterThanOrEqual(5);
    for (const c of candidates) {
      expect(c.score).toBeGreaterThanOrEqual(0.5);
    }
  });

  it("falls back to top N by score when qualified is fewer than 5", () => {
    // Only 2 recipes, single-ingredient match → both score < 0.5
    const r1: Recipe = { ...recipe, id: "r1" };
    const r2: Recipe = { ...recipe, id: "r2" };
    const ranked = rankRecipes(
      [r1, r2],
      new Set(["chicken_breast"]),
      idf,
      baseIngredientMap
    );
    const candidates = slotMachineCandidates(ranked);
    // Fallback to all available (capped at 10), not the empty list
    expect(candidates.length).toBe(2);
  });

  it("caps fallback pool at 10 recipes", () => {
    const recipes = Array.from({ length: 28 }, (_, i) => ({
      ...recipe,
      id: `r${i}`,
      // No ingredients → all scores 0
      ingredients: [],
    }));
    const ranked = rankRecipes(recipes, new Set(), idf, baseIngredientMap);
    const candidates = slotMachineCandidates(ranked);
    expect(candidates.length).toBe(10);
  });

  it("returns empty when given an empty ranked list", () => {
    expect(slotMachineCandidates([])).toEqual([]);
  });
});

// ─── algorithm edge cases ────────────────────────────────────
describe("scoreRecipe · edge cases", () => {
  it("returns 0 when selectedSet is empty", () => {
    expect(
      scoreRecipe(recipe, new Set(), idf, baseIngredientMap)
    ).toBe(0);
  });

  it("returns 0 when recipe has no active ingredients", () => {
    const empty: Recipe = { ...recipe, ingredients: [] };
    expect(
      scoreRecipe(empty, new Set(["chicken_breast"]), idf, baseIngredientMap)
    ).toBe(0);
  });

  it("returns 0 when all recipe ingredients are pantry (no active)", () => {
    const map = new Map<string, Ingredient>([
      ["rice", { id: "rice", name: "米饭", category: "carb", isPantry: true }],
    ]);
    const allPantry: Recipe = {
      ...recipe,
      ingredients: [{ id: "rice", amount: "" }],
    };
    expect(scoreRecipe(allPantry, new Set(["rice"]), idf, map)).toBe(0);
  });

  it("never returns NaN, even with unusual inputs", () => {
    const out = scoreRecipe(recipe, new Set(["x"]), new Map(), baseIngredientMap);
    expect(Number.isNaN(out)).toBe(false);
  });
});

describe("coverageCircles · edge cases", () => {
  it("returns 0 for a recipe with no ingredients", () => {
    const empty: Recipe = { ...recipe, ingredients: [] };
    expect(
      coverageCircles(empty, new Set(["x"]), baseIngredientMap)
    ).toBe(0);
  });

  it("returns 0 when all ingredients are pantry (no active denominator)", () => {
    const map = new Map<string, Ingredient>([
      ["rice", { id: "rice", name: "米饭", category: "carb", isPantry: true }],
    ]);
    const r: Recipe = {
      ...recipe,
      ingredients: [{ id: "rice", amount: "" }],
    };
    expect(coverageCircles(r, new Set(["rice"]), map)).toBe(0);
  });

  it("returns 1 for tiny coverage (1/4 → ceil(0.25*5)=2)", () => {
    expect(
      coverageCircles(recipe, new Set(["chicken_breast"]), baseIngredientMap)
    ).toBe(2);
  });
});

describe("activeIngredients · edge cases", () => {
  it("filters out ingredients missing from the map (treats unknown as inactive)", () => {
    const map = new Map<string, Ingredient>([
      [
        "chicken_breast",
        { id: "chicken_breast", name: "鸡胸", category: "protein" },
      ],
    ]);
    const r: Recipe = {
      ...recipe,
      ingredients: [
        { id: "chicken_breast", amount: "" },
        { id: "ghost_ingredient", amount: "" },
      ],
    };
    const active = activeIngredients(r, map);
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe("chicken_breast");
  });

  it("returns empty array when recipe has no ingredients", () => {
    const empty: Recipe = { ...recipe, ingredients: [] };
    expect(activeIngredients(empty, baseIngredientMap)).toEqual([]);
  });
});

describe("rankRecipes · contracts", () => {
  it("returns one entry per input recipe", () => {
    const recipes = [
      { ...recipe, id: "r1" },
      { ...recipe, id: "r2" },
      { ...recipe, id: "r3" },
    ];
    const ranked = rankRecipes(
      recipes,
      new Set(["chicken_breast"]),
      idf,
      baseIngredientMap
    );
    expect(ranked).toHaveLength(3);
    expect(new Set(ranked.map((r) => r.recipe.id))).toEqual(
      new Set(["r1", "r2", "r3"])
    );
  });

  it("scores are non-increasing along the result", () => {
    const recipes = [
      { ...recipe, id: "r1", fatLossScore: 1 as const },
      { ...recipe, id: "r2", fatLossScore: 5 as const },
      { ...recipe, id: "r3", fatLossScore: 3 as const },
    ];
    const ranked = rankRecipes(
      recipes,
      new Set(["chicken_breast", "broccoli", "garlic", "salt"]),
      idf,
      baseIngredientMap
    );
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
    }
  });

  it("is deterministic — calling twice with same inputs returns same order", () => {
    const recipes = [
      { ...recipe, id: "r1" },
      { ...recipe, id: "r2" },
      { ...recipe, id: "r3" },
    ];
    const selected = new Set(["chicken_breast", "broccoli"]);
    const a = rankRecipes(recipes, selected, idf, baseIngredientMap).map(
      (r) => r.recipe.id
    );
    const b = rankRecipes(recipes, selected, idf, baseIngredientMap).map(
      (r) => r.recipe.id
    );
    expect(a).toEqual(b);
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
