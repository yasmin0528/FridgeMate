"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FridgeGrid, TopBar, SelectedFridgeBar } from "@/components/fridge";
import { CategorySidebar, FilterMode } from "@/components/fridge/CategorySidebar";
import { SelectionOverlay } from "@/components/fridge/SelectionOverlay";
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

function foodIdFromIngredientId(id: string) {
  return [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export default function FridgePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>("zone");
  const [selectedFilter, setSelectedFilter] = useState("all");

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
          id: foodIdFromIngredientId(item.ingredientId),
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
    if (filterMode === "zone") {
      return selectedFilter === "all"
        ? foods
        : foods.filter((food) => food.zone === selectedFilter);
    }
    return selectedFilter === "all"
      ? foods
      : foods.filter((food) => food.category === selectedFilter);
  }, [foods, filterMode, selectedFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f5f4]">
        <div className="bg-white border-b border-[#e5e3df]">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[8px] bg-[#e5e3df] animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-[#e5e3df] rounded-[6px] animate-pulse"></div>
                  <div className="h-3 w-40 bg-[#e5e3df] rounded-[6px] animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-[#e5e3df] rounded-[8px] animate-pulse"></div>
                <div className="w-10 h-10 bg-[#e5e3df] rounded-[8px] animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
          <div className="space-y-3">
            <div className="h-5 w-24 bg-[#e5e3df] rounded-[6px] animate-pulse"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-[#e5e3df] rounded-[12px] animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.main className="min-h-screen bg-[#f6f5f4]">
      <TopBar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-6">
        {/* Mobile: stacked layout. Tablet/Desktop: sidebar + content side by side */}
        <div className="flex flex-col gap-5 md:flex-row md:gap-6">

          {/* Sidebar — full width on mobile, 240px fixed on md+ */}
          <aside className="w-full md:w-56 lg:w-64 shrink-0">
            <CategorySidebar
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

          {/* Main content area */}
          <section className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${filterMode}-${selectedFilter}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <FridgeGrid
                  foods={filteredFoods}
                  onFoodClick={handleFoodClick}
                  onSelect={handleSelectFood}
                  onEdit={handleEditFood}
                  onDelete={handleRemoveFood}
                />
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>

      <SelectionOverlay food={overlayFood} open={overlayOpen} onClose={() => setOverlayOpen(false)} />
      <SelectedFridgeBar open={selectedBarOpen} onClose={() => setSelectedBarOpen(false)} />
    </motion.main>
  );
}
