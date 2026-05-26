"use client";

import React, { useCallback } from "react";
import { Food } from "@/types/food";
import { useFridgeStore } from "@/store/fridgeStore";
import { FOODS_DATA } from "@/data/foods";
import { INGREDIENT_BY_ID } from "@/mock/ingredients";

interface SelectionOverlayProps {
  food: Food | null;
  open: boolean;
  onClose: () => void;
}

export function SelectionOverlay({ food, open, onClose }: SelectionOverlayProps) {
  const { selectedIds, toggleSelect } = useFridgeStore();

  const isSelected = (f: Food) => selectedIds.includes(String(f.id));

  const handleToggle = useCallback(() => {
    if (!food) return;
    toggleSelect(String(food.id));
  }, [food, toggleSelect]);

  const handleConfirm = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!open || !food) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full rounded-t-[12px] bg-white p-[24px]"
        style={{
          boxShadow: "rgba(15, 15, 15, 0.16) 0px -8px 32px -8px",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-sm font-semibold text-[#1a1a1a]"
              style={{ fontSize: "16px", fontWeight: 600, lineHeight: 1.3 }}
            >
              {food.name}
            </p>
            <p
              className="mt-1 text-sm text-[#5d5b54]"
              style={{ fontSize: "14px", lineHeight: 1.5 }}
            >
              类别：{food.category}
            </p>
          </div>
          <div
            className="text-sm text-[#5d5b54]"
            style={{ fontSize: "14px", lineHeight: 1.5 }}
          >
            剩余：{food.count} 份
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <p
            className="text-sm text-[#787671]"
            style={{ fontSize: "14px", lineHeight: 1.5 }}
          >
            保质期：{food.expire}
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleToggle}
              className={`flex-1 rounded-[8px] px-4 py-2.5 text-sm font-medium ${
                isSelected(food)
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-white border border-[#c8c4be] text-[#1a1a1a]"
              }`}
              style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.3 }}
            >
              {isSelected(food) ? "已选中" : "选择食材"}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-[8px] border border-[#c8c4be] px-4 py-2.5 text-sm font-medium text-[#1a1a1a]"
              style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.3 }}
            >
              关闭
            </button>
          </div>

          <div
            className="text-center text-xs text-[#a4a097]"
            style={{ fontSize: "12px", lineHeight: 1.4 }}
          >
            点击空白处关闭
          </div>
        </div>
      </div>
    </div>
  );
}
