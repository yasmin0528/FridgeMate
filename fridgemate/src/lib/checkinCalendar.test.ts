import { describe, it, expect } from "vitest";
import {
  buildCheckedDateSet,
  buildMonthCells,
  countCheckedInMonth,
  shiftMonth,
} from "./checkinCalendar";

describe("buildCheckedDateSet", () => {
  it("dedupes same calendar day", () => {
    const morning = new Date(2026, 4, 21, 8).getTime();
    const evening = new Date(2026, 4, 21, 20).getTime();
    const set = buildCheckedDateSet([
      { recipeId: "a", timestamp: morning },
      { recipeId: "b", timestamp: evening },
    ]);
    expect(set.size).toBe(1);
    expect(set.has("2026-05-21")).toBe(true);
  });
});

describe("buildMonthCells", () => {
  it("May 2026 starts on Friday (5 leading blanks)", () => {
    const cells = buildMonthCells(2026, 5);
    const blanks = cells.filter((c) => c.key === null);
    expect(blanks).toHaveLength(5);
    expect(cells.filter((c) => c.day !== null)).toHaveLength(31);
  });
});

describe("countCheckedInMonth", () => {
  it("counts only days in the month grid", () => {
    const cells = buildMonthCells(2026, 5);
    const checked = new Set(["2026-05-21", "2026-04-30"]);
    expect(countCheckedInMonth(cells, checked)).toBe(1);
  });
});

describe("shiftMonth", () => {
  it("crosses year boundary", () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth(2025, 12, 1)).toEqual({ year: 2026, month: 1 });
  });
});
