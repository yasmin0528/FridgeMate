"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FridgeGrid, TaskBar, TopBar, SelectedFridgeBar } from "@/components/fridge";
import { CategorySidebar, FilterMode } from "@/components/fridge/CategorySidebar";
import { SelectionOverlay } from "@/components/fridge/SelectionOverlay";
import { FOODS_DATA } from "@/data/foods";
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

export default function FridgePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [foods, setFoods] = useState<Food[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>("zone");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [overlayFood, setOverlayFood] = useState<Food | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedBarOpen, setSelectedBarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFoods(FOODS_DATA);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleFoodClick = useCallback((food: Food) => {
    setOverlayFood(food);
    setOverlayOpen(true);
  }, []);

  const { toggleSelect, selectedSet } = useFridgeStore();

  const handleSelectFood = useCallback((food: Food) => {
    const match = Array.from(INGREDIENT_BY_ID.values()).find((ing) => ing.name === food.name);
    if (match) {
      toggleSelect(match.id);
    } else {
      toggleSelect(String(food.id));
    }
    setSelectedBarOpen(true);
  }, [toggleSelect]);

  const handleEditFood = useCallback((updated: Food) => {
    setFoods((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }, []);

  const handleRemoveFood = useCallback((food: Food) => {
    setFoods((prev) => prev.filter((f) => f.id !== food.id));
    if (selectedSet.has(String(food.id))) toggleSelect(String(food.id));
  }, [selectedSet, toggleSelect]);

  const filteredFoods = useMemo(() => {
    if (filterMode === "zone") {
      return selectedFilter === "all"
        ? foods
        : foods.filter((food) => food.zone === (selectedFilter as any));
    }
    return selectedFilter === "all"
      ? foods
      : foods.filter((food) => food.category === (selectedFilter as any));
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
