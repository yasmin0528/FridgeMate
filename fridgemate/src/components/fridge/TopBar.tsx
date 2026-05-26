"use client";

import React from "react";
import { motion } from "framer-motion";

interface TopBarProps {
  userName?: string;
  level?: number;
  checkInDays?: number;
}

export const TopBar = React.memo(function TopBar({
  userName = "用户",
  level = 5,
  checkInDays = 12,
}: TopBarProps) {
  return (
    <div className="bg-white border-b border-[#e5e3df]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: user info */}
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-[8px] bg-[#5645d4] flex items-center justify-center text-white font-semibold text-sm cursor-pointer shrink-0"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {userName.charAt(0)}
            </motion.div>

            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold text-[#1a1a1a] truncate"
                style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.5 }}
              >
                {userName}
              </p>
              <div className="flex gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#787671]" style={{ fontSize: "13px", lineHeight: 1.4 }}>
                    等级
                  </span>
                  <span className="text-xs font-semibold text-[#5645d4] bg-[#e6e0f5] px-2 py-0.5 rounded-[6px]">
                    Lv.{level}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#787671]" style={{ fontSize: "13px", lineHeight: 1.4 }}>
                    打卡
                  </span>
                  <span className="text-xs font-semibold text-[#dd5b00] bg-[#ffe8d4] px-2 py-0.5 rounded-[6px]">
                    {checkInDays}天
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              className="relative p-2 rounded-[8px] hover:bg-[#f6f5f4] transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="通知"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5d5b54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <motion.div
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e03131] rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.button>

            <motion.button
              className="p-2 rounded-[8px] hover:bg-[#f6f5f4] transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="更多"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5d5b54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
});
