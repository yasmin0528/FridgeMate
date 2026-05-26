import { describe, it, expect } from "vitest";
import { formatCookingLabel, sortHistoryDesc } from "./cookingHistory";

const ts = (y: number, m: number, d: number, h = 12, min = 0) =>
  new Date(y, m - 1, d, h, min).getTime();

describe("sortHistoryDesc", () => {
  it("orders newest first", () => {
    const sorted = sortHistoryDesc([
      { recipeId: "a", timestamp: ts(2026, 5, 20) },
      { recipeId: "b", timestamp: ts(2026, 5, 22) },
      { recipeId: "c", timestamp: ts(2026, 5, 21) },
    ]);
    expect(sorted.map((e) => e.recipeId)).toEqual(["b", "c", "a"]);
  });
});

describe("formatCookingLabel", () => {
  const now = ts(2026, 5, 21, 15, 0);

  it("shows 今天 for same calendar day", () => {
    expect(formatCookingLabel(ts(2026, 5, 21, 9, 30), now)).toBe(
      "今天 09:30"
    );
  });

  it("shows 昨天 for previous calendar day", () => {
    expect(formatCookingLabel(ts(2026, 5, 20, 18, 0), now)).toBe(
      "昨天 18:00"
    );
  });

  it("shows month-day within same year", () => {
    expect(formatCookingLabel(ts(2026, 3, 8, 12, 5), now)).toBe(
      "3月8日 12:05"
    );
  });
});
