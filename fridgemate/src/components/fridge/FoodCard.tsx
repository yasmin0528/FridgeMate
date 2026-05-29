"use client";

import React, { useCallback, useState } from "react";
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
  fresh: { label: "新鲜", className: "badge-fresh" },
  soon: { label: "临期", className: "badge-soon" },
  urgent: { label: "需尽快处理", className: "badge-urgent" },
} as const;

const CATEGORY_META: Record<Food["category"], string> = {
  vegetable: "蔬菜",
  fruit: "水果",
  meat: "肉类",
  drink: "饮品",
  seafood: "海鲜",
  grain: "主食",
  protein: "高蛋白",
  other: "其他",
};

function StatusBadge({ status }: { status: keyof typeof STATUS_META }) {
  return (
    <span className={STATUS_META[status].className}>
      {STATUS_META[status].label}
    </span>
  );
}

export const FoodCard = React.memo(function FoodCard({
  food,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: FoodCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const status = food.status ?? "fresh";

  const handleFlip = useCallback(() => {
    setIsFlipped((current) => !current);
  }, []);

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
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
    <motion.div
      className="relative w-full cursor-pointer select-none overflow-hidden rounded-[20px] border border-[var(--color-hairline)]"
      style={{
        backgroundColor: "var(--color-surface-elevated)",
        boxShadow: "0 6px 16px rgba(43,43,43,0.08), 0 0 0 1px rgba(255,255,255,0.6) inset",
        aspectRatio: "1 / 1",
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleFlip}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          transformStyle: "preserve-3d",
          perspective: 1000,
          width: "100%",
          height: "100%",
        }}
      >
        {/* 正面 */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="relative h-full px-3 pt-3 pb-2">
            <div className="absolute left-2 top-2 z-10">
              <StatusBadge status={status} />
            </div>

            <div className="absolute top-2 right-2 z-10">
              <motion.button
                type="button"
                onClick={handleSelect}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isSelected ? "var(--color-primary)" : "var(--color-surface-elevated)",
                  boxShadow: isSelected
                    ? "0 2px 6px rgba(123, 207, 142, 0.35)"
                    : "0 1px 3px rgba(43,43,43,0.08)",
                  border: isSelected ? "none" : "1.5px solid var(--color-hairline)",
                }}
                whileTap={{ scale: 0.85 }}
                animate={isSelected ? { scale: [1, 1.22, 1] } : {}}
                transition={{ duration: 0.25 }}
              >
                {isSelected ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </motion.button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <FoodAvatar name={food.name} category={food.category} size="md" />
            </div>

            <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-ink truncate leading-tight">
                  {food.name}
                </div>
                <div className="mt-1 text-[10px]" style={{ color: "var(--color-ink-muted)" }}>
                  {food.count} 份
                </div>
              </div>

              <div className="text-[11px] font-bold text-ink whitespace-nowrap">
                {food.expire}
              </div>
            </div>
          </div>
        </div>

        {/* 背面 */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="relative flex h-full flex-col justify-between bg-[var(--color-surface)]">
            <div className="px-3 pt-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--color-ink-muted)" }}>
                详细信息
              </div>
              <div className="space-y-1 text-[10px]" style={{ color: "var(--color-ink-soft)" }}>
                <p className="text-[12px] font-semibold text-ink">{food.name}</p>
                <p className="text-[11px] font-medium" style={{ color: "var(--color-ink-soft)" }}>
                  {food.count} 份 · {food.expire}
                </p>
                <p className="text-[11px] font-medium" style={{ color: "var(--color-ink-soft)" }}>
                  {CATEGORY_META[food.category]} · {STATUS_META[status].label}
                </p>
              </div>
            </div>

            <div className="mt-auto h-[14%] min-h-8 overflow-hidden rounded-b-[16px]">
              <div className="grid h-full grid-cols-2 gap-px">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditName(food.name);
                    setEditCount(String(food.count));
                    setEditExpire(food.expire);
                    setEditZone(food.zone);
                    setEditStatus(food.status ?? "fresh");
                    setShowEditModal(true);
                  }}
                  className="h-full text-[9px] font-semibold leading-none text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="h-full text-[9px] font-semibold leading-none"
                  style={{ color: "var(--color-error)", backgroundColor: "var(--color-card-strawberry)" }}
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 删除确认 */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/25"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-40 rounded-[24px] border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] p-3 text-center"
            style={{ boxShadow: "0 10px 24px rgba(43,43,43,0.16)" }}
          >
            <p className="font-semibold text-ink mb-2 text-[11px]">确认删除？</p>
            <div className="flex gap-1.5">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-1.5 rounded-full text-[10px] font-medium text-white"
                style={{ backgroundColor: "var(--color-error)" }}
              >
                删除
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-1.5 rounded-full text-[10px] font-medium"
                style={{ backgroundColor: "var(--color-surface)", color: "var(--color-ink-soft)" }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑弹层 */}
      {showEditModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-20"
            onClick={() => setShowEditModal(false)}
          >
            <div className="absolute inset-0 bg-black/25" />
            <motion.div
              className="relative z-10 w-full max-w-sm rounded-t-[28px] bg-[var(--color-surface-elevated)] p-5"
              style={{ boxShadow: "0 -4px 24px rgba(43,43,43,0.10)" }}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-[16px] font-semibold text-ink mb-4">编辑食材</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[12px] text-ink-soft block mb-1">名称</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-full border px-4 py-2.5 text-[14px] text-ink outline-none"
                    style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-surface-soft)" }}
                  />
                </div>
                <div>
                  <label className="text-[12px] text-ink-soft block mb-1">数量</label>
                  <input
                    value={editCount}
                    onChange={(e) => setEditCount(e.target.value)}
                    type="number"
                    className="w-full rounded-full border px-4 py-2.5 text-[14px] text-ink outline-none"
                    style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-surface-soft)" }}
                  />
                </div>
                <div>
                  <label className="text-[12px] text-ink-soft block mb-1">保质期</label>
                  <input
                    value={editExpire}
                    onChange={(e) => setEditExpire(e.target.value)}
                    className="w-full rounded-full border px-4 py-2.5 text-[14px] text-ink outline-none"
                    style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-surface-soft)" }}
                  />
                </div>
                <div>
                  <label className="text-[12px] text-ink-soft block mb-1">放置层</label>
                  <div className="flex gap-3">
                    {(["fridge", "freeze"] as const).map((z) => (
                      <label key={z} className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name={`zone-${food.id}`}
                          checked={editZone === z}
                          onChange={() => setEditZone(z)}
                          className="accent-primary"
                        />
                        <span className="text-[12px]" style={{ color: "var(--color-ink-soft)" }}>
                          {z === "fridge" ? "冷藏" : "冷冻"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-ink-soft block mb-1">新鲜度</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "fresh" | "soon" | "urgent")}
                    className="w-full rounded-full border px-4 py-2.5 text-[14px] text-ink outline-none"
                    style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-surface-soft)" }}
                  >
                    {Object.entries(STATUS_META).map(([value, meta]) => (
                      <option key={value} value={value}>{meta.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-full text-[12px] font-medium"
                  style={{ backgroundColor: "var(--color-surface)", color: "var(--color-ink-soft)" }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 rounded-full text-[12px] font-medium btn-primary"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </motion.div>
  );
});
