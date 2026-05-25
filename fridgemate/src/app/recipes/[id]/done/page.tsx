"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CelebrationLayer } from "@/components/CelebrationLayer";

function DoneInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const oldStreak = Number(sp.get("old") ?? "0");
  const newStreak = Number(sp.get("new") ?? "1");

  return (
    <CelebrationLayer
      oldStreak={oldStreak}
      newStreak={newStreak}
      onDismiss={() => router.replace("/")}
    />
  );
}

export default function DonePage() {
  return (
    <Suspense fallback={null}>
      <DoneInner />
    </Suspense>
  );
}
