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
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
};

const BG_CLASSES: Record<string, string> = {
  vegetable: "bg-card-mint",
  fruit: "bg-card-peach",
  meat: "bg-card-strawberry",
  drink: "bg-card-sky",
  grain: "bg-card-banana",
  protein: "bg-card-lavender",
  seafood: "bg-card-sky",
};

export const FoodAvatar = React.memo(function FoodAvatar({
  name,
  category,
  size = "md",
}: FoodAvatarProps) {
  const emoji = useMemo(
    () => getFoodEmoji(name, category),
    [name, category]
  );

  const bgClass = BG_CLASSES[category] || "bg-surface";

  return (
    <div
      className={`flex items-center justify-center rounded-2xl ${bgClass} ${SIZE_CLASSES[size]} floating-element`}
      style={{
        width: size === "sm" ? 36 : size === "md" ? 52 : 80,
        height: size === "sm" ? 36 : size === "md" ? 52 : 80,
      }}
      role="img"
      aria-label={name}
    >
      {emoji}
    </div>
  );
});
