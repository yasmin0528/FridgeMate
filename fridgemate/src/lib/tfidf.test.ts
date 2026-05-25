import { describe, it, expect } from "vitest";
import { computeIDF, cosineSimilarity } from "./tfidf";

describe("computeIDF", () => {
  it("returns higher IDF for rarer ingredients", () => {
    const recipes = [
      ["a", "b", "c"],
      ["a", "b"],
      ["a"],
    ];
    const idf = computeIDF(recipes);
    // "a" appears in all 3 → IDF = log(3/3) = 0
    expect(idf.get("a")).toBeCloseTo(0);
    // "b" appears in 2 → IDF = log(3/2) ≈ 0.405
    expect(idf.get("b")!).toBeCloseTo(Math.log(3 / 2));
    // "c" appears in 1 → IDF = log(3/1) ≈ 1.098
    expect(idf.get("c")!).toBeCloseTo(Math.log(3 / 1));
    expect(idf.get("c")!).toBeGreaterThan(idf.get("b")!);
  });

  it("returns empty map for empty corpus", () => {
    expect(computeIDF([]).size).toBe(0);
  });
});

describe("cosineSimilarity", () => {
  const idf = new Map([
    ["chicken", 1.0],
    ["broccoli", 1.0],
    ["salt", 0.1], // common, low weight
  ]);

  it("returns 1.0 for identical ingredient sets", () => {
    const sim = cosineSimilarity(
      new Set(["chicken", "broccoli"]),
      new Set(["chicken", "broccoli"]),
      idf
    );
    expect(sim).toBeCloseTo(1);
  });

  it("returns 0 for disjoint sets", () => {
    const sim = cosineSimilarity(
      new Set(["chicken"]),
      new Set(["broccoli"]),
      idf
    );
    expect(sim).toBe(0);
  });

  it("weights rare ingredients more than common ones", () => {
    const simRare = cosineSimilarity(
      new Set(["chicken"]),
      new Set(["chicken", "salt"]),
      idf
    );
    const simCommon = cosineSimilarity(
      new Set(["salt"]),
      new Set(["chicken", "salt"]),
      idf
    );
    expect(simRare).toBeGreaterThan(simCommon);
  });

  it("returns 0 when either side is empty", () => {
    expect(cosineSimilarity(new Set(), new Set(["a"]), idf)).toBe(0);
    expect(cosineSimilarity(new Set(["a"]), new Set(), idf)).toBe(0);
  });

  it("is symmetric: cos(a, b) === cos(b, a)", () => {
    const a = new Set(["chicken", "broccoli"]);
    const b = new Set(["chicken", "salt"]);
    expect(cosineSimilarity(a, b, idf)).toBeCloseTo(cosineSimilarity(b, a, idf));
  });

  it("treats unknown ingredients as zero weight (no NaN)", () => {
    const sim = cosineSimilarity(
      new Set(["unknown_ingredient"]),
      new Set(["chicken"]),
      idf
    );
    // No overlap on weighted dimensions → 0
    expect(sim).toBe(0);
    expect(Number.isNaN(sim)).toBe(false);
  });

  it("returns 0 (not NaN) when both sides only contain zero-weight ingredients", () => {
    const zeroIdf = new Map([["common", 0]]);
    const sim = cosineSimilarity(new Set(["common"]), new Set(["common"]), zeroIdf);
    expect(sim).toBe(0);
    expect(Number.isNaN(sim)).toBe(false);
  });
});

describe("computeIDF · edge cases", () => {
  it("single-recipe corpus produces IDF=0 for all its ingredients", () => {
    const idf = computeIDF([["a", "b", "c"]]);
    // log(1/1) = 0
    expect(idf.get("a")).toBe(0);
    expect(idf.get("b")).toBe(0);
    expect(idf.get("c")).toBe(0);
  });

  it("ingredient present in every recipe has IDF=0", () => {
    const idf = computeIDF([
      ["salt", "a"],
      ["salt", "b"],
      ["salt", "c"],
    ]);
    expect(idf.get("salt")).toBe(0);
    expect(idf.get("a")!).toBeGreaterThan(0);
  });

  it("ignores duplicates within a single recipe", () => {
    const idf = computeIDF([["a", "a", "a"], ["b"]]);
    // "a" appears in 1 of 2 recipes despite duplication
    expect(idf.get("a")!).toBeCloseTo(Math.log(2 / 1));
  });
});
