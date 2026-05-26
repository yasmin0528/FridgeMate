"use client";

import React, { useMemo } from "react";
import { Food } from "@/types/food";
import { getFoodEmoji } from "@/data/foods";

interface FoodAvatarProps {
  name: string;
  category: Food["category"];
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "text-lg",
  md: "text-3xl",
  lg: "text-5xl",
};

/**
 * FoodAvatar 组件
 * 职责：负责食材图标逻辑
 * 特点：使用 useMemo 缓存 emoji 计算，避免重复渲染
 */
export const FoodAvatar = React.memo(function FoodAvatar({
  name,
  category,
  size = "md",
}: FoodAvatarProps) {
  const emoji = useMemo(
    () => getFoodEmoji(name, category),
    [name, category]
  );

  return (
    <div
      className={`flex items-center justify-center ${SIZE_CLASSES[size]}`}
      role="img"
      aria-label={name}
    >
      {emoji}
    </div>
  );
});
