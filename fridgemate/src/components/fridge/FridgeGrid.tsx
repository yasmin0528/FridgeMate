"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
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

function partitionByZone(foods: Food[]) {
  const map = new Map<string, Food[]>();
  map.set("fridge", []);
  map.set("freeze", []);
  for (const f of foods) {
    map.get(f.zone)!.push(f);
  }
  return map;
}

const ZONE_META: Record<string, { label: string; emoji: string; accent: string; bg: string }> = {
  fridge: { label: "冷藏", emoji: "🧊", accent: "var(--color-accent-sky)", bg: "var(--color-card-sky)" },
  freeze: { label: "冷冻", emoji: "❄️", accent: "var(--color-accent-lavender)", bg: "var(--color-card-lavender)" },
};

function ZoneSection({ zone, items, onFoodClick, onSelect, onEdit, onDelete, index }: {
  zone: string;
  items: Food[];
  onFoodClick?: (food: Food) => void;
  onSelect?: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
  index: number;
}) {
  const { selectedSet } = useFridgeStore();
  const meta = ZONE_META[zone] || { label: zone, emoji: "📦", accent: "var(--color-hairline)", bg: "var(--color-surface)" };

  const isFoodSelected = (food: Food) => {
    const id = food.ingredientId ?? String(food.id);
    return selectedSet.has(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      <div className="flex items-center gap-2 mb-3 mt-4 first:mt-0">
        <div
          className="w-1 h-5 rounded-full"
          style={{ backgroundColor: meta.accent }}
        />
        <span className="text-[15px] font-semibold text-ink">
          {meta.emoji} {meta.label}
        </span>
        <span className="text-caption">{items.length} 件</span>
      </div>
      {items.length === 0 ? (
        <div
          className="rounded-[28px] p-6 flex items-center justify-center"
          style={{ backgroundColor: meta.bg }}
        >
          <span className="text-caption">暂无食材</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              isSelected={isFoodSelected(food)}
              onSelect={(f) => onSelect?.(f) ?? onFoodClick?.(f)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export const FridgeGrid = React.memo(function FridgeGrid({
  foods,
  onFoodClick,
  onSelect,
  onEdit,
  onDelete,
}: FridgeGridProps) {
  const zoneMap = useMemo(() => partitionByZone(foods), [foods]);

  if (foods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="text-6xl mb-4 animate-float">🥬</div>
        <p className="text-h2 mb-1">冰箱空空的</p>
        <p className="text-small text-center">
          去「扫描」页面拍张冰箱照片<br />或者手动添加食材吧
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {Array.from(zoneMap.entries()).map(([zone, items], i) => (
        items.length > 0 && (
          <ZoneSection
            key={zone}
            zone={zone}
            items={items}
            onFoodClick={onFoodClick}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            index={i}
          />
        )
      ))}
    </div>
  );
});
