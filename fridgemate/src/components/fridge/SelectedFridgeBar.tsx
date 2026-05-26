"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { useFridgeStore } from "@/store/fridgeStore";
import { IngredientChip } from "@/components/IngredientChip";
import { FOODS_DATA } from "@/data/foods";
import { INGREDIENT_BY_ID } from "@/mock/ingredients";
import { useRouter } from "next/navigation";

interface SelectedFridgeBarProps {
  open: boolean;
  onClose: () => void;
}

export const SelectedFridgeBar = React.memo(function SelectedFridgeBar({
  open,
  onClose,
}: SelectedFridgeBarProps) {
  const { selectedIds, toggleSelect, clearSelection } = useFridgeStore();
  const router = useRouter();

  const handleToggle = useCallback(
    (id: string) => {
      toggleSelect(id);
    },
    [toggleSelect]
  );

  const handleConfirm = useCallback(() => {
    if (selectedIds.length === 0) return;
    onClose();
    router.push("/recipes");
  }, [selectedIds.length, onClose, router]);

  if (!open) return null;

  return (
    <motion.div
      className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">已选择 {selectedIds.length} 件食材</p>
          <div className="flex gap-2">
            <button
              onClick={() => clearSelection()}
              className="px-3 py-1 text-sm bg-gray-100 rounded-md"
            >
              清空
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-100 rounded-md"
            >
              关闭
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
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
            onClick={handleConfirm}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg"
          >
            确认食材
          </button>
        </div>
      </div>
    </motion.div>
  );
});
