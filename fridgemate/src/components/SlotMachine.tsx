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
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50">
      <div className="w-72 h-40 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current.id}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-center px-4"
          >
            <div className="text-2xl font-semibold">{current.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              {current.kcal} kcal · {current.cookTimeMin} 分钟
            </div>
            {stopped && (
              <div
                className="text-xs mt-2"
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
