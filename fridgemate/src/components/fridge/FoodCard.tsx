"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Food } from "@/types/food";
import { FoodAvatar } from "./FoodAvatar";

interface FoodCardProps {
  food: Food;
  isSelected: boolean;
  onSelect: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onDelete?: (food: Food) => void;
}

const STATUS_META = {
  fresh: { label: "新鲜", className: "bg-[#d9f3e1] text-[#1aae39]" },
  soon: { label: "临期", className: "bg-[#fef7d6] text-[#793400]" },
  urgent: { label: "需尽快处理", className: "bg-[#ffe8d4] text-[#dd5b00]" },
} as const;

export const FoodCard = React.memo(function FoodCard({
  food,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: FoodCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Toggle flip on click — same behavior on mobile & desktop, per-card independent
  const handleFlip = useCallback(() => {
    setIsFlipped((current) => !current);
  }, []);

  const handleSelect = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onSelect(food);
    },
    [food, onSelect]
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editName, setEditName] = useState(food.name);
  const [editCount, setEditCount] = useState(String(food.count));
  const [editExpire, setEditExpire] = useState(food.expire);
  const [editZone, setEditZone] = useState<"fridge" | "freeze">(food.zone);
  const [editStatus, setEditStatus] = useState<"fresh" | "soon" | "urgent">(
    food.status ?? "fresh",
  );

  useEffect(() => {
    setEditName(food.name);
    setEditCount(String(food.count));
    setEditExpire(food.expire);
    setEditZone(food.zone);
    setEditStatus(food.status ?? "fresh");
  }, [food]);

  const handleSaveEdit = useCallback(() => {
    const updated: Food = {
      ...food,
      name: editName.trim() || food.name,
      count: Number(editCount) || food.count,
      expire: editExpire,
      zone: editZone,
      status: editStatus,
    };
    onEdit?.(updated);
    setShowEditModal(false);
  }, [editName, editCount, editExpire, editZone, editStatus, food, onEdit]);

  const handleConfirmDelete = useCallback(() => {
    onDelete?.(food);
    setShowDeleteConfirm(false);
  }, [food, onDelete]);

  return (
    <motion.article
      className="h-full rounded-[12px] border border-[#e5e3df] bg-white"
      style={{ boxShadow: isSelected ? "rgba(15, 15, 15, 0.08) 0px 4px 12px 0px" : "rgba(15, 15, 15, 0.04) 0px 1px 2px 0px" }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div
        className="relative h-full w-full cursor-pointer overflow-hidden rounded-[12px]"
        onClick={handleFlip}
      >
        <motion.div className="h-full w-full" style={{ perspective: 1200 }}>
          <motion.div
            className="relative h-full w-full"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front face */}
            <div
              className={`absolute inset-0 flex flex-col justify-between rounded-[12px] border border-[#e5e3df] bg-white ${
                isSelected ? "ring-2 ring-[#5645d4]" : ""
              }`}
              style={{ backfaceVisibility: "hidden" } as React.CSSProperties}
            >
              <div className="relative flex-1 flex items-center justify-center">
                <FoodAvatar name={food.name} category={food.category} size="lg" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(e);
                  }}
                  aria-pressed={isSelected}
                  className={`absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-[6px] border ${
                    isSelected ? "bg-[#5645d4] border-[#5645d4]" : "bg-white border-[#c8c4be]"
                  }`}
                >
                  {isSelected ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </button>

                <div className="absolute left-3 bottom-3">
                  <div
                    className="text-sm font-medium text-[#1a1a1a]"
                    style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}
                  >
                    {food.name}
                  </div>
                  <div
                    className="text-xs text-[#787671]"
                    style={{ fontSize: "13px", lineHeight: 1.4 }}
                  >
                    {food.count} 份
                  </div>
                </div>

                <div
                  className="absolute right-3 bottom-3 text-sm font-bold text-[#37352f]"
                  style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.4 }}
                >
                  {food.expire}
                </div>
                {food.status ? (
                  <div className="absolute left-3 top-3">
                    <span
                      className={`rounded-[6px] px-2 py-1 text-xs font-semibold ${
                        STATUS_META[food.status].className
                      }`}
                    >
                      {STATUS_META[food.status].label}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Back face */}
            <div
              className="absolute inset-0 flex flex-col justify-between rounded-[12px] border border-[#e5e3df] bg-[#f6f5f4]"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" } as React.CSSProperties}
            >
              {/* Detail area */}
              <div className="p-[20px] flex-1 flex flex-col">
                <p
                  className="text-xs font-semibold uppercase text-[#787671]"
                  style={{ fontSize: "11px", fontWeight: 600, lineHeight: 1.4, letterSpacing: "1px" }}
                >
                  食材详情
                </p>
                <p
                  className="mt-3 text-base font-semibold text-[#1a1a1a]"
                  style={{ fontSize: "17px", fontWeight: 600, lineHeight: 1.3 }}
                >
                  {food.name}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1a1a1a]" style={{ fontSize: "15px", lineHeight: 1.5 }}>
                    {food.count} 份
                  </span>
                  <span className="text-sm font-semibold text-[#1a1a1a]" style={{ fontSize: "15px", lineHeight: 1.5 }}>
                    {food.expire}
                  </span>
                </div>
              </div>

              {/* Action buttons — ~20% height */}
              <div className="w-full flex h-[18%] min-h-[44px] overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}
                  className="flex-1 h-full rounded-bl-[12px] text-sm font-semibold text-white flex items-center justify-center"
                  style={{ backgroundColor: "#5645d4", fontSize: "14px", fontWeight: 500, lineHeight: 1.3 }}
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                  className="flex-1 h-full rounded-br-[12px] text-sm font-semibold text-white flex items-center justify-center"
                  style={{ backgroundColor: "#e03131", fontSize: "14px", fontWeight: 500, lineHeight: 1.3 }}
                >
                  删除
                </button>
              </div>

              {/* Inline delete confirm */}
              {showDeleteConfirm && (
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[12px] z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white rounded-[8px] p-4 w-56 text-center shadow-md">
                    <p className="font-semibold text-[#1a1a1a] mb-3" style={{ fontSize: "14px", lineHeight: 1.5 }}>
                      确认删除此食材？
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleConfirmDelete}
                        className="flex-1 rounded-[8px] py-2 text-sm font-medium text-white"
                        style={{ backgroundColor: "#e03131", fontSize: "14px", fontWeight: 500, lineHeight: 1.3 }}
                      >
                        是，删除
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 rounded-[8px] py-2 text-sm font-medium text-[#5d5b54]"
                        style={{ backgroundColor: "#f6f5f4", fontSize: "14px", fontWeight: 500, lineHeight: 1.3 }}
                      >
                        保留
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Edit modal (Portal) */}
      {showEditModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setShowEditModal(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="relative bg-white rounded-[12px] p-[24px] w-full max-w-sm mx-4 z-10"
              style={{ boxShadow: "rgba(15, 15, 15, 0.16) 0px 16px 48px -8px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-base font-semibold text-[#1a1a1a] mb-4"
                style={{ fontSize: "16px", fontWeight: 600, lineHeight: 1.3 }}
              >
                编辑食材
              </h3>
              <div className="space-y-3">
                <div>
                  <label
                    className="text-sm block mb-1 text-[#37352f]"
                    style={{ fontSize: "14px", lineHeight: 1.5 }}
                  >
                    名称
                  </label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-[8px] border border-[#c8c4be] px-3 py-2 text-sm text-[#1a1a1a] bg-white"
                    style={{ fontSize: "16px", lineHeight: 1.55, height: "44px" }}
                  />
                </div>
                <div>
                  <label
                    className="text-sm block mb-1 text-[#37352f]"
                    style={{ fontSize: "14px", lineHeight: 1.5 }}
                  >
                    数量
                  </label>
                  <input
                    value={editCount}
                    onChange={(e) => setEditCount(e.target.value)}
                    type="number"
                    className="w-full rounded-[8px] border border-[#c8c4be] px-3 py-2 text-sm text-[#1a1a1a] bg-white"
                    style={{ fontSize: "16px", lineHeight: 1.55, height: "44px" }}
                  />
                </div>
                <div>
                  <label
                    className="text-sm block mb-1 text-[#37352f]"
                    style={{ fontSize: "14px", lineHeight: 1.5 }}
                  >
                    保质期
                  </label>
                  <input
                    value={editExpire}
                    onChange={(e) => setEditExpire(e.target.value)}
                    className="w-full rounded-[8px] border border-[#c8c4be] px-3 py-2 text-sm text-[#1a1a1a] bg-white"
                    style={{ fontSize: "16px", lineHeight: 1.55, height: "44px" }}
                  />
                </div>
                <div>
                  <label
                    className="text-sm block mb-1 text-[#37352f]"
                    style={{ fontSize: "14px", lineHeight: 1.5 }}
                  >
                    放置层
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`zone-${food.id}`}
                        checked={editZone === 'fridge'}
                        onChange={() => setEditZone('fridge')}
                      />
                      <span className="text-sm text-[#37352f]">冷藏</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`zone-${food.id}`}
                        checked={editZone === 'freeze'}
                        onChange={() => setEditZone('freeze')}
                      />
                      <span className="text-sm text-[#37352f]">冷冻</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label
                    className="text-sm block mb-1 text-[#37352f]"
                    style={{ fontSize: "14px", lineHeight: 1.5 }}
                  >
                    新鲜度
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(
                        e.target.value as "fresh" | "soon" | "urgent",
                      )
                    }
                    className="w-full rounded-[8px] border border-[#c8c4be] px-3 py-2 text-sm text-[#1a1a1a] bg-white"
                    style={{ fontSize: "16px", lineHeight: 1.55, height: "44px" }}
                  >
                    {Object.entries(STATUS_META).map(([value, meta]) => (
                      <option key={value} value={value}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-3 justify-end">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-[8px] px-4 py-2 text-sm font-medium text-[#5d5b54] bg-[#f6f5f4] border border-[#e5e3df]"
                  style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.3 }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded-[8px] px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: "#5645d4", fontSize: "14px", fontWeight: 500, lineHeight: 1.3 }}
                >
                  保存
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </motion.article>
  );
});
