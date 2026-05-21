"use client";

import Link from "next/link";
import { useFridgeStore } from "@/store/fridgeStore";
import { useCheckinStore } from "@/store/checkinStore";
import { IngredientChip } from "@/components/IngredientChip";
import { INGREDIENT_BY_ID } from "@/mock/ingredients";

export default function HomePage() {
  const { inventory, selectedIds, toggleSelect } = useFridgeStore();
  const { streak } = useCheckinStore();

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

      <section className="rounded-2xl bg-white p-4">
        <div
          className="text-sm mb-2"
          style={{ color: "var(--color-text-secondary)" }}
        >
          郑以琳 · 数字冰箱（占位实现）
        </div>
        <div className="grid grid-cols-3 gap-3">
          {inventory.map((it) => {
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

      {selectedIds.length > 0 && (
        <section className="rounded-2xl bg-white p-4 flex flex-col gap-3">
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
