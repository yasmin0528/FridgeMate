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
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
      style={{
        backgroundColor: "var(--color-primary-light)",
        color: "var(--color-primary-dark)",
      }}
    >
      <span>{ing.emoji}</span>
      <span>{ing.name}</span>
      {removable && <span className="ml-1 text-xs">✕</span>}
    </button>
  );
}
