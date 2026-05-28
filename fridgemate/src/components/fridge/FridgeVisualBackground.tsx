"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Food } from "@/types/food";
import { FoodCard } from "./FoodCard";
import { useFridgeStore } from "@/store/fridgeStore";

/* ═══════════════════════════════════════════════════════════════════════════
 *  FridgeVisualBackground.tsx
 *
 *  A photorealistic fridge interior with two temperature zones:
 *    Freezer (–18°C 冷冻层)
 *    Fridge  ( 4°C  冷藏层)
 *
 *  Inside the fridge layer, foods are arranged on nested shelves/areas
 *  by category so the fridge looks organized, but it's all one zone.
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ── Zone definitions ─────────────────────────────────────────────────── */
interface ZoneDef {
  key: string;
  label: string;
  temp: string;
  zone: "fridge" | "freeze";
  accent: string;
  heightFraction: number;
}

const ZONES: ZoneDef[] = [
  {
    key: "freezer",
    label: "冷冻层",
    temp: "-18°C",
    zone: "freeze",
    accent: "#5b9bd5",
    heightFraction: 0.30,
  },
  {
    key: "fridge",
    label: "冷藏层",
    temp: "4°C",
    zone: "fridge",
    accent: "#70ad47",
    heightFraction: 0.70,
  },
];

/* ── Food → zone assignment ──────────────────────────────────────────── */

function zoneKeyForFood(food: Food): string {
  return food.zone === "freeze" ? "freezer" : "fridge";
}

function partitionByZone(foods: Food[]): Map<string, Food[]> {
  const map = new Map<string, Food[]>();
  for (const z of ZONES) map.set(z.key, []);
  for (const f of foods) {
    map.get(zoneKeyForFood(f))!.push(f);
  }
  return map;
}

/* ── Props ────────────────────────────────────────────────────────────── */
interface FridgeVisualBackgroundProps {
  foods: Food[];
  onFoodClick?: (food: Food) => void;
  onSelect?: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
  className?: string;
}

/* ── Sub-component: a single zone ─────────────────────────────────────── */
function FridgeZone({
  zone,
  items,
  onFoodClick,
  onSelect,
  onEdit,
  onDelete,
  index,
}: {
  zone: ZoneDef;
  items: Food[];
  onFoodClick?: (food: Food) => void;
  onSelect?: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
  index: number;
}) {
  const { selectedSet } = useFridgeStore();

  const isFoodSelected = (id: string) => {
    const f = items.find((x) => x.id === id);
    if (f?.ingredientId) return selectedSet.has(f.ingredientId);
    return selectedSet.has(String(id));
  };

  const isEmpty = items.length === 0;

  return (
    <motion.div
      className="relative w-full shrink-0 overflow-hidden"
      style={{ height: `${zone.heightFraction * 100}%` }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.07 * index,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {/* ── Zone separator edge ── */}
      <div
        className="absolute left-0 right-0 z-20"
        style={{
          top: 0,
          height: "5px",
          background: `linear-gradient(180deg, ${zone.accent}99 0%, ${zone.accent}44 100%)`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)",
          borderRadius: "2px 2px 0 0",
        }}
      />

      {/* ── Zone header label ── */}
      <div className="absolute left-2 top-2 z-30 flex items-center gap-2">
        <span className="text-[9px] font-semibold text-white/80 drop-shadow-sm tracking-[1px]">
          {zone.label.toUpperCase()}
        </span>
        <span className="text-[8px] font-mono text-white/50">({zone.temp})</span>
        {!isEmpty && (
          <span className="text-[8px] font-medium text-white/40">{items.length}</span>
        )}
      </div>

      {/* ── Content area ── */}
      <div className="absolute inset-0 top-[5px] overflow-y-auto px-1.5 pt-7 pb-1.5">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-[10px] tracking-[1.5px]" style={{ color: "rgba(255,255,255,0.18)" }}>
              —— EMPTY ——
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {items.map((food) => (
              <div key={food.id} className="aspect-square min-h-0">
                <FoodCard
                  food={food}
                  isSelected={isFoodSelected(food.id)}
                  onSelect={(f) => (onSelect ? onSelect(f) : onFoodClick?.(f))}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export const FridgeVisualBackground = React.memo(function FridgeVisualBackground({
  foods,
  onFoodClick,
  onSelect,
  onEdit,
  onDelete,
  className = "",
}: FridgeVisualBackgroundProps) {
  const zoneMap = useMemo(() => partitionByZone(foods), [foods]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* ── Outer fridge body ── */}
      <motion.div
        className="w-full rounded-[16px] overflow-hidden relative"
        style={{
          maxWidth: "min(92vw, 520px)",
          height: "clamp(480px, 80vh, 720px)",
          background: "linear-gradient(160deg, #dad6cf 0%, #c8c3ba 50%, #b8b2a8 100%)",
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.12),
            0 0 0 1px rgba(255,255,255,0.20) inset,
            0 1px 0 0 rgba(0,0,0,0.06) inset
          `,
        }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* ── Door seal strip ── */}
        <div className="absolute inset-x-0 top-0 z-30 h-1.5 rounded-t-[16px]"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 100%)" }}
        />

        {/* ── Interior chamber ── */}
        <div
          className="absolute inset-[2px] rounded-[14px] overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.30) 0%, transparent 65%),
              linear-gradient(180deg, #f4f2ef 0%, #e8e5e0 50%, #ddd9d3 100%)
            `,
            boxShadow: "inset 0 4px 20px rgba(0,0,0,0.08), inset 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* ── Back-panel fine texture ── */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 3px)
              `,
            }}
          />

          {/* ── Top light glow ── */}
          <div
            className="absolute top-0 left-[8%] right-[8%] h-14 z-0 rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(255,255,235,0.35) 0%, transparent 70%)",
              filter: "blur(6px)",
            }}
          />

          {/* ── Shelves container ── */}
          <div className="relative z-[1] flex flex-col h-full px-1 pb-1">
            {/* Status bar */}
            <div className="flex items-center justify-between px-2 h-7 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
                <span className="text-[8px] font-semibold text-black/30 tracking-[1px]">COOLING</span>
              </div>
              <span className="text-[8px] font-mono font-semibold text-black/25">
                {new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* Zones: freezer + fridge */}
            {ZONES.map((zone, i) => (
              <FridgeZone
                key={zone.key}
                zone={zone}
                items={zoneMap.get(zone.key) ?? []}
                onFoodClick={onFoodClick}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* ── Frame border accent ── */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[16px]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25), inset 0 0 0 2px rgba(0,0,0,0.04)" }}
        />
      </motion.div>
    </div>
  );
});

export { ZONES, partitionByZone, zoneKeyForFood };
