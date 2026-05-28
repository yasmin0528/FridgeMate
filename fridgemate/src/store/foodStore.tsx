"use client";

import { create } from "zustand";
import { Food } from "@/types/food";

interface FoodStoreState {
  selectedFoods: Food[];
  addFood: (food: Food) => void;
  removeFood: (foodId: string) => void;
  toggleFood: (food: Food) => void;
  clearFoods: () => void;
  isFoodSelected: (foodId: string) => boolean;
}

export const useFoodStore = create<FoodStoreState>((set, get) => ({
  selectedFoods: [],

  addFood: (food: Food) => {
    set((state) => {
      // 避免重复添加
      if (state.selectedFoods.some((f) => f.id === food.id)) {
        return state;
      }
      return {
        selectedFoods: [...state.selectedFoods, food],
      };
    });
  },

  removeFood: (foodId: string) => {
    set((state) => ({
      selectedFoods: state.selectedFoods.filter((f) => f.id !== foodId),
    }));
  },

  toggleFood: (food: Food) => {
    set((state) => {
      const isSelected = state.selectedFoods.some((f) => f.id === food.id);
      if (isSelected) {
        return {
          selectedFoods: state.selectedFoods.filter((f) => f.id !== food.id),
        };
      } else {
        return {
          selectedFoods: [...state.selectedFoods, food],
        };
      }
    });
  },

  clearFoods: () => {
    set({ selectedFoods: [] });
  },

  isFoodSelected: (foodId: string) => {
    const state = get();
    return state.selectedFoods.some((f) => f.id === foodId);
  },
}));
