"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TopBar, SelectedFridgeBar } from "@/components/fridge";
import { SelectionOverlay } from "@/components/fridge/SelectionOverlay";
import { FridgeVisualBackground } from "@/components/fridge/FridgeVisualBackground";
import { FridgeFilterBar, FilterMode } from "@/components/fridge/FridgeFilterBar";
import { useFridgeStore } from "@/store/fridgeStore";
import { INGREDIENT_BY_ID } from "@/mock/ingredients";
import { Food } from "@/types/food";

const STORAGE_OPTIONS = [
  { key: "all", label: "全部" },
  { key: "fridge", label: "冷藏" },
  { key: "freeze", label: "冷冻" },
];

const CATEGORY_OPTIONS = [
  { key: "all", label: "全部" },
  { key: "vegetable", label: "蔬菜" },
  { key: "fruit", label: "水果" },
  { key: "dairy", label: "乳制品" },
  { key: "meat", label: "肉类" },
  { key: "grain", label: "主食" },
  { key: "protein", label: "高蛋白" },
];

const CATEGORY_MAP: Record<string, Food["category"]> = {
  veg: "vegetable",
  fruit: "fruit",
  dairy: "drink",
  protein: "meat",
  carb: "grain",
  aromatic: "vegetable",
  seasoning: "other",
};

const SCAN_CATEGORY_MAP: Record<string, Food["category"]> = {
  vegetable: "vegetable",
  fruit: "fruit",
  dairy: "drink",
  meat: "meat",
  grain: "grain",
  protein: "protein",
};

export default function FridgePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>("zone");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [overlayFood, setOverlayFood] = useState<Food | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedBarOpen, setSelectedBarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleFoodClick = useCallback((food: Food) => {
    setOverlayFood(food);
    setOverlayOpen(true);
  }, []);

  const { inventory, toggleSelect, updateItem, removeItem } = useFridgeStore();

  const foods = useMemo<Food[]>(
    () =>
      inventory.flatMap((item) => {
        const ingredient = INGREDIENT_BY_ID.get(item.ingredientId);

        if (!ingredient && !item.name) {
          return [];
        }

        return {
          id: item.ingredientId,
          ingredientId: item.ingredientId,
          name: ingredient?.name ?? item.name ?? "未命名食材",
          count: item.qty,
          expire: item.shelfLife,
          category: item.category
            ? SCAN_CATEGORY_MAP[item.category]
            : ingredient
              ? CATEGORY_MAP[ingredient.category] ?? "other"
              : "other",
          zone: item.zone,
          status: item.status,
        };
      }),
    [inventory],
  );

  const handleSelectFood = useCallback((food: Food) => {
    toggleSelect(food.ingredientId ?? String(food.id));
    setSelectedBarOpen(true);
  }, [toggleSelect]);

  const handleEditFood = useCallback((updated: Food) => {
    if (!updated.ingredientId) return;
    updateItem({
      ingredientId: updated.ingredientId,
      qty: updated.count,
      shelfLife: updated.expire,
      zone: updated.zone,
      status: updated.status,
    });
  }, [updateItem]);

  const handleRemoveFood = useCallback((food: Food) => {
    const id = food.ingredientId ?? String(food.id);
    removeItem(id);
  }, [removeItem]);

  const filteredFoods = useMemo(() => {
    // 1. Filter by zone/category
    let result =
      filterMode === "zone"
        ? selectedFilter === "all"
          ? foods
          : foods.filter((food) => food.zone === selectedFilter)
        : selectedFilter === "all"
          ? foods
          : foods.filter((food) => food.category === selectedFilter);

    // 2. Filter by search query (match name)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((food) => food.name.toLowerCase().includes(q));
    }

    return result;
  }, [foods, filterMode, selectedFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-start justify-center pt-8">
        <div className="w-full max-w-[520px] h-[640px] rounded-[16px] bg-gray-100 overflow-hidden animate-pulse">
          <div className="p-5 space-y-4">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded" />
            <div className="h-36 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.main className="min-h-screen bg-white">
      <TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* ── Responsive layout ── */}
      <div className="mx-auto max-w-6xl px-3 py-4">
        <div className="flex flex-col md:flex-row md:gap-5">
          {/* Filter bar — horizontal scroll on mobile, vertical tag bar on md+ */}
          <aside className="w-full md:w-44 shrink-0 mb-3 md:mb-0">
            <FridgeFilterBar
              mode={filterMode}
              selectedKey={selectedFilter}
              onModeChange={(value) => {
                setFilterMode(value);
                setSelectedFilter("all");
              }}
              onSelectKey={setSelectedFilter}
              categories={CATEGORY_OPTIONS}
              zones={STORAGE_OPTIONS}
            />
          </aside>

          {/* Fridge */}
          <section className="flex-1 min-w-0">
            <FridgeVisualBackground
              foods={filteredFoods}
              onFoodClick={handleFoodClick}
              onSelect={handleSelectFood}
              onEdit={handleEditFood}
              onDelete={handleRemoveFood}
            />
          </section>
        </div>
      </div>

      <SelectionOverlay food={overlayFood} open={overlayOpen} onClose={() => setOverlayOpen(false)} />
      <SelectedFridgeBar open={selectedBarOpen} onClose={() => setSelectedBarOpen(false)} />
    </motion.main>
  );
}
