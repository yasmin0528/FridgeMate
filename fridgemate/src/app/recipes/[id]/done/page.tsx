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
    <Suspense
      fallback={
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, var(--color-card-mint) 0%, var(--color-card-banana) 30%, var(--color-card-strawberry) 60%, var(--color-card-lavender) 100%)",
          }}
        >
          <div
            className="clay-card px-8 py-6 animate-pulse-soft"
            style={{ borderRadius: "32px" }}
          >
            <div className="text-h2" style={{ color: "var(--color-ink-soft)" }}>
              加载中...
            </div>
          </div>
        </div>
      }
    >
      <DoneInner />
    </Suspense>
  );
}
