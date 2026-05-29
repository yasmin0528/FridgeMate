"use client";

import { motion } from "framer-motion";
import type { Food } from "@/types/food";
import { useFridgeStore } from "@/store/fridgeStore";
import { FoodCard } from "./FoodCard";

interface FridgeShelfProps {
  variant?: "fridge" | "freeze";
  items: Food[];
  title?: string;
  accent?: "mint" | "lavender";
  className?: string;
  onSelect?: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
}

const VARIANT_STYLES = {
  fridge: {
    shell: "border-[#7BCF8E]/70 bg-[#BFE7FF]/40",
    glow: "bg-[#7BCF8E]/60",
    line: "from-[#FFFDF8] via-[#7BCF8E] to-[#FFFDF8]",
  },
  freeze: {
    shell: "border-[#7BCF8E]/70 bg-[#BFE7FF]/40",
    glow: "bg-[#7BCF8E]/60",
    line: "from-[#FFFDF8] via-[#7BCF8E] to-[#FFFDF8]",
  },
} as const;

const ACCENT_STYLES = {
  mint: {
    border: "border-[#7BCF8E]/70",
    panel: "bg-[#BFE7FF]/40",
  },
  lavender: {
    border: "border-[#7BCF8E]/70",
    panel: "bg-[#BFE7FF]/40",
  },
} as const;

export function FridgeShelf({
  variant = "fridge",
  items,
  title,
  accent = "mint",
  className = "",
  onSelect,
  onEdit,
  onDelete,
}: FridgeShelfProps) {
  const { selectedIds } = useFridgeStore();
  const variantStyle = VARIANT_STYLES[variant];
  const accentStyle = ACCENT_STYLES[accent];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative flex h-[26vh] min-h-0 flex-col overflow-hidden rounded-[24px] border ${accentStyle.border} ${variantStyle.shell} p-3 shadow-[0_6px_16px_rgba(43,43,43,0.08)] md:h-[30vh] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-white/35" />
      <div
        className={`pointer-events-none absolute inset-x-4 top-2 h-4 rounded-full bg-gradient-to-r ${variantStyle.line} opacity-80`}
      />
      <div className={`pointer-events-none absolute inset-x-6 top-3 h-2 rounded-full ${variantStyle.glow} opacity-80`} />

      {title && (
        <div className="mb-2 flex shrink-0 items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#2B2B2B]">
            {title}
          </p>
          <span className="rounded-full border border-[#5F5B53]/40 bg-[#FFFDF8] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.24em] text-[#5F5B53]">
            {variant === "fridge" ? "冷藏层" : "冷冻层"}
          </span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[16px] border border-[#5F5B53]/30 bg-[#FFFDF8]/70 pr-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#5F5B53]/40">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {items.length === 0 ? (
            <div className="col-span-full rounded-[14px] border border-dashed border-[#5F5B53]/35 px-3 py-6 text-center text-[10px] font-semibold text-[#5F5B53]">
              暂无食材
            </div>
          ) : (
            items.map((food) => (
              <div
                key={food.id}
                className="rounded-[14px] border border-[#5F5B53]/30 bg-[#FFFDF8] p-0.5"
              >
                <FoodCard
                  food={food}
                  isSelected={selectedIds.includes(food.ingredientId ?? String(food.id))}
                  onSelect={(f) => onSelect?.(f)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-2 shrink-0 rounded-full border border-[#5F5B53]/35 bg-[#FFE7BF]/50 px-2 py-1">
        <div className="h-1.5 rounded-full bg-[#7BCF8E]/70" />
      </div>
    </motion.section>
  );
}
