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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-xl rounded-t-2xl bg-white p-5 md:rounded-2xl md:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">{food.name}</p>
            <p className="mt-1 text-sm text-slate-500">类别：{food.category}</p>
          </div>
          <div className="text-sm text-slate-500">剩余：{food.count} 份</div>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-600">保质期：{food.expire}</p>

          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => {
              const f = FOODS_DATA.find((x) => String(x.id) === id);
              if (f) {
                return (
                  <div key={id} className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800">
                    {f.name}
                  </div>
                );
              }
              const ing = INGREDIENT_BY_ID.get(id);
              if (ing) {
                return (
                  <div key={id} className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800">
                    {ing.name}
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleToggle}
              className={`flex-1 rounded-2xl px-4 py-2 text-sm font-medium ${isSelected(food) ? "bg-slate-900 text-white" : "bg-white border border-slate-200"}`}
            >
              {isSelected(food) ? "已选中" : "选择食材"}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium"
            >
              关闭
            </button>
          </div>

          <div className="mt-2 text-xs text-slate-500">点击空白处关闭</div>
        </div>
      </div>
    </div>
  );
}
