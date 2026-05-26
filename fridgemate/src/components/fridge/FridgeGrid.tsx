"use client";

import React, { useCallback } from "react";
import { Food } from "@/types/food";
import { FoodCard } from "./FoodCard";
import { useFridgeStore } from "@/store/fridgeStore";
import { INGREDIENT_BY_ID } from "@/mock/ingredients";

interface FridgeGridProps {
  foods: Food[];
  onFoodClick?: (food: Food) => void;
  onSelect?: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
}

/**
 * FridgeGrid 组件
 * 职责：负责分层展示食材（冷藏层和冷冻层）
 * 特点：
 * - 支持响应式布局（mobile: 2列, tablet: 3列, desktop: 4列）
 * - 分别显示冷藏层和冷冻层
 * - 支持独立滚动
 */
export const FridgeGrid = React.memo(function FridgeGrid({
  foods,
  onFoodClick,
  onSelect,
  onEdit,
  onDelete,
}: FridgeGridProps) {
  const { selectedSet } = useFridgeStore();

  const isFoodSelected = (id: number) => {
    // try map FOODS_DATA numeric id -> ingredient id by name
    const f = foods.find((x) => x.id === id);
    if (f) {
      const match = Array.from(INGREDIENT_BY_ID.values()).find((ing) => ing.name === f.name);
      if (match) return selectedSet.has(match.id);
    }
    return selectedSet.has(String(id));
  };

  const fridgeFoods = foods.filter((f) => f.zone === "fridge");
  const freezeFoods = foods.filter((f) => f.zone === "freeze");

  return (
    <div className="space-y-6">
      {/* 冷藏层 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-4 md:px-6">
          <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
          <h3 className="text-base md:text-lg font-semibold text-gray-800">
            冷藏层
          </h3>
          <span className="text-xs md:text-sm text-gray-500">
            ({fridgeFoods.length}种)
          </span>
        </div>
        <div className="px-4 md:px-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {fridgeFoods.map((food) => (
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
          {fridgeFoods.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <p>暂无食材</p>
            </div>
          )}
        </div>
      </div>

      {/* 冷冻层 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-4 md:px-6">
          <div className="w-1 h-6 bg-purple-400 rounded-full"></div>
          <h3 className="text-base md:text-lg font-semibold text-gray-800">
            冷冻层
          </h3>
          <span className="text-xs md:text-sm text-gray-500">
            ({freezeFoods.length}种)
          </span>
        </div>
        <div className="px-4 md:px-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {freezeFoods.map((food) => (
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
          {freezeFoods.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <p>暂无食材</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
