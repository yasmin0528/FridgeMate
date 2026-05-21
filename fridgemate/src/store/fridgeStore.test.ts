import { describe, it, expect } from "vitest";
import {
  fridgeReducer,
  type FridgeState,
  type FridgeAction,
} from "./fridgeStore";

const empty: FridgeState = { inventory: [], selectedIds: [] };

const sample: FridgeState = {
  inventory: [
    { ingredientId: "egg", qty: 2, addedAt: 1700_000_000_000 },
    { ingredientId: "tofu", qty: 1, addedAt: 1700_000_000_000 },
  ],
  selectedIds: ["egg"],
};

describe("fridgeReducer · ADD_ITEMS", () => {
  it("adds new ingredients to empty inventory", () => {
    const action: FridgeAction = {
      type: "ADD_ITEMS",
      items: [{ ingredientId: "tomato", qty: 3 }],
    };
    const next = fridgeReducer(empty, action);
    expect(next.inventory).toHaveLength(1);
    expect(next.inventory[0].ingredientId).toBe("tomato");
    expect(next.inventory[0].qty).toBe(3);
    expect(next.inventory[0].addedAt).toBeGreaterThan(0);
  });

  it("merges qty when ingredient already exists", () => {
    const action: FridgeAction = {
      type: "ADD_ITEMS",
      items: [{ ingredientId: "egg", qty: 5 }],
    };
    const next = fridgeReducer(sample, action);
    expect(next.inventory).toHaveLength(2); // no new entry
    const egg = next.inventory.find((i) => i.ingredientId === "egg")!;
    expect(egg.qty).toBe(7); // 2 + 5
  });

  it("can add multiple items in one action", () => {
    const action: FridgeAction = {
      type: "ADD_ITEMS",
      items: [
        { ingredientId: "carrot", qty: 1 },
        { ingredientId: "potato", qty: 2 },
      ],
    };
    const next = fridgeReducer(empty, action);
    expect(next.inventory).toHaveLength(2);
  });

  it("preserves selectedIds", () => {
    const action: FridgeAction = {
      type: "ADD_ITEMS",
      items: [{ ingredientId: "tomato", qty: 1 }],
    };
    const next = fridgeReducer(sample, action);
    expect(next.selectedIds).toEqual(["egg"]);
  });

  it("empty items array is a no-op for inventory", () => {
    const action: FridgeAction = { type: "ADD_ITEMS", items: [] };
    const next = fridgeReducer(sample, action);
    expect(next.inventory).toHaveLength(sample.inventory.length);
  });
});

describe("fridgeReducer · REMOVE_ITEM", () => {
  it("removes the matching inventory item", () => {
    const action: FridgeAction = { type: "REMOVE_ITEM", ingredientId: "egg" };
    const next = fridgeReducer(sample, action);
    expect(next.inventory.find((i) => i.ingredientId === "egg")).toBeUndefined();
    expect(next.inventory).toHaveLength(1);
  });

  it("removes id from selectedIds if present", () => {
    const action: FridgeAction = { type: "REMOVE_ITEM", ingredientId: "egg" };
    const next = fridgeReducer(sample, action);
    expect(next.selectedIds).not.toContain("egg");
  });

  it("removing non-existent id is a no-op", () => {
    const action: FridgeAction = { type: "REMOVE_ITEM", ingredientId: "ghost" };
    const next = fridgeReducer(sample, action);
    expect(next.inventory).toHaveLength(sample.inventory.length);
    expect(next.selectedIds).toEqual(sample.selectedIds);
  });
});

describe("fridgeReducer · TOGGLE_SELECT", () => {
  it("adds id to selectedIds when not present", () => {
    const action: FridgeAction = { type: "TOGGLE_SELECT", ingredientId: "tofu" };
    const next = fridgeReducer(sample, action);
    expect(next.selectedIds).toContain("tofu");
    expect(next.selectedIds).toContain("egg");
  });

  it("removes id from selectedIds when present", () => {
    const action: FridgeAction = { type: "TOGGLE_SELECT", ingredientId: "egg" };
    const next = fridgeReducer(sample, action);
    expect(next.selectedIds).not.toContain("egg");
    expect(next.selectedIds).toHaveLength(0);
  });

  it("does not modify inventory", () => {
    const action: FridgeAction = { type: "TOGGLE_SELECT", ingredientId: "tofu" };
    const next = fridgeReducer(sample, action);
    expect(next.inventory).toBe(sample.inventory);
  });

  it("toggling 5 times ends up where it started (idempotent on odd/even)", () => {
    let state = empty;
    const action: FridgeAction = { type: "TOGGLE_SELECT", ingredientId: "x" };
    for (let i = 0; i < 5; i++) state = fridgeReducer(state, action);
    expect(state.selectedIds).toEqual(["x"]); // odd = selected
    state = fridgeReducer(state, action);
    expect(state.selectedIds).toEqual([]); // even = unselected
  });
});

describe("fridgeReducer · CLEAR_SELECTION", () => {
  it("empties selectedIds without touching inventory", () => {
    const next = fridgeReducer(sample, { type: "CLEAR_SELECTION" });
    expect(next.selectedIds).toEqual([]);
    expect(next.inventory).toBe(sample.inventory);
  });

  it("is idempotent", () => {
    const a = fridgeReducer(sample, { type: "CLEAR_SELECTION" });
    const b = fridgeReducer(a, { type: "CLEAR_SELECTION" });
    expect(b.selectedIds).toEqual([]);
    expect(b).toEqual(a);
  });
});

describe("fridgeReducer · HYDRATE", () => {
  it("replaces state entirely with the hydrated value", () => {
    const hydrated: FridgeState = {
      inventory: [{ ingredientId: "x", qty: 9, addedAt: 1 }],
      selectedIds: ["x"],
    };
    const next = fridgeReducer(sample, { type: "HYDRATE", state: hydrated });
    expect(next).toEqual(hydrated);
  });
});

describe("fridgeReducer · immutability contract", () => {
  it("does not mutate the input state object", () => {
    const snap = JSON.parse(JSON.stringify(sample));
    fridgeReducer(sample, { type: "TOGGLE_SELECT", ingredientId: "tofu" });
    fridgeReducer(sample, { type: "REMOVE_ITEM", ingredientId: "egg" });
    fridgeReducer(sample, { type: "CLEAR_SELECTION" });
    fridgeReducer(sample, {
      type: "ADD_ITEMS",
      items: [{ ingredientId: "extra", qty: 1 }],
    });
    expect(sample).toEqual(snap);
  });

  it("ADD_ITEMS merge does not mutate original InventoryItem objects", () => {
    // Egg already has qty: 2. Adding 5 more should produce a new item with qty: 7,
    // not mutate the original item to qty: 7.
    const originalEgg = sample.inventory.find((i) => i.ingredientId === "egg")!;
    const originalQty = originalEgg.qty;
    fridgeReducer(sample, {
      type: "ADD_ITEMS",
      items: [{ ingredientId: "egg", qty: 5 }],
    });
    expect(originalEgg.qty).toBe(originalQty);
  });
});
