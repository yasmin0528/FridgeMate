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

export const FoodCard = React.memo(function FoodCard({
  food,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: FoodCardProps) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFlip = useCallback(() => {
    if (isMobile) {
      setIsFlipped((current) => !current);
    }
  }, [isMobile]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      setIsFlipped(true);
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      setIsFlipped(false);
    }
  }, [isMobile]);

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

  useEffect(() => {
    setEditName(food.name);
    setEditCount(String(food.count));
    setEditExpire(food.expire);
    setEditZone(food.zone);
  }, [food]);

  const handleSaveEdit = useCallback(() => {
    const updated: Food = {
      ...food,
      name: editName.trim() || food.name,
      count: Number(editCount) || food.count,
      expire: editExpire,
      zone: editZone,
    };
    onEdit?.(updated);
    setShowEditModal(false);
  }, [editName, editCount, editExpire, editZone, food, onEdit]);

  const handleConfirmDelete = useCallback(() => {
    onDelete?.(food);
    setShowDeleteConfirm(false);
  }, [food, onDelete]);

  return (
    <motion.article
      className="h-full rounded-[28px] border border-slate-200 bg-white shadow-sm"
      whileHover={!isMobile ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div
        className="relative h-full w-full cursor-pointer overflow-hidden rounded-[28px]"
        onClick={handleFlip}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div className="h-full w-full" style={{ perspective: 1200 }}>
          <motion.div
            className="relative h-full w-full"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* 正面 */}
            <div
              className={`absolute inset-0 flex flex-col justify-between rounded-[28px] border border-slate-200 bg-white transition-all ${
                isSelected ? "shadow-lg" : "shadow-sm"
              }`}
              style={{ backfaceVisibility: "hidden" } as React.CSSProperties}
            >
              <div className="relative flex-1 flex items-center justify-center">
                <FoodAvatar name={food.name} category={food.category} size="lg" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(e as any);
                  }}
                  aria-pressed={isSelected}
                  className={`absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-sm border ${
                    isSelected ? "bg-slate-900 border-slate-900" : "bg-white border-slate-300"
                  }`}
                >
                  {isSelected ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </button>

                <div className="absolute left-3 bottom-3">
                  <div className="text-sm font-medium text-slate-900">{food.name}</div>
                  <div className="text-xs text-slate-600">{food.count} 份</div>
                </div>

                <div className="absolute right-3 bottom-3 text-lg font-bold text-slate-800">{food.expire}</div>
              </div>
            </div>

            {/* 背面 */}
            <div
              className="absolute inset-0 flex flex-col justify-between rounded-[28px] border border-slate-200 bg-slate-50"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" } as React.CSSProperties}
            >
              {/* 上半部分：详情文本 */}
              <div className="p-5 flex-1">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">食材详情</p>
                  <div className="mt-4 flex items-center gap-3">
                    <p className="text-lg font-semibold text-slate-900">{food.name}</p>
                    <span className="text-sm text-slate-500 capitalize">{food.category}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{food.expire}</p>
                </div>
              </div>

              {/* 下半部分：操作按钮栏 */}
              <div className="w-full flex h-14 overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}
                  className="flex-1 h-full rounded-bl-[28px] bg-lime-600 px-4 text-sm font-semibold text-white hover:brightness-95 flex items-center justify-center"
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                  className="flex-1 h-full rounded-br-[28px] bg-rose-600 px-4 text-sm font-semibold text-white hover:brightness-95 flex items-center justify-center"
                >
                  删除
                </button>
              </div>

              {/* 内嵌的删除确认弹窗 */}
              {showDeleteConfirm && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[28px] z-20" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-white rounded-xl p-4 w-56 text-center shadow-md">
                    <p className="font-semibold mb-3">确认删除此食材？</p>
                    <div className="flex gap-3">
                      <button onClick={handleConfirmDelete} className="flex-1 bg-rose-600 text-white py-2 rounded-md">是，删除</button>
                      <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-100 py-2 rounded-md">保留</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 独立的编辑模态框（Portal） */}
      {showEditModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowEditModal(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-lg z-10" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-3">编辑食材</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm block mb-1">名称</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border rounded px-2 py-2" />
                </div>
                <div>
                  <label className="text-sm block mb-1">数量</label>
                  <input value={editCount} onChange={(e) => setEditCount(e.target.value)} type="number" className="w-full border rounded px-2 py-2" />
                </div>
                <div>
                  <label className="text-sm block mb-1">保质期</label>
                  <input value={editExpire} onChange={(e) => setEditExpire(e.target.value)} className="w-full border rounded px-2 py-2" />
                </div>
                <div>
                  <label className="text-sm block mb-1">放置层</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name={`zone-${food.id}`} checked={editZone === 'fridge'} onChange={() => setEditZone('fridge')} /> 
                      <span>冷藏</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name={`zone-${food.id}`} checked={editZone === 'freeze'} onChange={() => setEditZone('freeze')} /> 
                      <span>冷冻</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-3 justify-end">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-100 rounded-md">取消</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-lime-600 text-white rounded-md">保存</button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </motion.article>
  );
});