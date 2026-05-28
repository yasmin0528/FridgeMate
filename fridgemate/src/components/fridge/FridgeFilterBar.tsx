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

/**
 * FridgeFilterBar
 *
 * Mobile  (<768px):  horizontally scrollable pill row, sits atop the fridge
 * Tablet+ (md+):     vertical stacked tag bar on the left side
 *
 * Both views share the same options — "冷藏" "冷冻" + all category tags.
 */
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

  // Auto-scroll selected into view on mobile
  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector(`[data-key="${selectedKey}"]`);
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedKey]);

  return (
    <>
      {/* ── Mobile: horizontal scroll bar ── */}
      <div className="md:hidden">
        {/* Mode toggle row */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => onModeChange("zone")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              mode === "zone"
                ? "bg-[#1a1a1a] text-white shadow-sm"
                : "bg-[#f0efed] text-[#787671]"
            }`}
          >
            按区域
          </button>
          <button
            type="button"
            onClick={() => onModeChange("category")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              mode === "category"
                ? "bg-[#1a1a1a] text-white shadow-sm"
                : "bg-[#f0efed] text-[#787671]"
            }`}
          >
            按种类
          </button>
        </div>

        {/* Horizontal scrollable pills */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {allOptions.map((opt) => (
            <button
              key={opt.key}
              data-key={opt.key}
              type="button"
              onClick={() => onSelectKey(opt.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                selectedKey === opt.key
                  ? "bg-[#5645d4] text-white shadow-sm"
                  : "bg-white border border-[#e0ddd7] text-[#5d5b54]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tablet+: vertical tag bar ── */}
      <div className="hidden md:block">
        {/* Mode switch pills */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => onModeChange("zone")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
              mode === "zone"
                ? "bg-[#1a1a1a] text-white"
                : "border border-[#e5e3df] text-[#787671] bg-transparent"
            }`}
            style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}
          >
            按区域
          </button>
          <button
            type="button"
            onClick={() => onModeChange("category")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
              mode === "category"
                ? "bg-[#1a1a1a] text-white"
                : "border border-[#e5e3df] text-[#787671] bg-transparent"
            }`}
            style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}
          >
            按种类
          </button>
        </div>

        {/* Vertical tags */}
        <div className="flex flex-col gap-2">
          {allOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelectKey(opt.key)}
              className={`rounded-[8px] px-3 py-2 text-sm text-left transition-all border ${
                selectedKey === opt.key
                  ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                  : "border-[#e5e3df] bg-white text-[#5d5b54]"
              }`}
              style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
