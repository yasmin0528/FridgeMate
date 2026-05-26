"use client";

import { create } from "zustand";
import { Food } from "@/types/food";

interface FoodStoreState {
  selectedFoods: Food[];
  addFood: (food: Food) => void;
  removeFood: (foodId: number) => void;
  toggleFood: (food: Food) => void;
  clearFoods: () => void;
  isFoodSelected: (foodId: number) => boolean;
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

  removeFood: (foodId: number) => {
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

  isFoodSelected: (foodId: number) => {
    const state = get();
    return state.selectedFoods.some((f) => f.id === foodId);
  },
}));
