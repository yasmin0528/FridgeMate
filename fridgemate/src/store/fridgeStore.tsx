"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import type { Ingredient } from "@/types";
import { MOCK_INGREDIENTS } from "@/mock/ingredients";

interface InventoryItem {
  ingredientId: string;
  qty: number;
  addedAt: number;
}

interface FridgeState {
  inventory: InventoryItem[];
  selectedIds: string[];
}

type Action =
  | { type: "ADD_ITEMS"; items: { ingredientId: string; qty: number }[] }
  | { type: "REMOVE_ITEM"; ingredientId: string }
  | { type: "TOGGLE_SELECT"; ingredientId: string }
  | { type: "CLEAR_SELECTION" }
  | { type: "HYDRATE"; state: FridgeState };

const INITIAL: FridgeState = {
  inventory: MOCK_INGREDIENTS.filter((i) => !i.isPantry).map((i) => ({
    ingredientId: i.id,
    qty: 1,
    addedAt: Date.now(),
  })),
  selectedIds: [],
};

function reducer(s: FridgeState, a: Action): FridgeState {
  switch (a.type) {
    case "ADD_ITEMS": {
      const existing = new Map(s.inventory.map((it) => [it.ingredientId, it]));
      for (const add of a.items) {
        const prev = existing.get(add.ingredientId);
        if (prev) prev.qty += add.qty;
        else existing.set(add.ingredientId, { ...add, addedAt: Date.now() });
      }
      return { ...s, inventory: [...existing.values()] };
    }
    case "REMOVE_ITEM":
      return {
        ...s,
        inventory: s.inventory.filter(
          (it) => it.ingredientId !== a.ingredientId
        ),
        selectedIds: s.selectedIds.filter((id) => id !== a.ingredientId),
      };
    case "TOGGLE_SELECT": {
      const has = s.selectedIds.includes(a.ingredientId);
      return {
        ...s,
        selectedIds: has
          ? s.selectedIds.filter((id) => id !== a.ingredientId)
          : [...s.selectedIds, a.ingredientId],
      };
    }
    case "CLEAR_SELECTION":
      return { ...s, selectedIds: [] };
    case "HYDRATE":
      return a.state;
  }
}

interface FridgeContextValue {
  inventory: InventoryItem[];
  selectedIds: string[];
  selectedSet: Set<string>;
  addItems: (items: { ingredientId: string; qty: number }[]) => void;
  removeItem: (id: string) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
}

const FridgeContext = createContext<FridgeContextValue | null>(null);
const STORAGE_KEY = "fridgemate:fridge";

export function FridgeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null;
    if (raw) {
      try {
        dispatch({ type: "HYDRATE", state: JSON.parse(raw) });
      } catch {
        // ignore corrupted state
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const value: FridgeContextValue = useMemo(
    () => ({
      inventory: state.inventory,
      selectedIds: state.selectedIds,
      selectedSet: new Set(state.selectedIds),
      addItems: (items) => dispatch({ type: "ADD_ITEMS", items }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", ingredientId: id }),
      toggleSelect: (id) =>
        dispatch({ type: "TOGGLE_SELECT", ingredientId: id }),
      clearSelection: () => dispatch({ type: "CLEAR_SELECTION" }),
    }),
    [state]
  );

  return (
    <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>
  );
}

export function useFridgeStore(): FridgeContextValue {
  const ctx = useContext(FridgeContext);
  if (!ctx)
    throw new Error("useFridgeStore must be used inside <FridgeProvider>");
  return ctx;
}

export type { Ingredient };
