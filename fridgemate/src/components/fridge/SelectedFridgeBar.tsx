"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { useFridgeStore } from "@/store/fridgeStore";
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
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e3df] z-40"
      style={{ boxShadow: "rgba(15, 15, 15, 0.16) 0px -4px 16px -4px" }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <p
            className="text-sm font-medium text-[#37352f]"
            style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}
          >
            已选择 {selectedIds.length} 件食材
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => clearSelection()}
              className="rounded-[8px] px-3 py-1.5 text-sm font-medium text-[#5d5b54] bg-[#f6f5f4] border border-[#e5e3df]"
              style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.3 }}
            >
              清空
            </button>
            <button
              onClick={onClose}
              className="rounded-[8px] px-3 py-1.5 text-sm font-medium text-[#5d5b54] bg-[#f6f5f4] border border-[#e5e3df]"
              style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.3 }}
            >
              关闭
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {selectedIds.map((id) => {
            const f = FOODS_DATA.find((x) => x.id === id);
            if (f) {
              return (
                <div
                  key={id}
                  className="rounded-[6px] bg-[#e6e0f5] px-3 py-1 text-sm font-medium text-[#391c57]"
                  style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.4 }}
                >
                  {f.name}
                </div>
              );
            }
            const ing = INGREDIENT_BY_ID.get(id);
            if (ing) {
              return (
                <div
                  key={id}
                  className="rounded-[6px] bg-[#e6e0f5] px-3 py-1 text-sm font-medium text-[#391c57]"
                  style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.4 }}
                >
                  {ing.name}
                </div>
              );
            }
            return null;
          })}
        </div>

        <button
          onClick={handleConfirm}
          className="w-full rounded-[8px] py-2.5 px-4 text-sm font-medium text-white"
          style={{
            backgroundColor: "#5645d4",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: 1.3,
          }}
        >
          确认食材
        </button>
      </div>
    </motion.div>
  );
});
