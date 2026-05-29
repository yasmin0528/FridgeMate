"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Food } from "@/types/food";
import { FoodCard } from "./FoodCard";
import { useFridgeStore } from "@/store/fridgeStore";

/* ── Props ────────────────────────────────────────────────────────────── */
interface FridgeVisualBackgroundProps {
  foods: Food[];
  onSelect?: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
  className?: string;
}

/* ── Shelf zone config ────────────────────────────────────────────────── */
const ZONE_STYLES = {
  freeze: {
    label: "冷冻室",
    emoji: "❄️",
    accent: "#CDBDFF",
    bgColor: "#F1EBFF",
    shelfColor: "#B8A8E8",
  },
  fridge: {
    label: "冷藏室",
    emoji: "🧊",
    accent: "#BFE7FF",
    bgColor: "#E8F6FF",
    shelfColor: "#8ECAE6",
  },
};

/* ── Food → zone partitioning ─────────────────────────────────────────── */
function partitionByZone(foods: Food[]) {
  const map = new Map<string, Food[]>();
  map.set("freeze", []);
  map.set("fridge", []);
  for (const f of foods) {
    map.get(f.zone)?.push(f);
  }
  return map;
}

/* ── Single shelf/compartment ─────────────────────────────────────────── */
function FridgeShelf({
  zoneKey,
  items,
  onSelect,
  onEdit,
  onDelete,
  index,
}: {
  zoneKey: string;
  items: Food[];
  onSelect?: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
  index: number;
}) {
  const zone = ZONE_STYLES[zoneKey as keyof typeof ZONE_STYLES];
  const { selectedSet } = useFridgeStore();

  const isFoodSelected = (food: Food) => {
    const id = food.ingredientId ?? String(food.id);
    return selectedSet.has(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Shelf label */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px]">{zone.emoji}</span>
        <span className="text-[12px] font-semibold tracking-[0.3px]" style={{ color: "var(--color-ink)" }}>
          {zone.label}
        </span>
        {items.length > 0 && (
          <span className="text-[10px]" style={{ color: "var(--color-ink-muted)" }}>
            {items.length}
          </span>
        )}
      </div>

      {/* Compartment */}
      <div
        className="relative"
        style={FRIDGE_OUTER_STYLE}
      >
        <div
          className="absolute left-0 top-0 h-full w-[20%]"
          style={FRIDGE_DOOR_STYLE}
        />
        <div
          className="absolute right-0 top-0 h-full w-[20%]"
          style={FRIDGE_DOOR_STYLE}
        />
        <div
          className="relative z-10 flex flex-col gap-4 p-4"
          style={FRIDGE_SHELF_STYLE}
        >
          {items.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <span
                className="text-[11px] font-medium tracking-[0.5px]"
                style={{ color: zone.accent + "80" }}
              >
                -- 空的 --
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {items.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  isSelected={isFoodSelected(food)}
                  onSelect={(f) => onSelect?.(f)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Shelf accent strip */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            background: `linear-gradient(90deg, transparent 5%, ${zone.shelfColor} 30%, ${zone.shelfColor} 70%, transparent 95%)`,
            opacity: 0.3,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export const FridgeVisualBackground = React.memo(function FridgeVisualBackground({
  foods,
  onSelect,
  onEdit,
  onDelete,
  className = "",
}: FridgeVisualBackgroundProps) {
  const zoneMap = useMemo(() => partitionByZone(foods), [foods]);

  const shelves = useMemo(
    () => [
      { key: "freeze", items: zoneMap.get("freeze") ?? [] },
      { key: "fridge", items: zoneMap.get("fridge") ?? [] },
    ],
    [zoneMap],
  );

  const anyFood = foods.length > 0;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Zone shelves */}
      {anyFood ? (
        <div
          className="relative"
          style={FRIDGE_OUTER_STYLE}
        >
          <div
            className="absolute left-0 top-0 h-full w-[20%]"
            style={FRIDGE_DOOR_STYLE}
          />
          <div
            className="absolute right-0 top-0 h-full w-[20%]"
            style={FRIDGE_DOOR_STYLE}
          />
          <div
            className="relative z-10 flex flex-col gap-4 p-4"
            style={FRIDGE_SHELF_STYLE}
          >
            {shelves.map((shelf, i) => (
              <FridgeShelf
                key={shelf.key}
                zoneKey={shelf.key}
                items={shelf.items}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                index={i}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <span className="text-3xl mb-2 animate-float">🥬</span>
          <p className="text-[13px] font-medium" style={{ color: "var(--color-ink-soft)" }}>
            冰箱空空的
          </p>
          <p className="text-[11px]" style={{ color: "var(--color-ink-muted)" }}>
            快去扫点食材吧
          </p>
        </div>
      )}
    </div>
  );
});

export { partitionByZone };

const FRIDGE_OUTER_STYLE = {
  background: "#FFFDF8",
  border: "2px solid #F3EFE8",
  boxShadow: "0 4px 12px rgba(43, 43, 43, 0.1)",
  borderRadius: "16px",
};

const FRIDGE_DOOR_STYLE = {
  background: "#FFE7BF",
  border: "1.5px solid #F3EFE8",
};

const FRIDGE_SHELF_STYLE = {
  background: "#E8F6FF",
  border: "1px solid #BFE7FF",
};
