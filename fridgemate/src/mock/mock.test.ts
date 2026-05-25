import { describe, it, expect } from "vitest";
import {
  MOCK_INGREDIENTS,
  INGREDIENT_BY_ID,
  FRIDGE_INGREDIENTS,
} from "./ingredients";
import { MOCK_RECIPES, RECIPE_BY_ID } from "./recipes";
import type { IngredientCategory } from "@/types";

describe("MOCK_INGREDIENTS data integrity", () => {
  it("contains 50 fridge items + 3 pantry items = 53 total", () => {
    const fridge = MOCK_INGREDIENTS.filter((i) => !i.isPantry);
    const pantry = MOCK_INGREDIENTS.filter((i) => i.isPantry);
    expect(fridge).toHaveLength(50);
    expect(pantry).toHaveLength(3);
    expect(MOCK_INGREDIENTS).toHaveLength(53);
  });

  it("all ingredient ids are unique", () => {
    const ids = MOCK_INGREDIENTS.map((i) => i.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("all ingredient names are unique", () => {
    const names = MOCK_INGREDIENTS.map((i) => i.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("pantry items are exactly rice/noodle/oat", () => {
    const pantryIds = MOCK_INGREDIENTS
      .filter((i) => i.isPantry)
      .map((i) => i.id)
      .sort();
    expect(pantryIds).toEqual(["noodle", "oat", "rice"]);
  });

  it("every category has at least one ingredient", () => {
    const categories: IngredientCategory[] = [
      "protein",
      "veg",
      "carb",
      "seasoning",
      "aromatic",
      "dairy",
      "fruit",
    ];
    for (const c of categories) {
      const items = MOCK_INGREDIENTS.filter((i) => i.category === c);
      expect(items.length, `category ${c} should have items`).toBeGreaterThan(0);
    }
  });

  it("category distribution matches v2 spec (13/17/3/9/5/3/3)", () => {
    const byCat: Record<string, number> = {};
    for (const i of MOCK_INGREDIENTS) {
      byCat[i.category] = (byCat[i.category] ?? 0) + 1;
    }
    expect(byCat.protein).toBe(13);
    expect(byCat.veg).toBe(17);
    expect(byCat.aromatic).toBe(5);
    expect(byCat.seasoning).toBe(9);
    expect(byCat.dairy).toBe(3);
    expect(byCat.fruit).toBe(3);
    expect(byCat.carb).toBe(3); // all pantry
  });

  it("INGREDIENT_BY_ID maps every ingredient by its id", () => {
    expect(INGREDIENT_BY_ID.size).toBe(MOCK_INGREDIENTS.length);
    for (const i of MOCK_INGREDIENTS) {
      expect(INGREDIENT_BY_ID.get(i.id)).toBe(i);
    }
  });

  it("FRIDGE_INGREDIENTS excludes all pantry items", () => {
    expect(FRIDGE_INGREDIENTS).toHaveLength(50);
    for (const i of FRIDGE_INGREDIENTS) {
      expect(i.isPantry).not.toBe(true);
    }
  });

  it("each ingredient has a non-empty Chinese name", () => {
    for (const i of MOCK_INGREDIENTS) {
      expect(i.name.length).toBeGreaterThan(0);
      // Chinese characters or printable ASCII
      expect(i.name.trim()).toBe(i.name);
    }
  });

  it("each fridge ingredient has an emoji", () => {
    for (const i of MOCK_INGREDIENTS) {
      if (!i.isPantry) {
        expect(i.emoji, `${i.name} missing emoji`).toBeTruthy();
      }
    }
  });

  it("shelf life days, when defined, is a positive integer", () => {
    for (const i of MOCK_INGREDIENTS) {
      if (i.shelfLifeDays !== undefined) {
        expect(i.shelfLifeDays).toBeGreaterThan(0);
        expect(Number.isInteger(i.shelfLifeDays)).toBe(true);
      }
    }
  });
});

describe("MOCK_RECIPES data integrity", () => {
  it("contains exactly 28 recipes", () => {
    expect(MOCK_RECIPES).toHaveLength(28);
  });

  it("all recipe ids are unique", () => {
    const ids = MOCK_RECIPES.map((r) => r.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("all recipe names are unique", () => {
    const names = MOCK_RECIPES.map((r) => r.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("every recipe ingredient id exists in INGREDIENT_BY_ID", () => {
    for (const r of MOCK_RECIPES) {
      for (const ref of r.ingredients) {
        expect(
          INGREDIENT_BY_ID.has(ref.id),
          `recipe ${r.name} references unknown ingredient ${ref.id}`
        ).toBe(true);
      }
    }
  });

  it("every recipe has at least 1 ingredient", () => {
    for (const r of MOCK_RECIPES) {
      expect(r.ingredients.length, `${r.name} has no ingredients`).toBeGreaterThan(0);
    }
  });

  it("every recipe has at least 1 step", () => {
    for (const r of MOCK_RECIPES) {
      expect(r.steps.length, `${r.name} has no steps`).toBeGreaterThan(0);
    }
  });

  it("every recipe has positive kcal/protein/cookTimeMin", () => {
    for (const r of MOCK_RECIPES) {
      expect(r.kcal).toBeGreaterThan(0);
      expect(r.protein).toBeGreaterThanOrEqual(0);
      expect(r.cookTimeMin).toBeGreaterThan(0);
    }
  });

  it("every recipe has valid difficulty (1|2|3)", () => {
    for (const r of MOCK_RECIPES) {
      expect([1, 2, 3]).toContain(r.difficulty);
    }
  });

  it("every recipe has valid fatLossScore (1..5)", () => {
    for (const r of MOCK_RECIPES) {
      expect(r.fatLossScore).toBeGreaterThanOrEqual(1);
      expect(r.fatLossScore).toBeLessThanOrEqual(5);
    }
  });

  it("RECIPE_BY_ID maps every recipe by its id", () => {
    expect(RECIPE_BY_ID.size).toBe(MOCK_RECIPES.length);
    for (const r of MOCK_RECIPES) {
      expect(RECIPE_BY_ID.get(r.id)).toBe(r);
    }
  });

  it("every recipe has a B站 videoUrl pointing to a BV code", () => {
    for (const r of MOCK_RECIPES) {
      expect(r.videoUrl, `${r.name} missing videoUrl`).toBeDefined();
      expect(r.videoUrl).toMatch(/^https:\/\/www\.bilibili\.com\/video\/BV[A-Za-z0-9]+\/$/);
    }
  });

  it("every step has non-empty text", () => {
    for (const r of MOCK_RECIPES) {
      for (const s of r.steps) {
        expect(s.text.length).toBeGreaterThan(0);
      }
    }
  });

  it("every step timerMin, when defined, is positive", () => {
    for (const r of MOCK_RECIPES) {
      for (const s of r.steps) {
        if (s.timerMin !== undefined) {
          expect(s.timerMin).toBeGreaterThan(0);
        }
      }
    }
  });

  it("every fridge ingredient appears in at least one recipe", () => {
    const usedIds = new Set<string>();
    for (const r of MOCK_RECIPES) {
      for (const ref of r.ingredients) usedIds.add(ref.id);
    }
    const unusedFridge = FRIDGE_INGREDIENTS.filter((i) => !usedIds.has(i.id));
    expect(
      unusedFridge,
      `fridge ingredients with no recipe references: ${unusedFridge.map((i) => i.name).join(", ")}`
    ).toHaveLength(0);
  });

  it("recipes referencing rice/noodle ingredient list it under pantry", () => {
    // Sanity check: pantry references should be intentional, not stray.
    const allowedPantryUsers: Record<string, string[]> = {
      rice: ["mushroom_pork_porridge"],
      noodle: [],
      oat: ["oat_fruit_bowl"],
    };
    for (const r of MOCK_RECIPES) {
      for (const ref of r.ingredients) {
        const ing = INGREDIENT_BY_ID.get(ref.id);
        if (ing?.isPantry) {
          expect(
            allowedPantryUsers[ref.id],
            `pantry ${ref.id} unexpectedly used by ${r.id}`
          ).toContain(r.id);
        }
      }
    }
  });
});
