"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFridgeStore } from "@/store/fridgeStore";
import { useRecipeStore } from "@/store/recipeStore";
import { IngredientChip } from "@/components/IngredientChip";
import { MatchCircles } from "@/components/MatchCircles";
import { SlotMachine } from "@/components/SlotMachine";
import type { ScoredRecipe } from "@/lib/match";
import type { Recipe } from "@/types";

type SortMode = "score" | "fatLoss" | "time" | "coverage";

export default function RecipesPage() {
  const router = useRouter();
  const { selectedIds, toggleSelect } = useFridgeStore();
  const { rankedForSelected, slotCandidates } = useRecipeStore();
  const [sort, setSort] = useState<SortMode>("score");
  const [slotFinal, setSlotFinal] = useState<Recipe | null>(null);

  // When user has selected ingredients, only show recipes with non-zero coverage.
  // Otherwise show all recipes so the user can browse.
  const filtered =
    selectedIds.length > 0
      ? rankedForSelected.filter((r) => r.coverage > 0)
      : rankedForSelected;

  // Sort by the active tab, with coverage as a stable tiebreaker so the
  // circle indicators don't appear to jump around within ties.
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
    <main className="px-4 py-6 flex flex-col gap-4">
      <header className="flex items-center gap-2">
        <Link href="/" className="text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">推荐菜谱</h1>
      </header>

      {selectedIds.length > 0 ? (
        <section>
          <div
            className="text-sm mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            已选 {selectedIds.length} 种食材（点击移除）
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => (
              <IngredientChip
                key={id}
                ingredientId={id}
                removable
                onRemove={toggleSelect}
              />
            ))}
          </div>
        </section>
      ) : (
        <div
          className="p-4 rounded-2xl text-sm"
          style={{ backgroundColor: "var(--color-primary-light)" }}
        >
          先去首页选几样食材，我才能推荐
        </div>
      )}

      {slotCandidates.length > 0 && (
        <button
          onClick={handleSlotLaunch}
          className="rounded-2xl py-5 px-6 text-white text-lg font-semibold flex flex-col items-center gap-1"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          🎲 今天不想选择
          <span className="text-sm opacity-90 font-normal">
            让 FridgeMate 帮你定
          </span>
        </button>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(
          [
            ["score", "综合"],
            ["fatLoss", "减脂度"],
            ["time", "时间"],
            ["coverage", "覆盖率"],
          ] as [SortMode, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setSort(k)}
            className="px-3 py-1.5 rounded-full text-sm whitespace-nowrap"
            style={{
              backgroundColor:
                sort === k ? "var(--color-text-primary)" : "transparent",
              color: sort === k ? "white" : "var(--color-text-secondary)",
              border: sort === k ? "none" : "1px solid var(--color-border)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {sorted.map((sr) => (
          <RecipeCard key={sr.recipe.id} scored={sr} />
        ))}
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

function RecipeCard({ scored }: { scored: ScoredRecipe }) {
  const r = scored.recipe;
  return (
    <Link
      href={`/recipes/${r.id}`}
      className="flex gap-3 p-3 rounded-2xl bg-white border"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div
        className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl shrink-0"
        style={{ backgroundColor: "var(--color-primary-light)" }}
      >
        🍳
      </div>
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="font-medium truncate">{r.name}</div>
          <div
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {r.kcal} kcal · {r.cookTimeMin} 分钟
          </div>
        </div>
        <div className="flex items-center justify-between">
          <MatchCircles filled={scored.coverage} />
          <span
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            匹配 {scored.coverage}/5
          </span>
        </div>
      </div>
    </Link>
  );
}
