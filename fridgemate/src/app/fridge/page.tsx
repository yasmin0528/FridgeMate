"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useFridgeStore } from "@/store/fridgeStore";
import { INGREDIENT_BY_ID } from "@/mock/ingredients";
import { FlatFridgeBackground, type FridgeVisualItem } from "@/components/fridge/FlatFridgeBackground";
import { SelectedFridgeBar } from "@/components/fridge/SelectedFridgeBar";
import { TopBar } from "@/components/fridge/TopBar";
import { FridgeFilterBar, type FilterMode } from "@/components/fridge/FridgeFilterBar";
import type { Food } from "@/types/food";

const CATEGORY_OPTIONS = [
  { key: "all", label: "全部" },
  { key: "vegetable", label: "蔬菜" },
  { key: "fruit", label: "水果" },
  { key: "dairy", label: "乳制品" },
  { key: "meat", label: "肉类" },
  { key: "grain", label: "主食" },
  { key: "protein", label: "高蛋白" },
];

const STORAGE_OPTIONS = [
  { key: "all", label: "全部" },
  { key: "fridge", label: "冷藏" },
  { key: "freeze", label: "冷冻" },
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
  const { inventory, selectedIds, updateItem, removeItem, toggleSelect } = useFridgeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("category");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showSelectedBar, setShowSelectedBar] = useState(false);

  const visualItems = useMemo<FridgeVisualItem[]>(() => {
    return inventory.map((item) => {
      const ingredient = INGREDIENT_BY_ID.get(item.ingredientId);
      const food: Food = {
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

      return {
        ...food,
        location: item.zone,
      };
    });
  }, [inventory]);

  const filteredItems = useMemo(() => {
    let result = visualItems;

    if (filterMode === "category") {
      result = selectedFilter === "all"
        ? result
        : result.filter((item) => item.category === selectedFilter);
    } else {
      result = selectedFilter === "all"
        ? result
        : result.filter((item) => item.location === selectedFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }

    return result;
  }, [filterMode, searchQuery, selectedFilter, visualItems]);

  const handleSelectFood = (food: Food) => {
    const foodId = food.ingredientId ?? String(food.id);
    const isSelected = selectedIds.includes(foodId);
    toggleSelect(foodId);
    setShowSelectedBar(!isSelected || selectedIds.length > 1);
  };

  const handleEditFood = (food: Food) => {
    if (!food.ingredientId) return;

    updateItem({
      ingredientId: food.ingredientId,
      qty: food.count,
      shelfLife: food.expire,
      zone: food.zone,
      status: food.status,
      name: food.name,
      category: food.category,
    });
  };

  const handleRemoveFood = (food: Food) => {
    removeItem(food.ingredientId ?? String(food.id));
  };

  return (
    <main className="relative isolate min-h-screen bg-[var(--color-canvas)] px-4 pb-20 pt-4 md:pb-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <Image
          src="/scene.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-3">
        <TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="rounded-[24px] border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] px-3 py-2 shadow-[0_6px_16px_rgba(43,43,43,0.06)]">
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
        </div>

        <FlatFridgeBackground
          items={filteredItems}
          onSelect={handleSelectFood}
          onEdit={handleEditFood}
          onDelete={handleRemoveFood}
        />

        <SelectedFridgeBar
          open={showSelectedBar}
          onClose={() => setShowSelectedBar(false)}
        />
      </div>
    </main>
  );
}
