"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export type FilterMode = "zone" | "category";

interface FridgeFilterBarProps {
  mode: FilterMode;
  selectedKey: string;
  onModeChange: (mode: FilterMode) => void;
  onSelectKey: (key: string) => void;
  categories: Array<{ key: string; label: string }>;
  zones: Array<{ key: string; label: string }>;
}

export function FridgeFilterBar({
  mode,
  selectedKey,
  onModeChange,
  onSelectKey,
  categories,
  zones,
}: FridgeFilterBarProps) {
  const allOptions =
    mode === "zone"
      ? zones
      : [{ key: "all" as const, label: "全部" }, ...categories.slice(1)];

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector(`[data-key="${selectedKey}"]`);
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedKey]);

  return (
    <div className="space-y-2">
      <div className="inline-flex rounded-full bg-[var(--color-surface)] p-0.5">
        <button
          type="button"
          onClick={() => onModeChange("zone")}
          className="rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all"
          style={{
            backgroundColor: mode === "zone" ? "var(--color-primary)" : "transparent",
            color: mode === "zone" ? "var(--color-on-primary)" : "var(--color-ink-muted)",
          }}
        >
          按区域
        </button>
        <button
          type="button"
          onClick={() => onModeChange("category")}
          className="rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all"
          style={{
            backgroundColor: mode === "category" ? "var(--color-primary)" : "transparent",
            color: mode === "category" ? "var(--color-on-primary)" : "var(--color-ink-muted)",
          }}
        >
          按种类
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allOptions.map((opt) => {
          const isActive = selectedKey === opt.key;
          return (
            <motion.button
              key={opt.key}
              data-key={opt.key}
              type="button"
              onClick={() => onSelectKey(opt.key)}
              className="shrink-0 rounded-full border border-[var(--color-hairline)] px-4 py-2 text-[12px] font-semibold transition-all"
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: isActive ? "var(--color-primary)" : "var(--color-surface-elevated)",
                color: isActive ? "var(--color-on-primary)" : "var(--color-ink-soft)",
                boxShadow: isActive
                  ? "0 4px 12px rgba(123, 207, 142, 0.25)"
                  : "0 2px 6px rgba(43, 43, 43, 0.04)",
              }}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
