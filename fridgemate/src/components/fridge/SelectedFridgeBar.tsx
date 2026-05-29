"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { useFridgeStore } from "@/store/fridgeStore";
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

  const handleConfirm = useCallback(() => {
    if (selectedIds.length === 0) return;
    onClose();
    router.push("/recipes");
  }, [onClose, router, selectedIds.length]);

  if (!open) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "rgba(255, 253, 248, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 -4px 24px rgba(43, 43, 43, 0.08)",
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="px-5 py-4 max-w-[414px] mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-small font-semibold text-ink">
            已选择 {selectedIds.length} 件食材
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="btn-ghost text-caption"
            >
              收起
            </button>
            <button
              onClick={() => clearSelection()}
              className="btn-ghost text-caption"
            >
              清空
            </button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedIds.map((id) => {
              const ing = INGREDIENT_BY_ID.get(id);
              if (!ing) return null;
              return (
                <button
                  key={id}
                  onClick={() => toggleSelect(id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all"
                  style={{
                    backgroundColor: "var(--color-card-lavender)",
                    color: "var(--color-ink)",
                  }}
                >
                  <span>{ing.emoji}</span>
                  <span>{ing.name}</span>
                  <span className="text-ink-muted">✕</span>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={selectedIds.length === 0}
          className="w-full btn-primary text-[15px] font-medium"
          style={{
            opacity: selectedIds.length === 0 ? 0.5 : 1,
            cursor: selectedIds.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          看看能做什么菜
        </button>
      </div>
    </motion.div>
  );
});
