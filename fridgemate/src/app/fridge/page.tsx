"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FridgeGrid, TaskBar, TopBar, SelectedFridgeBar } from "@/components/fridge";
import { BottomTab } from "@/components/BottomTab";
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
  const router = useRouter();
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

  const handleRecommend = useCallback(() => {
    router.push("/recipes");
  }, [router]);

  const handleFoodClick = useCallback((food: Food) => {
    setOverlayFood(food);
    setOverlayOpen(true);
  }, []);

  const { toggleSelect, selectedSet } = useFridgeStore();

  const handleSelectFood = useCallback((food: Food) => {
    // Try to map Food (from FOODS_DATA) to a mock ingredient id by name
    const match = Array.from(INGREDIENT_BY_ID.values()).find((ing) => ing.name === food.name);
    if (match) {
      toggleSelect(match.id);
    } else {
      // fallback to numeric id string if no ingredient mapping
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
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="space-y-4 mb-8">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.main className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden xl:block">
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

          <section className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">冰箱库存总览</p>
                  <p className="mt-2 max-w-xl text-sm text-slate-600">
                    通过侧边栏快速切换存储分类或食材种类，直观查看当前库存与已选食材。
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                  onClick={handleRecommend}
                >
                  推荐食谱
                </button>
              </div>
            </div>

            <div className="xl:hidden">
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
            </div>

            <div className="space-y-4">
              <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">当前筛选</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {filterMode === "zone"
                        ? `存储分类：${STORAGE_OPTIONS.find((item) => item.key === selectedFilter)?.label ?? "全部"}`
                        : `食材分类：${CATEGORY_OPTIONS.find((item) => item.key === selectedFilter)?.label ?? "全部"}`}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">共 {filteredFoods.length} 件可用食材</p>
                </div>
              </div>

              <div className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${filterMode}-${selectedFilter}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.24 }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <FridgeGrid
                        foods={filteredFoods}
                        onFoodClick={handleFoodClick}
                        onSelect={handleSelectFood}
                        onEdit={handleEditFood}
                        onDelete={handleRemoveFood}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <TaskBar />
          </section>
        </div>
      </div>

      <SelectionOverlay food={overlayFood} open={overlayOpen} onClose={() => setOverlayOpen(false)} />
      <SelectedFridgeBar open={selectedBarOpen} onClose={() => setSelectedBarOpen(false)} />
      <BottomTab />
    </motion.main>
  );
}
