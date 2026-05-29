"use client";

import React, { useCallback, useRef } from "react";
import { motion } from "framer-motion";

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const TopBar = React.memo(function TopBar({
  searchQuery,
  onSearchChange,
}: TopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onSearchChange("");
    inputRef.current?.focus();
  }, [onSearchChange]);

  return (
    <div className="rounded-[22px] border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] px-3 py-2 shadow-[0_6px_16px_rgba(43,43,43,0.06)]">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-ink-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜索食材…"
          className="w-full rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface)] pl-10 pr-10 py-3 text-[15px] text-[var(--color-ink)] outline-none transition-all duration-200 placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface-elevated)]"
          style={{ boxShadow: "0 2px 8px rgba(43,43,43,0.04)" }}
        />

        {searchQuery && (
          <motion.button
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-surface-elevated)] p-1.5 text-[var(--color-ink-muted)] transition-colors"
            onClick={handleClear}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            aria-label="清空搜索"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
});
