"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ──────────────────────────────────────────────────────────────── */

export type IngredientStatus = "fresh" | "soon" | "urgent";
export type IngredientZone = "fridge" | "freeze";
export type IngredientCategory =
  | "vegetable" | "fruit" | "dairy" | "meat" | "grain" | "protein";

export interface ScanIngredient {
  id: number;
  name: string;
  amount: string;
  shelfLife: string;
  status: IngredientStatus;
  zone: IngredientZone;
  category: IngredientCategory;
  confidence?: number;
  source?: string;
}

interface RecognitionDrawerProps {
  isOpen: boolean;
  ingredients: ScanIngredient[];
  message: string;
  messageType: "info" | "success" | "error";
  onClose: () => void;
  onUpdate: (id: number, field: keyof Omit<ScanIngredient, "id">, value: string) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  onConfirmSync: () => void;
  hasInvalidRows: boolean;
}

/* ── Status meta ─────────────────────────────────────────────────────────── */

const STATUS_META: Record<
  IngredientStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  fresh: {
    label: "新鲜",
    bg: "bg-[#d9f3e1]",
    text: "text-[#1aae39]",
    dot: "bg-[#1aae39]",
  },
  soon: {
    label: "临期",
    bg: "bg-[#fef7d6]",
    text: "text-[#793400]",
    dot: "bg-[#dd5b00]",
  },
  urgent: {
    label: "需尽快处理",
    bg: "bg-[#ffe8d4]",
    text: "text-[#dd5b00]",
    dot: "bg-[#e03131]",
  },
};

const CATEGORY_OPTIONS: Array<{ value: IngredientCategory; label: string }> = [
  { value: "vegetable", label: "蔬菜" },
  { value: "fruit", label: "水果" },
  { value: "dairy", label: "乳制品" },
  { value: "meat", label: "肉类" },
  { value: "grain", label: "主食" },
  { value: "protein", label: "高蛋白" },
];

/* ── Status badge ───────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: IngredientStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[11px] font-semibold ${meta.bg} ${meta.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

/* ── Single Ingredient Card (color-coded per DESIGN.md) ─────────────────── */

function IngredientCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: ScanIngredient;
  onUpdate: (id: number, field: keyof Omit<ScanIngredient, "id">, value: string) => void;
  onDelete: (id: number) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleQtyPlus = useCallback(() => {
    const current = parseInt(item.amount.match(/\d+/)?.[0] ?? "1", 10);
    onUpdate(item.id, "amount", `${current + 1} 份`);
  }, [item, onUpdate]);

  const handleQtyMinus = useCallback(() => {
    const current = parseInt(item.amount.match(/\d+/)?.[0] ?? "1", 10);
    if (current > 1) {
      onUpdate(item.id, "amount", `${current - 1} 份`);
    }
  }, [item, onUpdate]);

  const handleShelfLifeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, "");
      onUpdate(item.id, "shelfLife", val ? `${val} 天` : "");
    },
    [item.id, onUpdate],
  );

  const shelfLifeDays = item.shelfLife.match(/\d+/)?.[0] ?? "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: -120, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative rounded-[12px] border border-[#e5e3df] bg-white overflow-hidden"
    >
      <div className="p-4 space-y-3">
        {/* Row 1: name input + status badge + delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <input
              value={item.name}
              onChange={(e) => onUpdate(item.id, "name", e.target.value)}
              className="w-full rounded-[8px] border border-[#c8c4be] px-3 py-2 text-sm font-medium text-[#1a1a1a] bg-white outline-none focus:border-2 focus:border-[#5645d4]"
              style={{ fontSize: "14px", lineHeight: 1.5, height: "40px" }}
            />
            {(item.source || typeof item.confidence === "number") && (
              <p className="mt-1 text-[11px] text-[#787671]">
                来源: {item.source || "待确认"} · 置信度:{" "}
                {typeof item.confidence === "number"
                  ? `${Math.round(item.confidence * 100)}%`
                  : "待确认"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={item.status} />
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#a4a097] bg-white/60 hover:text-[#e03131] hover:bg-[#ffe8d4] transition-colors"
              aria-label={`删除 ${item.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Row 2: quantity stepper + shelf life */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#5d5b54] mb-1">
              数量
            </label>
            <div className="flex items-center rounded-[8px] border border-[#c8c4be] bg-white overflow-hidden">
              <button
                type="button"
                onClick={handleQtyMinus}
                className="w-9 h-10 flex items-center justify-center text-[#787671] hover:bg-[#f6f5f4] active:bg-[#e5e3df] transition-colors"
                aria-label="减少数量"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <span className="flex-1 text-center text-sm font-semibold text-[#1a1a1a] min-w-[3rem] bg-white">
                {item.amount}
              </span>
              <button
                type="button"
                onClick={handleQtyPlus}
                className="w-9 h-10 flex items-center justify-center text-[#787671] hover:bg-[#f6f5f4] active:bg-[#e5e3df] transition-colors"
                aria-label="增加数量"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#5d5b54] mb-1">
              保质期
            </label>
            <div className="relative">
              <input
                value={shelfLifeDays}
                onChange={handleShelfLifeChange}
                inputMode="decimal"
                min="0"
                type="number"
                className="w-full h-10 rounded-[8px] border border-[#c8c4be] bg-white px-3 pr-10 text-sm font-semibold text-[#1a1a1a] outline-none focus:border-2 focus:border-[#5645d4]"
                style={{ fontSize: "14px", lineHeight: 1.5 }}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#787671]">
                天
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: category + zone */}
        <div className="flex items-center gap-2">
          <select
            value={item.category}
            onChange={(e) =>
              onUpdate(item.id, "category", e.target.value as IngredientCategory)
            }
            className="flex-1 h-9 rounded-[8px] border border-[#c8c4be] bg-white px-2 text-xs font-medium text-[#37352f] outline-none focus:border-2 focus:border-[#5645d4]"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={item.zone}
            onChange={(e) =>
              onUpdate(item.id, "zone", e.target.value as IngredientZone)
            }
            className="w-20 h-9 rounded-[8px] border border-[#c8c4be] bg-white px-2 text-xs font-medium text-[#37352f] outline-none focus:border-2 focus:border-[#5645d4]"
          >
            <option value="fridge">冷藏</option>
            <option value="freeze">冷冻</option>
          </select>
        </div>
      </div>

      {/* Delete confirm overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-[12px] z-10"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="bg-white rounded-[12px] p-4 w-52 text-center shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-semibold text-[#1a1a1a] mb-3">
                确认删除此食材？
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { onDelete(item.id); setShowDeleteConfirm(false); }}
                  className="flex-1 h-9 rounded-[8px] bg-[#e03131] text-sm font-medium text-white"
                >
                  删除
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-9 rounded-[8px] bg-[#f6f5f4] text-sm font-medium text-[#5d5b54]"
                >
                  取消
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Message Banner ─────────────────────────────────────────────────────── */

function MessageBanner({
  message,
  type,
}: {
  message: string;
  type: "info" | "success" | "error";
}) {
  const bgMap = {
    info: "bg-[#ffe8d4] text-[#793400]",
    success: "bg-[#d9f3e1] text-[#1aae39]",
    error: "bg-[#ffe8d4] text-[#e03131]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`rounded-[8px] px-3 py-2.5 text-xs font-medium ${bgMap[type]}`}
    >
      {message}
    </motion.div>
  );
}

/* ── Main Drawer ────────────────────────────────────────────────────────── */

export const RecognitionDrawer = React.memo(function RecognitionDrawer({
  isOpen,
  ingredients,
  message,
  messageType,
  onClose,
  onUpdate,
  onDelete,
  onAdd,
  onConfirmSync,
  hasInvalidRows,
}: RecognitionDrawerProps) {
  const [dragY, setDragY] = useState(0);

  const handleDragEnd = useCallback(
    (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
      if (info.offset.y > 120 || info.velocity.y > 500) {
        onClose();
      }
      setDragY(0);
    },
    [onClose],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-[20px]"
            style={{
              maxHeight: "85vh",
              maxWidth: 414,
              margin: "0 auto",
              boxShadow: "rgba(15, 15, 15, 0.16) 0px -8px 32px -4px",
            }}
            initial={{ y: "100%" }}
            animate={{ y: dragY }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 200 }}
            dragElastic={0.2}
            onDrag={(_, info) => setDragY(Math.max(0, info.offset.y))}
            onDragEnd={handleDragEnd}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#c8c4be]" />
            </div>

            {/* Header — NO add button, just title */}
            <div className="px-5 pb-3 shrink-0 border-b border-[#ede9e4]">
              <p className="text-xs font-semibold text-[#5645d4]">
                识别结果
              </p>
              <h2 className="text-base font-semibold text-[#1a1a1a] mt-0.5">
                修改、删除或补充食材
              </h2>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              <AnimatePresence mode="popLayout">
                {message && (
                  <MessageBanner key="message" message={message} type={messageType} />
                )}

                {ingredients.length > 0 ? (
                  ingredients.map((item) => (
                    <motion.div key={item.id} layout>
                      <IngredientCard
                        item={item}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center"
                  >
                    <p className="text-sm font-medium text-[#787671]">
                      暂无识别结果
                    </p>
                    <button
                      type="button"
                      onClick={onAdd}
                      className="mt-4 h-10 px-4 rounded-[8px] bg-[#5645d4] text-sm font-medium text-white"
                    >
                      添加第一个食材
                    </button>
                  </motion.div>
                )}

                {/* ONLY dotted "添加新食材" entry — NO header add button */}
                {ingredients.length > 0 && (
                  <motion.button
                    key="add-button"
                    type="button"
                    onClick={onAdd}
                    className="w-full rounded-[12px] border-2 border-dashed border-[#c8c4be] py-4 flex items-center justify-center gap-2 text-sm font-medium text-[#787671] hover:text-[#5645d4] hover:border-[#5645d4] transition-colors"
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    添加新食材
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom action bar */}
            <div className="px-5 py-4 border-t border-[#ede9e4] bg-white rounded-b-[20px] shrink-0">
              <div className="mb-3 rounded-[8px] bg-[#f6f5f4] p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#787671]">
                      {hasInvalidRows ? "需补全" : "待同步"}
                    </p>
                    <p className="text-sm font-semibold text-[#37352f] mt-0.5">
                      {hasInvalidRows
                        ? "请补全食材名称、数量和保质期"
                        : `确认后同步到冰箱库存`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-[#1a1a1a]">
                      {ingredients.length}
                    </p>
                    <p className="text-xs text-[#787671]">识别食材</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onConfirmSync}
                disabled={ingredients.length === 0}
                className="w-full h-11 rounded-[8px] text-sm font-medium text-white bg-[#5645d4] disabled:bg-[#e5e3df] disabled:text-[#bbb8b1] transition-colors"
              >
                确认同步至冰箱
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
