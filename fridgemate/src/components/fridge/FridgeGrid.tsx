"use client";

import React from "react";
import { Food } from "@/types/food";
import { FoodCard } from "./FoodCard";
import { useFridgeStore } from "@/store/fridgeStore";

interface FridgeGridProps {
  foods: Food[];
  onFoodClick?: (food: Food) => void;
  onSelect?: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
}

export const FridgeGrid = React.memo(function FridgeGrid({
  foods,
  onFoodClick,
  onSelect,
  onEdit,
  onDelete,
}: FridgeGridProps) {
  const { selectedSet } = useFridgeStore();

  const isFoodSelected = (id: number) => {
    const f = foods.find((x) => x.id === id);
    if (f?.ingredientId) return selectedSet.has(f.ingredientId);
    return selectedSet.has(String(id));
  };

  const fridgeFoods = foods.filter((f) => f.zone === "fridge");
  const freezeFoods = foods.filter((f) => f.zone === "freeze");

  const renderZone = (title: string, items: Food[], accentColor: string) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className="w-1 h-5 rounded-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />
        <h3
          className="text-sm font-semibold text-[#1a1a1a]"
          style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.5 }}
        >
          {title}
        </h3>
        <span className="text-xs text-[#787671]" style={{ fontSize: "13px", lineHeight: 1.4 }}>
          ({items.length}种)
        </span>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((food) => (
              <div key={food.id} className="aspect-square">
                <FoodCard
                  food={food}
                  isSelected={isFoodSelected(food.id)}
                  onSelect={(f) => onSelect ? onSelect(f) : onFoodClick?.(f)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#a4a097]">
            <p className="text-sm">暂无食材</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderZone("冷藏层", fridgeFoods, "#5645d4")}
      {renderZone("冷冻层", freezeFoods, "#7b3ff2")}
    </div>
  );
});
