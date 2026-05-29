"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFridgeStore } from "@/store/fridgeStore";
import { useRecipeStore } from "@/store/recipeStore";
import { IngredientChip } from "@/components/IngredientChip";
import { MatchCircles } from "@/components/MatchCircles";
import { SlotMachine } from "@/components/SlotMachine";
import type { ScoredRecipe } from "@/lib/match";
import type { Recipe } from "@/types";

type SortMode = "score" | "fatLoss" | "time" | "coverage";

const CARD_TINTS = [
  "var(--color-card-mint)",
  "var(--color-card-peach)",
  "var(--color-card-banana)",
  "var(--color-card-lavender)",
  "var(--color-card-sky)",
  "var(--color-card-strawberry)",
];

const SORT_OPTIONS: [SortMode, string, string][] = [
  ["score", "综合推荐", "综合"],
  ["fatLoss", "减脂优先", "减脂"],
  ["time", "时间最短", "时间"],
  ["coverage", "匹配最多", "覆盖"],
];

function getTint(index: number): string {
  return CARD_TINTS[index % CARD_TINTS.length];
}

export default function RecipesPage() {
  const router = useRouter();
  const { selectedIds, toggleSelect } = useFridgeStore();
  const { rankedForSelected, slotCandidates } = useRecipeStore();
  const [sort, setSort] = useState<SortMode>("score");
  const [slotFinal, setSlotFinal] = useState<Recipe | null>(null);

  const filtered =
    selectedIds.length > 0
      ? rankedForSelected.filter((r) => r.coverage > 0)
      : rankedForSelected;

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "score":
        return b.score - a.score;
      case "fatLoss":
        return (
          b.recipe.fatLossScore - a.recipe.fatLossScore ||
          b.coverage - a.coverage
        );
      case "time":
        return (
          a.recipe.cookTimeMin - b.recipe.cookTimeMin ||
          b.coverage - a.coverage
        );
      case "coverage":
        return b.coverage - a.coverage;
    }
  });

  const handleSlotLaunch = () => {
    if (slotCandidates.length === 0) return;
    const idx = Math.floor(Math.random() * slotCandidates.length);
    setSlotFinal(slotCandidates[idx].recipe);
  };

  const handleSlotPick = (r: { id: string }) => {
    setSlotFinal(null);
    router.push(`/recipes/${r.id}`);
  };

  return (
    <main className="px-4 py-6 flex flex-col gap-5" style={{ maxWidth: 414, margin: "0 auto" }}>
      {/* Sticky header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-3"
      >
        <Link
          href="/"
          className="w-10 h-10 rounded-full flex items-center justify-center clay-card"
          aria-label="返回首页"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-h1">推荐菜谱</h1>
      </motion.header>

      {/* Selected ingredients */}
      <AnimatePresence>
        {selectedIds.length > 0 ? (
          <motion.section
            key="selected-ingredients"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="text-small mb-2 flex items-center gap-1.5">
              <span className="text-base">🛒</span>
              <span>已选 <strong style={{ color: "var(--color-primary)" }}>{selectedIds.length}</strong> 种食材，点击可移除</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id, i) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <IngredientChip
                    ingredientId={id}
                    removable
                    onRemove={toggleSelect}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="empty-hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="emotion-card flex items-center gap-3"
            style={{ backgroundColor: "var(--color-card-banana)" }}
          >
            <span className="text-2xl">🤔</span>
            <div>
              <div className="text-h3" style={{ color: "var(--color-ink)" }}>还差一步！</div>
              <div className="text-small" style={{ color: "var(--color-ink-soft)" }}>
                先去首页选几样冰箱里的食材，我来帮你推荐菜谱
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slot machine button */}
      {slotCandidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <button
            onClick={handleSlotLaunch}
            className="w-full rounded-[28px] py-5 px-6 flex flex-col items-center gap-1 btn-primary animate-float"
          >
            <span className="text-lg font-semibold">🎲 今天不想选择</span>
            <span className="text-sm opacity-85 font-normal">
              让 FridgeMate 帮你定
            </span>
          </button>
        </motion.div>
      )}

      {/* Sort tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        {SORT_OPTIONS.map(([k, label, shortLabel], i) => (
          <motion.button
            key={k}
            onClick={() => setSort(k)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.25 }}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all duration-200 ${
              sort === k ? "" : ""
            }`}
            style={{
              backgroundColor:
                sort === k ? "var(--color-primary)" : "transparent",
              color: sort === k ? "var(--color-on-primary)" : "var(--color-ink-soft)",
              boxShadow:
                sort === k
                  ? "0 4px 12px var(--shadow-mint), 0 0 0 1px rgba(255,255,255,0.4) inset"
                  : "0 0 0 1.5px var(--color-hairline) inset",
            }}
          >
            {label}
          </motion.button>
        ))}
      </motion.div>

      {/* Recipe list */}
      <ul className="flex flex-col gap-3">
        <AnimatePresence>
          {sorted.map((sr, i) => (
            <motion.li
              key={sr.recipe.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35, ease: "easeOut" }}
            >
              <RecipeCard scored={sr} tint={getTint(i)} index={i} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {slotFinal && (
        <SlotMachine
          candidates={slotCandidates.map((c) => c.recipe)}
          finalPick={slotFinal}
          onDone={handleSlotPick}
        />
      )}
    </main>
  );
}

function RecipeCard({
  scored,
  tint,
  index,
}: {
  scored: ScoredRecipe;
  tint: string;
  index: number;
}) {
  const r = scored.recipe;

  // Difficulty stars
  const difficultyStars = "⭐".repeat(r.difficulty);

  return (
    <Link
      href={`/recipes/${r.id}`}
      className="block bento-cell"
      style={{ backgroundColor: tint }}
    >
      <div className="p-4 flex gap-4 items-center">
        {/* Emoji avatar */}
        <div
          className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center text-3xl shrink-0"
          style={{
            backgroundColor: "rgba(255,255,255,0.7)",
            boxShadow: "0 2px 8px rgba(43,43,43,0.05), 0 0 0 1px rgba(255,255,255,0.5) inset",
          }}
        >
          🍳
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-h3 truncate">{r.name}</h3>
            <span className="text-xs opacity-60">{difficultyStars}</span>
          </div>

          <div className="flex items-center gap-3 text-caption">
            <span className="flex items-center gap-1">
              <span>🔥</span>
              <span>{r.kcal} kcal</span>
            </span>
            <span className="flex items-center gap-1">
              <span>⏱</span>
              <span>{r.cookTimeMin} 分钟</span>
            </span>
            <span className="flex items-center gap-1">
              <span>💪</span>
              <span>{r.protein}g 蛋白</span>
            </span>
          </div>

          {/* Bottom row: match circles + fat loss badge */}
          <div className="flex items-center justify-between mt-0.5">
            <div className="flex items-center gap-2">
              <MatchCircles filled={scored.coverage} />
              <span className="text-caption" style={{ color: "var(--color-ink-muted)" }}>
                匹配 {scored.coverage}/5
              </span>
            </div>
            {r.fatLossScore >= 4 && (
              <span className="badge-fresh text-xs">低卡减脂</span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <div style={{ color: "var(--color-ink-muted)" }} className="shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
