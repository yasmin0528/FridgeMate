"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Recipe } from "@/types";

interface Props {
  candidates: Recipe[]; // pool to spin
  finalPick: Recipe; // pre-decided winner
  onDone: (picked: Recipe) => void;
}

export function SlotMachine({ candidates, finalPick, onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (candidates.length === 0) {
      onDone(finalPick);
      return;
    }
    let i = 0;
    const startMs = Date.now();
    const total = 1500;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const elapsed = Date.now() - startMs;
      if (elapsed >= total) {
        const winnerIdx = candidates.findIndex((c) => c.id === finalPick.id);
        setIdx(winnerIdx >= 0 ? winnerIdx : 0);
        setStopped(true);
        setTimeout(() => onDone(finalPick), 800);
        return;
      }
      // ease out: interval grows from 50ms → 300ms
      const interval = 50 + (elapsed / total) * 250;
      i = (i + 1) % candidates.length;
      setIdx(i);
      timer = setTimeout(tick, interval);
    };
    tick();
    return () => clearTimeout(timer);
  }, [candidates, finalPick, onDone]);

  const current = candidates[idx] ?? finalPick;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(43, 43, 43, 0.25)",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Large clay card for the slot window */}
      <div
        className="flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: "var(--color-surface-elevated)",
          borderRadius: "32px",
          padding: "32px 48px",
          minWidth: 280,
          minHeight: 140,
          boxShadow:
            "0 8px 24px rgba(43, 43, 43, 0.10), 0 0 0 1px rgba(255, 255, 255, 0.8) inset, 0 -1px 0 rgba(43, 43, 43, 0.03) inset",
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current.id}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-center px-4"
          >
            <div
              className="text-h1"
              style={{ color: "var(--color-ink)", whiteSpace: "nowrap" }}
            >
              {current.name}
            </div>
            <div
              className="text-small mt-2"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {current.kcal} kcal · {current.cookTimeMin} 分钟
            </div>
            {stopped && (
              <div
                className="text-small mt-3 font-semibold"
                style={{ color: "var(--color-primary)" }}
              >
                ✨ 就是你了
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
