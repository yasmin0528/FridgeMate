import { describe, it, expect } from "vitest";
import {
  checkinReducer,
  dateKey,
  computeNextStreak,
  type CheckinState,
  type CheckinAction,
} from "./checkinStore";
import type { CookingDoneEvent } from "@/types";

const initial: CheckinState = {
  history: [],
  lastCookedDate: null,
  streak: 0,
};

// helpers
const ts = (y: number, m: number, d: number) =>
  new Date(y, m - 1, d, 12, 0, 0).getTime();

describe("dateKey", () => {
  it("formats YYYY-MM-DD", () => {
    expect(dateKey(ts(2026, 5, 21))).toBe("2026-05-21");
  });

  it("pads month and day to 2 digits", () => {
    expect(dateKey(ts(2026, 1, 5))).toBe("2026-01-05");
  });

  it("two timestamps on the same calendar day map to the same key", () => {
    const morning = new Date(2026, 4, 21, 7, 30).getTime();
    const evening = new Date(2026, 4, 21, 22, 45).getTime();
    expect(dateKey(morning)).toBe(dateKey(evening));
  });
});

describe("computeNextStreak", () => {
  it("first ever cooking returns streak=1", () => {
    expect(computeNextStreak(null, 0, "2026-05-21")).toBe(1);
  });

  it("cooking again on the same day keeps streak unchanged", () => {
    expect(computeNextStreak("2026-05-21", 3, "2026-05-21")).toBe(3);
  });

  it("cooking on the next calendar day increments streak", () => {
    expect(computeNextStreak("2026-05-20", 3, "2026-05-21")).toBe(4);
  });

  it("skipping a day resets streak to 1", () => {
    expect(computeNextStreak("2026-05-19", 5, "2026-05-21")).toBe(1);
  });

  it("skipping multiple days resets to 1", () => {
    expect(computeNextStreak("2026-05-01", 10, "2026-05-21")).toBe(1);
  });

  it("crosses month boundary correctly", () => {
    expect(computeNextStreak("2026-04-30", 2, "2026-05-01")).toBe(3);
  });

  it("crosses year boundary correctly", () => {
    expect(computeNextStreak("2025-12-31", 7, "2026-01-01")).toBe(8);
  });
});

describe("checkinReducer · RECORD", () => {
  it("first ever record creates streak=1 and pushes to history", () => {
    const event: CookingDoneEvent = {
      recipeId: "red_braised_pork",
      timestamp: ts(2026, 5, 21),
    };
    const next = checkinReducer(initial, { type: "RECORD", event });
    expect(next.history).toHaveLength(1);
    expect(next.history[0]).toBe(event);
    expect(next.lastCookedDate).toBe("2026-05-21");
    expect(next.streak).toBe(1);
  });

  it("two recordings on same day → streak stays 1 but history accumulates", () => {
    let s = initial;
    s = checkinReducer(s, {
      type: "RECORD",
      event: { recipeId: "a", timestamp: ts(2026, 5, 21) },
    });
    s = checkinReducer(s, {
      type: "RECORD",
      event: { recipeId: "b", timestamp: ts(2026, 5, 21) },
    });
    expect(s.history).toHaveLength(2);
    expect(s.streak).toBe(1);
  });

  it("consecutive days increment streak", () => {
    let s = initial;
    for (let day = 21; day <= 25; day++) {
      s = checkinReducer(s, {
        type: "RECORD",
        event: { recipeId: `d${day}`, timestamp: ts(2026, 5, day) },
      });
    }
    expect(s.streak).toBe(5);
    expect(s.lastCookedDate).toBe("2026-05-25");
    expect(s.history).toHaveLength(5);
  });

  it("missing a day resets streak", () => {
    let s = initial;
    s = checkinReducer(s, {
      type: "RECORD",
      event: { recipeId: "a", timestamp: ts(2026, 5, 21) },
    });
    s = checkinReducer(s, {
      type: "RECORD",
      event: { recipeId: "b", timestamp: ts(2026, 5, 22) },
    });
    expect(s.streak).toBe(2);
    // Skip 5/23
    s = checkinReducer(s, {
      type: "RECORD",
      event: { recipeId: "c", timestamp: ts(2026, 5, 24) },
    });
    expect(s.streak).toBe(1); // reset
    expect(s.history).toHaveLength(3); // history preserves all events
  });
});

describe("checkinReducer · HYDRATE", () => {
  it("replaces state entirely", () => {
    const hydrated: CheckinState = {
      history: [{ recipeId: "x", timestamp: 1 }],
      lastCookedDate: "2026-05-21",
      streak: 12,
    };
    const next = checkinReducer(initial, { type: "HYDRATE", state: hydrated });
    expect(next).toEqual(hydrated);
  });
});

describe("checkinReducer · immutability", () => {
  it("RECORD does not mutate input state", () => {
    const sample: CheckinState = {
      history: [{ recipeId: "x", timestamp: ts(2026, 5, 20) }],
      lastCookedDate: "2026-05-20",
      streak: 1,
    };
    const snap = JSON.parse(JSON.stringify(sample));
    const action: CheckinAction = {
      type: "RECORD",
      event: { recipeId: "y", timestamp: ts(2026, 5, 21) },
    };
    checkinReducer(sample, action);
    expect(sample).toEqual(snap);
  });
});
