"use client";

import { INGREDIENT_BY_ID } from "@/mock/ingredients";

interface Props {
  ingredientId: string;
  removable?: boolean;
  onRemove?: (id: string) => void;
}

export function IngredientChip({ ingredientId, removable, onRemove }: Props) {
  const ing = INGREDIENT_BY_ID.get(ingredientId);
  if (!ing) return null;
  return (
    <button
      type="button"
      onClick={() => removable && onRemove?.(ingredientId)}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-small animate-float"
      style={{
        backgroundColor: "var(--color-card-lavender)",
        color: "var(--color-ink)",
        boxShadow:
          "0 2px 6px rgba(43, 43, 43, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <span>{ing.emoji}</span>
      <span>{ing.name}</span>
      {removable && (
        <span
          className="ml-0.5"
          style={{ fontSize: "10px", color: "var(--color-ink-muted)" }}
        >
          ✕
        </span>
      )}
    </button>
  );
}
