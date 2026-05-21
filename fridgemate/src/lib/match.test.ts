import { describe, it, expect } from "vitest";
import {
  scoreRecipe,
  coverageCircles,
  rankRecipes,
  slotMachineCandidates,
} from "./match";
import type { Recipe } from "@/types";

const idf = new Map([
  ["chicken_breast", 1.0],
  ["broccoli", 1.0],
  ["garlic", 0.5],
  ["salt", 0.1],
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
      idf
    );
    const partial = scoreRecipe(recipe, new Set(["chicken_breast"]), idf);
    expect(full).toBeGreaterThan(partial);
  });

  it("boosts high fatLossScore recipes", () => {
    const lowFatLoss: Recipe = { ...recipe, fatLossScore: 1 };
    const selected = new Set(["chicken_breast", "broccoli", "garlic", "salt"]);
    expect(scoreRecipe(recipe, selected, idf)).toBeGreaterThan(
      scoreRecipe(lowFatLoss, selected, idf)
    );
  });

  it("boosts shorter cookTime recipes", () => {
    const slow: Recipe = { ...recipe, cookTimeMin: 60 };
    const selected = new Set(["chicken_breast", "broccoli", "garlic", "salt"]);
    expect(scoreRecipe(recipe, selected, idf)).toBeGreaterThan(
      scoreRecipe(slow, selected, idf)
    );
  });
});

describe("coverageCircles", () => {
  it("returns 0 when no overlap", () => {
    expect(coverageCircles(recipe, new Set(["nope"]))).toBe(0);
  });
  it("returns 5 when all ingredients are selected", () => {
    expect(
      coverageCircles(
        recipe,
        new Set(["chicken_breast", "broccoli", "garlic", "salt"])
      )
    ).toBe(5);
  });
  it("returns 3 for 50% coverage (2/4 → ceil(0.5*5)=3)", () => {
    expect(
      coverageCircles(recipe, new Set(["chicken_breast", "broccoli"]))
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
      idf
    );
    expect(ranked[0].recipe.id).toBe("r1");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});

describe("slotMachineCandidates", () => {
  it("filters out recipes below 0.5 score threshold", () => {
    const r1: Recipe = { ...recipe, id: "r1" };
    const r2: Recipe = { ...recipe, id: "r2" };
    const ranked = rankRecipes([r1, r2], new Set(["chicken_breast"]), idf);
    const candidates = slotMachineCandidates(ranked);
    for (const c of candidates) {
      expect(c.score).toBeGreaterThanOrEqual(0.5);
    }
  });
});
