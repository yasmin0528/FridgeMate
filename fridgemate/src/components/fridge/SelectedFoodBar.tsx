"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { useFoodStore } from "@/store/foodStore";
import { FoodAvatar } from "./FoodAvatar";

interface SelectedFoodBarProps {
  onRecommend: () => void;
}

/**
 * SelectedFoodBar 组件
 * 职责：
 * - 展示已选择的食材
 * - 支持删除单个食材
 * - 支持清空全部
 * - 显示已选食材数量
 * - 跳转到菜谱推荐页
 */
export const SelectedFoodBar = React.memo(function SelectedFoodBar({
  onRecommend,
}: SelectedFoodBarProps) {
  const selectedFoods = useFoodStore((state) => state.selectedFoods);
  const removeFood = useFoodStore((state) => state.removeFood);
  const clearFoods = useFoodStore((state) => state.clearFoods);

  const handleRemoveFood = useCallback(
    (e: React.MouseEvent, foodId: string) => {
      e.stopPropagation();
      removeFood(foodId);
    },
    [removeFood]
  );

  const handleRecommend = useCallback(() => {
    if (selectedFoods.length === 0) return;
    onRecommend();
  }, [selectedFoods.length, onRecommend]);

  return (
    <motion.div
      className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        {/* 标题和计数 */}
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700">
            已选择 {selectedFoods.length} 种食材
          </p>
        </div>

        {/* 已选食材列表 */}
        {selectedFoods.length > 0 ? (
          <div className="space-y-3">
            {/* 食材显示 */}
            <div className="flex flex-wrap gap-2">
              {selectedFoods.map((food) => (
                <motion.div
                  key={food.id}
                  className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FoodAvatar name={food.name} category={food.category} size="sm" />
                  <span className="text-xs font-medium text-gray-700">
                    {food.name}
                  </span>
                  <button
                    onClick={(e) => handleRemoveFood(e, food.id)}
                    className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={`移除 ${food.name}`}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleRecommend}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                aria-label="推荐菜谱"
              >
                推荐菜谱
              </button>
              <button
                onClick={clearFoods}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                aria-label="清空全部"
              >
                清空
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-gray-400">
            <p className="text-sm">请选择食材</p>
          </div>
        )}
      </div>
    </motion.div>
  );
});
