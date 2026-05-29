"use client";

import React from "react";
import { motion } from "framer-motion";
import { Food } from "@/types/food";
import { useFridgeStore } from "@/store/fridgeStore";

interface SelectionOverlayProps {
  food: Food | null;
  open: boolean;
  onClose: () => void;
}

export function SelectionOverlay({ food, open, onClose }: SelectionOverlayProps) {
  const { selectedIds, toggleSelect } = useFridgeStore();

  const isSelected = (f: Food) =>
    selectedIds.includes(f.ingredientId ?? String(f.id));

  const handleToggle = () => {
    if (!food) return;
    toggleSelect(food.ingredientId ?? String(food.id));
  };

  if (!open || !food) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.div
        className="relative z-10 w-full max-w-[414px] bg-surface-elevated rounded-t-[32px] p-6"
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-h3 text-ink">{food.name}</p>
            <p className="text-small mt-1">类别：{food.category} · 剩余：{food.count} 份</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleToggle}
            className="flex-1 btn-primary"
          >
            {isSelected(food) ? "已选中 ✓" : "选择食材"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            关闭
          </button>
        </div>
      </motion.div>
    </div>
  );
}
