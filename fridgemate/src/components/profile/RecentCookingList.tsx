"use client";

import Link from "next/link";
import { useMemo } from "react";
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

export function RecentCookingList({ history }: RecentCookingListProps) {
  const { getRecipe } = useRecipeStore();

  const recent = useMemo(
    () => sortHistoryDesc(history).slice(0, RECENT_COOKING_LIMIT),
    [history]
  );

  return (
    <section className="rounded-2xl bg-white p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-semibold">最近完成</h2>
        {history.length > 0 && (
          <span
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            最近 {Math.min(history.length, RECENT_COOKING_LIMIT)} 条
          </span>
        )}
      </div>

      {recent.length === 0 ? (
        <p
          className="text-sm py-6 text-center"
          style={{ color: "var(--color-text-secondary)" }}
        >
          还没有做饭记录，做完一道菜会自动出现在这里
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {recent.map((event) => {
            const recipe = getRecipe(event.recipeId);
            const title = recipe?.name ?? event.recipeId;
            const meta = recipe
              ? `约 ${recipe.cookTimeMin} 分钟`
              : "菜谱已下架";

            return (
              <li key={event.timestamp}>
                <Link
                  href={`/recipes/${event.recipeId}`}
                  className="flex items-center gap-3 rounded-xl border p-3 active:opacity-80"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: "var(--color-primary-light)" }}
                    aria-hidden
                  >
                    🍳
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{title}</div>
                    <div
                      className="text-xs mt-0.5 flex flex-wrap gap-x-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <span>{formatCookingLabel(event.timestamp)}</span>
                      <span style={{ color: "var(--color-text-tertiary)" }}>
                        ·
                      </span>
                      <span>{meta}</span>
                    </div>
                  </div>
                  <span
                    className="text-sm shrink-0"
                    style={{ color: "var(--color-text-tertiary)" }}
                    aria-hidden
                  >
                    ›
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
