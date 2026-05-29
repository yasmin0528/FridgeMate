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

/* ── Card tint map by category ──────────────────────────────────────────── */

const CATEGORY_TINT: Record<IngredientCategory, string> = {
  vegetable: "var(--color-card-mint)",
  fruit: "var(--color-card-peach)",
  dairy: "var(--color-card-sky)",
  meat: "var(--color-card-strawberry)",
  grain: "var(--color-card-banana)",
  protein: "var(--color-card-lavender)",
};

/* ── Ingredient Card ────────────────────────────────────────────────────── */

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

  const cardBg = CATEGORY_TINT[item.category] || "var(--color-card-mint)";

  const CATEGORY_OPTIONS: Array<{ value: IngredientCategory; label: string }> = [
    { value: "vegetable", label: "蔬菜" },
    { value: "fruit", label: "水果" },
    { value: "dairy", label: "乳制品" },
    { value: "meat", label: "肉类" },
    { value: "grain", label: "主食" },
    { value: "protein", label: "高蛋白" },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: -120, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative rounded-[28px] overflow-hidden"
      style={{
        backgroundColor: cardBg,
        boxShadow:
          "0 2px 8px rgba(43,43,43,0.05), 0 0 0 1px rgba(255,255,255,0.6) inset",
      }}
    >
      <div className="p-4 space-y-3">
        {/* Row 1: name + status badge + delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <input
                value={item.name}
                onChange={(e) => onUpdate(item.id, "name", e.target.value)}
                className="w-full rounded-2xl px-4 py-2.5 text-sm font-medium outline-none transition-all"
                style={{
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color: "var(--color-ink)",
                  backgroundColor: "var(--color-surface-elevated)",
                  border: "1.5px solid var(--color-hairline)",
                  boxShadow:
                    "0 1px 4px rgba(43,43,43,0.04), 0 0 0 1px rgba(255,255,255,0.4) inset",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-primary)";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(123, 207, 142, 0.15), 0 1px 4px rgba(43,43,43,0.04)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--color-hairline)";
                  e.target.style.boxShadow =
                    "0 1px 4px rgba(43,43,43,0.04), 0 0 0 1px rgba(255,255,255,0.4) inset";
                }}
              />
            </div>
            {(item.source || typeof item.confidence === "number") && (
              <p className="mt-1.5 text-caption" style={{ color: "var(--color-ink-muted)" }}>
                来源: {item.source || "待确认"} · 置信度:{" "}
                {typeof item.confidence === "number"
                  ? `${Math.round(item.confidence * 100)}%`
                  : "待确认"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Status badge using globals.css classes */}
            <span
              className={
                item.status === "fresh"
                  ? "badge-fresh"
                  : item.status === "soon"
                    ? "badge-soon"
                    : "badge-urgent"
              }
            >
              {item.status === "fresh"
                ? "\u65B0\u9C9C"
                : item.status === "soon"
                  ? "\u4E34\u671F"
                  : "\u7D27\u6025"}
            </span>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                color: "var(--color-ink-muted)",
                backgroundColor: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(4px)",
                boxShadow: "0 1px 4px rgba(43,43,43,0.04)",
              }}
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
            <label className="text-caption block mb-1.5 font-semibold" style={{ color: "var(--color-ink-soft)" }}>
              数量
            </label>
            <div
              className="flex items-center rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--color-surface-elevated)",
                border: "1.5px solid var(--color-hairline)",
                boxShadow:
                  "0 1px 4px rgba(43,43,43,0.04), 0 0 0 1px rgba(255,255,255,0.4) inset",
              }}
            >
              <button
                type="button"
                onClick={handleQtyMinus}
                className="w-10 h-[42px] flex items-center justify-center transition-colors"
                style={{ color: "var(--color-ink-muted)" }}
                aria-label="减少数量"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <span
                className="flex-1 text-center text-sm font-semibold min-w-[3rem] leading-[42px]"
                style={{ color: "var(--color-ink)", backgroundColor: "var(--color-surface-elevated)" }}
              >
                {item.amount}
              </span>
              <button
                type="button"
                onClick={handleQtyPlus}
                className="w-10 h-[42px] flex items-center justify-center transition-colors"
                style={{ color: "var(--color-ink-muted)" }}
                aria-label="增加数量"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="text-caption block mb-1.5 font-semibold" style={{ color: "var(--color-ink-soft)" }}>
              保质期
            </label>
            <div className="relative">
              <input
                value={shelfLifeDays}
                onChange={handleShelfLifeChange}
                inputMode="decimal"
                min="0"
                type="number"
                className="w-full h-[42px] rounded-2xl px-4 text-sm font-semibold outline-none transition-all"
                style={{
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color: "var(--color-ink)",
                  backgroundColor: "var(--color-surface-elevated)",
                  border: "1.5px solid var(--color-hairline)",
                  boxShadow:
                    "0 1px 4px rgba(43,43,43,0.04), 0 0 0 1px rgba(255,255,255,0.4) inset",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-primary)";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(123, 207, 142, 0.15), 0 1px 4px rgba(43,43,43,0.04)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--color-hairline)";
                  e.target.style.boxShadow =
                    "0 1px 4px rgba(43,43,43,0.04), 0 0 0 1px rgba(255,255,255,0.4) inset";
                }}
              />
              <span
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-caption"
                style={{ color: "var(--color-ink-muted)" }}
              >
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
            className="flex-1 h-[38px] rounded-2xl px-3 text-xs font-medium outline-none transition-all appearance-none"
            style={{
              color: "var(--color-ink-soft)",
              backgroundColor: "var(--color-surface-elevated)",
              border: "1.5px solid var(--color-hairline)",
              boxShadow:
                "0 1px 4px rgba(43,43,43,0.04), 0 0 0 1px rgba(255,255,255,0.4) inset",
            }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div
            className="flex rounded-2xl overflow-hidden shrink-0"
            style={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1.5px solid var(--color-hairline)",
            }}
          >
            <button
              type="button"
              onClick={() => onUpdate(item.id, "zone", "fridge")}
              className="px-3.5 h-[38px] text-xs font-medium transition-all"
              style={{
                color: item.zone === "fridge" ? "var(--color-primary-deep)" : "var(--color-ink-muted)",
                backgroundColor:
                  item.zone === "fridge"
                    ? "var(--color-card-mint)"
                    : "transparent",
              }}
            >
              冷藏
            </button>
            <button
              type="button"
              onClick={() => onUpdate(item.id, "zone", "freeze")}
              className="px-3.5 h-[38px] text-xs font-medium transition-all"
              style={{
                color: item.zone === "freeze" ? "var(--color-primary-deep)" : "var(--color-ink-muted)",
                backgroundColor:
                  item.zone === "freeze"
                    ? "var(--color-card-sky)"
                    : "transparent",
              }}
            >
              冷冻
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center rounded-[28px] z-10"
            style={{
              backgroundColor: "rgba(43, 43, 43, 0.25)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="rounded-[20px] p-5 w-52 text-center"
              style={{
                backgroundColor: "var(--color-surface-elevated)",
                boxShadow:
                  "0 8px 24px rgba(43,43,43,0.12), 0 0 0 1px rgba(255,255,255,0.6) inset",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-h3 mb-4" style={{ color: "var(--color-ink)" }}>
                确认删除此食材？
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { onDelete(item.id); setShowDeleteConfirm(false); }}
                  className="btn-primary flex-1 h-10 text-sm"
                  style={{ backgroundColor: "var(--color-error)" }}
                >
                  删除
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary flex-1 h-10 text-sm"
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

const MESSAGE_TINT: Record<string, { bg: string; icon: string; label: string }> = {
  info: {
    bg: "var(--color-card-banana)",
    icon: "\uD83D\uDCE2",
    label: "提示",
  },
  success: {
    bg: "var(--color-card-mint)",
    icon: "\u2714\uFE0F",
    label: "太棒了",
  },
  error: {
    bg: "var(--color-card-strawberry)",
    icon: "\u26A0\uFE0F",
    label: "哎呀",
  },
};

function MessageBanner({
  message,
  type,
}: {
  message: string;
  type: "info" | "success" | "error";
}) {
  const meta = MESSAGE_TINT[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl px-4 py-3 flex items-start gap-2.5"
      style={{
        backgroundColor: meta.bg,
        boxShadow: "0 1px 4px rgba(43,43,43,0.04), 0 0 0 1px rgba(255,255,255,0.4) inset",
      }}
    >
      <span className="text-base leading-none mt-0.5 shrink-0">{meta.icon}</span>
      <div>
        <p className="text-caption font-semibold mb-0.5" style={{ color: "var(--color-ink-soft)" }}>
          {meta.label}
        </p>
        <p className="text-small font-medium" style={{ color: "var(--color-ink)" }}>
          {message}
        </p>
      </div>
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
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(43, 43, 43, 0.3)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Drawer — claymorphism card */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
            style={{
              maxHeight: "85vh",
              maxWidth: 414,
              margin: "0 auto",
              backgroundColor: "var(--color-canvas)",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              boxShadow:
                "0 -8px 32px rgba(43,43,43,0.1), 0 0 0 1px rgba(255,255,255,0.8) inset",
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
            <div className="flex justify-center pt-4 pb-2 shrink-0">
              <div
                className="w-10 h-1.5 rounded-full"
                style={{ backgroundColor: "var(--color-hairline)" }}
              />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 shrink-0" style={{ borderBottom: "1px solid var(--color-hairline-soft)" }}>
              <p className="text-caption font-semibold" style={{ color: "var(--color-primary-deep)" }}>
                识别结果
              </p>
              <h2 className="text-h3 mt-0.5" style={{ color: "var(--color-ink)" }}>
                修改、删除或补充食材
              </h2>
            </div>

            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto px-5 py-3 space-y-3"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "var(--color-hairline) transparent",
              }}
            >
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
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: "var(--color-card-banana)" }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </motion.div>
                    <p className="text-body font-medium mb-4" style={{ color: "var(--color-ink-soft)" }}>
                      暂无识别结果
                    </p>
                    <button
                      type="button"
                      onClick={onAdd}
                      className="btn-primary"
                    >
                      添加第一个食材
                    </button>
                  </motion.div>
                )}

                {/* Add new ingredient button */}
                {ingredients.length > 0 && (
                  <motion.button
                    key="add-button"
                    type="button"
                    onClick={onAdd}
                    className="w-full rounded-[28px] py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all"
                    style={{
                      color: "var(--color-ink-muted)",
                      border: "2px dashed var(--color-hairline)",
                      backgroundColor: "transparent",
                    }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{
                      color: "var(--color-primary-deep)",
                      borderColor: "var(--color-primary)",
                      backgroundColor: "var(--color-card-mint)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    添加新食材
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom action bar */}
            <div
              className="px-5 py-4 shrink-0"
              style={{
                borderTop: "1px solid var(--color-hairline-soft)",
                backgroundColor: "var(--color-canvas)",
                borderBottomLeftRadius: 32,
                borderBottomRightRadius: 32,
              }}
            >
              <div
                className="rounded-2xl p-4 mb-3"
                style={{
                  backgroundColor: "var(--color-surface)",
                  boxShadow:
                    "0 1px 4px rgba(43,43,43,0.04), 0 0 0 1px rgba(255,255,255,0.6) inset",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-caption font-semibold" style={{ color: "var(--color-ink-muted)" }}>
                      {hasInvalidRows ? "需补全" : "待同步"}
                    </p>
                    <p className="text-small font-semibold mt-0.5" style={{ color: "var(--color-ink)" }}>
                      {hasInvalidRows
                        ? "请补全食材名称、数量和保质期"
                        : "确认后同步到冰箱库存"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-h2" style={{ color: "var(--color-primary-deep)" }}>
                      {ingredients.length}
                    </p>
                    <p className="text-caption" style={{ color: "var(--color-ink-muted)" }}>
                      识别食材
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onConfirmSync}
                disabled={ingredients.length === 0}
                className="btn-primary w-full h-12 text-base"
                style={{
                  opacity: ingredients.length === 0 ? 0.4 : 1,
                }}
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
