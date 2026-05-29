"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import type { Ingredient } from "@/types";
import { MOCK_INGREDIENTS } from "@/mock/ingredients";

export type InventoryStatus = "fresh" | "soon" | "urgent";
export type InventoryZone = "fridge" | "freeze";
export type InventoryCategory =
  | "vegetable"
  | "fruit"
  | "dairy"
  | "meat"
  | "drink"
  | "seafood"
  | "grain"
  | "protein"
  | "other";

export interface InventoryItem {
  ingredientId: string;
  name?: string;
  category?: InventoryCategory;
  qty: number;
  addedAt: number;
  status: InventoryStatus;
  zone: InventoryZone;
  shelfLife: string;
}

export interface InventoryItemInput {
  ingredientId: string;
  name?: string;
  category?: InventoryCategory;
  qty: number;
  status?: InventoryStatus;
  zone?: InventoryZone;
  shelfLife?: string;
}

export interface FridgeState {
  inventory: InventoryItem[];
  selectedIds: string[];
}

export type FridgeAction =
  | { type: "ADD_ITEMS"; items: InventoryItemInput[] }
  | { type: "UPDATE_ITEM"; item: InventoryItemInput }
  | { type: "REMOVE_ITEM"; ingredientId: string }
  | { type: "TOGGLE_SELECT"; ingredientId: string }
  | { type: "CLEAR_SELECTION" }
  | { type: "HYDRATE"; state: FridgeState };

/** Ingredients that belong in the freezer by default */
const FREEZER_IDS = new Set([
  "chicken_breast", "chicken_thigh", "beef", "beef_brisket",
  "pork_loin", "pork_belly", "pork_ribs", "ground_pork", "lamb",
  "fish", "shrimp",
]);

const INITIAL: FridgeState = {
  inventory: MOCK_INGREDIENTS.filter((i) => !i.isPantry).map((i) => ({
    ingredientId: i.id,
    qty: 1,
    addedAt: Date.now(),
    status: "fresh",
    zone: FREEZER_IDS.has(i.id) ? "freeze" : "fridge",
    shelfLife: i.shelfLifeDays ? `${i.shelfLifeDays} 天` : "待确认",
  })),
  selectedIds: [],
};

export function fridgeReducer(s: FridgeState, a: FridgeAction): FridgeState {
  switch (a.type) {
    case "ADD_ITEMS": {
      const existing = new Map(s.inventory.map((it) => [it.ingredientId, it]));

      for (const add of a.items) {
        const prev = existing.get(add.ingredientId);

        if (prev) {
          existing.set(add.ingredientId, {
            ...prev,
            name: add.name ?? prev.name,
            category: add.category ?? prev.category,
            qty: prev.qty + add.qty,
            status: add.status ?? prev.status,
            zone: add.zone ?? prev.zone,
            shelfLife: add.shelfLife ?? prev.shelfLife,
          });
        } else {
          existing.set(add.ingredientId, {
            ingredientId: add.ingredientId,
            name: add.name,
            category: add.category,
            qty: add.qty,
            addedAt: Date.now(),
            status: add.status ?? "fresh",
            zone: add.zone ?? "fridge",
            shelfLife: add.shelfLife ?? "待确认",
          });
        }
      }

      return { ...s, inventory: [...existing.values()] };
    }
    case "UPDATE_ITEM":
      return {
        ...s,
        inventory: s.inventory.map((it) =>
          it.ingredientId === a.item.ingredientId
            ? {
                ...it,
                name: a.item.name ?? it.name,
                category: a.item.category ?? it.category,
                qty: a.item.qty,
                status: a.item.status ?? it.status,
                zone: a.item.zone ?? it.zone,
                shelfLife: a.item.shelfLife ?? it.shelfLife,
              }
            : it,
        ),
      };
    case "REMOVE_ITEM":
      return {
        ...s,
        inventory: s.inventory.filter(
          (it) => it.ingredientId !== a.ingredientId,
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
  addItems: (items: InventoryItemInput[]) => void;
  updateItem: (item: InventoryItemInput) => void;
  removeItem: (id: string) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
}

const FridgeContext = createContext<FridgeContextValue | null>(null);
const STORAGE_KEY = "fridgemate:fridge";
const STORAGE_VERSION = 3;

interface PersistedState {
  version: number;
  state: FridgeState;
}

export function FridgeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(fridgeReducer, INITIAL);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed && parsed.version === STORAGE_VERSION && parsed.state) {
          dispatch({ type: "HYDRATE", state: parsed.state });
        }
      } catch {
        // ignore corrupted state
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const wrapper: PersistedState = { version: STORAGE_VERSION, state };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
    }
  }, [state]);

  const addItems = useCallback((items: InventoryItemInput[]) => {
    dispatch({ type: "ADD_ITEMS", items });
  }, []);

  const updateItem = useCallback((item: InventoryItemInput) => {
    dispatch({ type: "UPDATE_ITEM", item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", ingredientId: id });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_SELECT", ingredientId: id });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTION" });
  }, []);

  const selectedSet = useMemo(() => new Set(state.selectedIds), [state.selectedIds]);

  const value: FridgeContextValue = useMemo(
    () => ({
      inventory: state.inventory,
      selectedIds: state.selectedIds,
      selectedSet,
      addItems,
      updateItem,
      removeItem,
      toggleSelect,
      clearSelection,
    }),
    [
      state.inventory,
      state.selectedIds,
      selectedSet,
      addItems,
      updateItem,
      removeItem,
      toggleSelect,
      clearSelection,
    ],
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
