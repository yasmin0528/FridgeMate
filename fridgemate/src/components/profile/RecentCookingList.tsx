"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import type { CookingDoneEvent } from "@/types";
import { useRecipeStore } from "@/store/recipeStore";
import {
  RECENT_COOKING_LIMIT,
  formatCookingLabel,
  sortHistoryDesc,
} from "@/lib/cookingHistory";

interface RecentCookingListProps {
  history: CookingDoneEvent[];
}

/** 根据菜谱名取一个表情图标和卡片色调 */
function getRecipeEmojiAndTint(
  name: string
): { emoji: string; tint: string } {
  const lower = name.toLowerCase();

  if (lower.includes("蛋") || lower.includes("egg"))
    return { emoji: "\uD83C\uDF73", tint: "var(--color-card-banana)" };
  if (lower.includes("鸡") || lower.includes("chicken") || lower.includes("肉"))
    return { emoji: "\uD83C\uDF57", tint: "var(--color-card-peach)" };
  if (lower.includes("鱼") || lower.includes("fish") || lower.includes("虾"))
    return { emoji: "\uD83D\uDC1F", tint: "var(--color-card-sky)" };
  if (lower.includes("蔬") || lower.includes("沙拉") || lower.includes("salad") || lower.includes("菜"))
    return { emoji: "\uD83E\uDD66", tint: "var(--color-card-mint)" };
  if (lower.includes("汤") || lower.includes("soup"))
    return { emoji: "\uD83C\uDF72", tint: "var(--color-card-lavender)" };
  if (lower.includes("面") || lower.includes("noodle") || lower.includes("rice") || lower.includes("饭"))
    return { emoji: "\uD83C\uDF5C", tint: "var(--color-card-banana)" };
  if (lower.includes("甜") || lower.includes("dessert") || lower.includes("cake") || lower.includes("饼"))
    return { emoji: "\uD83C\uDF70", tint: "var(--color-card-strawberry)" };
  if (lower.includes("牛") || lower.includes("beef"))
    return { emoji: "\uD83E\uDD69", tint: "var(--color-card-peach)" };

  return { emoji: "\uD83C\uDF7D\uFE0F", tint: "var(--color-card-mint)" };
}

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 22 },
  },
};

export function RecentCookingList({ history }: RecentCookingListProps) {
  const { getRecipe } = useRecipeStore();

  const recent = useMemo(
    () => sortHistoryDesc(history).slice(0, RECENT_COOKING_LIMIT),
    [history]
  );

  return (
    <motion.section
      className="clay-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring" as const, stiffness: 160, damping: 20, delay: 0.2 }}
    >
      {/* 标题栏 */}
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-h3">&#x6700;&#x8FD1;&#x5B8C;&#x6210;</h2>
        {history.length > 0 && (
          <motion.span
            className="text-caption"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            最近 {Math.min(history.length, RECENT_COOKING_LIMIT)} 条
          </motion.span>
        )}
      </div>

      {/* 空状态 */}
      {recent.length === 0 ? (
        <motion.div
          className="flex flex-col items-center py-8 gap-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" as const, stiffness: 150, damping: 18 }}
        >
          <span className="text-4xl animate-float" aria-hidden>
            &#x1F373;
          </span>
          <p className="text-small text-center">
            还没有做饭记录
          </p>
          <p
            className="text-caption text-center"
            style={{ maxWidth: 240 }}
          >
            完成一道菜后，记录会自动出现在这里
          </p>
        </motion.div>
      ) : (
        <motion.ul
          className="flex flex-col gap-2.5"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {recent.map((event, idx) => {
            const recipe = getRecipe(event.recipeId);
            const title = recipe?.name ?? event.recipeId;
            const meta = recipe
              ? `约 ${recipe.cookTimeMin} 分钟`
              : "菜谱已下架";

            const { emoji, tint } = getRecipeEmojiAndTint(title);

            return (
              <motion.li key={event.timestamp} variants={itemVariants}>
                <Link
                  href={`/recipes/${event.recipeId}`}
                  className="flex items-center gap-3.5 rounded-2xl p-3.5 active:opacity-80"
                  style={{
                    background: "var(--color-surface-elevated)",
                    boxShadow:
                      "0 1px 6px rgba(43,43,43,0.05), 0 0 0 1px var(--color-hairline-soft) inset",
                  }}
                >
                  {/* 表情图标容器 - 带颜色背景 */}
                  <motion.div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
                    style={{
                      background: tint,
                      boxShadow:
                        "0 2px 8px rgba(43,43,43,0.06), 0 0 0 1px rgba(255,255,255,0.4) inset",
                    }}
                    aria-hidden
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                  >
                    {emoji}
                  </motion.div>

                  {/* 文字信息 */}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate" style={{ color: "var(--color-ink)" }}>
                      {title}
                    </div>
                    <div
                      className="text-xs mt-1 flex flex-wrap gap-x-2"
                      style={{ color: "var(--color-ink-soft)" }}
                    >
                      <span>{formatCookingLabel(event.timestamp)}</span>
                      <span style={{ color: "var(--color-hairline)" }}>&#xB7;</span>
                      <span style={{ color: "var(--color-ink-muted)" }}>{meta}</span>
                    </div>
                  </div>

                  {/* 箭头 */}
                  <motion.span
                    className="text-base shrink-0"
                    style={{ color: "var(--color-hairline)" }}
                    aria-hidden
                  >
                    &#x203A;
                  </motion.span>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </motion.section>
  );
}
