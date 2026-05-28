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
    <div className="bg-white border-b border-[#e5e3df]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3">
        <div className="relative">
          {/* Search icon */}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a4a097"
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
            className="w-full rounded-[10px] border border-[#e5e3df] bg-[#f6f5f4] pl-9 pr-8 py-2.5 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#a4a097] focus:bg-white focus:border-[#c8c4be]"
            style={{ fontSize: "14px", lineHeight: 1.5 }}
          />

          {/* Clear button */}
          {searchQuery && (
            <motion.button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#a4a097] hover:text-[#5d5b54] transition-colors"
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
    </div>
  );
});
