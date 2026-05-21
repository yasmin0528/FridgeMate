"use client";

import Link from "next/link";
import { useFridgeStore } from "@/store/fridgeStore";
import { useCheckinStore } from "@/store/checkinStore";
import { IngredientChip } from "@/components/IngredientChip";
import { INGREDIENT_BY_ID } from "@/mock/ingredients";
import type { IngredientCategory } from "@/types";

const CATEGORY_ORDER: { key: IngredientCategory; label: string; emoji: string }[] = [
  { key: "protein", label: "蛋白", emoji: "🥩" },
  { key: "veg", label: "蔬菜", emoji: "🥬" },
  { key: "aromatic", label: "调味小菜", emoji: "🧄" },
  { key: "seasoning", label: "调味料", emoji: "🧂" },
  { key: "dairy", label: "乳制", emoji: "🥛" },
  { key: "fruit", label: "水果", emoji: "🍎" },
];

export default function HomePage() {
  const { inventory, selectedIds, toggleSelect } = useFridgeStore();
  const { streak } = useCheckinStore();

  // Group inventory items by category
  const byCategory = new Map<IngredientCategory, typeof inventory>();
  for (const item of inventory) {
    const ing = INGREDIENT_BY_ID.get(item.ingredientId);
    if (!ing) continue;
    const list = byCategory.get(ing.category) ?? [];
    list.push(item);
    byCategory.set(ing.category, list);
  }

  return (
    <main className="px-4 py-6 flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">今日</h1>
        <p
          className="text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          🔥 连续 {streak} 天
        </p>
      </header>

      {CATEGORY_ORDER.map(({ key, label, emoji }) => {
        const items = byCategory.get(key);
        if (!items || items.length === 0) return null;
        return (
          <section key={key} className="rounded-2xl bg-white p-4">
            <div
              className="text-sm mb-3 flex items-center gap-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <span>{emoji}</span>
              <span>{label}</span>
              <span className="text-xs opacity-60">· {items.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {items.map((it) => {
                const ing = INGREDIENT_BY_ID.get(it.ingredientId);
                const selected = selectedIds.includes(it.ingredientId);
                return (
                  <button
                    key={it.ingredientId}
                    onClick={() => toggleSelect(it.ingredientId)}
                    className="rounded-xl p-3 border flex flex-col items-center gap-1"
                    style={{
                      borderColor: selected
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                      backgroundColor: selected
                        ? "var(--color-primary-light)"
                        : "white",
                    }}
                  >
                    <span className="text-2xl">{ing?.emoji}</span>
                    <span className="text-sm">{ing?.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {selectedIds.length > 0 && (
        <section
          className="sticky bottom-20 z-10 rounded-2xl bg-white p-4 flex flex-col gap-3 shadow-lg border"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            已选 {selectedIds.length} 种
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => (
              <IngredientChip key={id} ingredientId={id} />
            ))}
          </div>
          <Link
            href="/recipes"
            className="block text-center py-3 rounded-full text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            查看推荐菜谱 →
          </Link>
        </section>
      )}
    </main>
  );
}
