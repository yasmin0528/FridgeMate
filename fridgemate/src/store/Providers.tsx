"use client";

import { ReactNode } from "react";
import { FridgeProvider } from "./fridgeStore";
import { RecipeProvider } from "./recipeStore";
import { CheckinProvider } from "./checkinStore";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FridgeProvider>
      <RecipeProvider>
        <CheckinProvider>{children}</CheckinProvider>
      </RecipeProvider>
    </FridgeProvider>
  );
}
