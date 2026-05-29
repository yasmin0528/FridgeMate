"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Food } from "@/types/food";
import { FridgeShelf } from "./FridgeShelf";

export interface FridgeVisualItem extends Food {
  location: "fridge" | "freeze";
}

interface FlatFridgeBackgroundProps {
  items: FridgeVisualItem[];
  className?: string;
  onSelect?: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
}

export function FlatFridgeBackground({
  items,
  className = "",
  onSelect,
  onEdit,
  onDelete,
}: FlatFridgeBackgroundProps) {
  const grouped = useMemo(() => {
    return {
      fridge: items.filter((item) => item.location === "fridge"),
      freeze: items.filter((item) => item.location === "freeze"),
    };
  }, [items]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative mx-auto w-full max-w-5xl ${className}`}
    >
      <div className="absolute inset-x-2 top-0 h-2 rounded-full bg-[#5F5B53]" />

      <div
        className="relative overflow-hidden rounded-[30px] border border-[#5F5B53]/40 bg-[#F8F6F1] p-3 shadow-[0_10px_24px_rgba(43,43,43,0.08)] md:p-4"
      >
        <div className="relative rounded-[26px] border border-[#5F5B53]/45 bg-[#ECE7DF] p-2.5 md:p-3">
          <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.72),transparent_36%),radial-gradient(circle_at_bottom,_rgba(123,207,142,0.12),transparent_40%)]" />

          <div className="relative z-[1] mb-3 flex items-center justify-between gap-3 rounded-[18px] border border-[#5F5B53]/40 bg-[#FFFDF8] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#7BCF8E]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#2B2B2B]">
                冷藏监控
              </span>
            </div>
            <div className="rounded-full border border-[#5F5B53]/40 bg-[#FFFDF8] px-2.5 py-1 text-right">
              <p className="text-[7px] uppercase tracking-[0.24em] text-[#5F5B53]">温度</p>
              <p className="text-[12px] font-bold text-[#2B2B2B]">4°C</p>
            </div>
          </div>

          <div className="relative z-[1] flex flex-col gap-3">
            <FridgeShelf
              variant="fridge"
              title="冷藏区"
              accent="mint"
              items={grouped.fridge}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />

            <FridgeShelf
              variant="freeze"
              title="冷冻区"
              accent="lavender"
              items={grouped.freeze}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
