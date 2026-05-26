"use client";

import React from "react";
import { motion } from "framer-motion";

interface TopBarProps {
  userName?: string;
  level?: number;
  checkInDays?: number;
}

/**
 * TopBar 组件
 * 职责：
 * - 显示用户昵称
 * - 显示当前等级
 * - 显示连续打卡天数
 * - 显示通知和头像按钮
 */
export const TopBar = React.memo(function TopBar({
  userName = "用户",
  level = 5,
  checkInDays = 12,
}: TopBarProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧用户信息 */}
          <div className="flex items-center gap-3">
            {/* 用户头像 */}
            <motion.div
              className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-lg cursor-pointer"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {userName.charAt(0)}
            </motion.div>

            {/* 用户信息 */}
            <div className="flex-1">
              <p className="text-sm md:text-base font-semibold text-gray-800">
                {userName}
              </p>
              <div className="flex gap-3 mt-1">
                {/* 等级 */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">等级</span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    Lv.{level}
                  </span>
                </div>

                {/* 打卡天数 */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">打卡</span>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    {checkInDays}天
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-2">
            {/* 通知按钮 */}
            <motion.button
              className="relative p-2 hover:bg-white rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="通知"
            >
              <span className="text-xl">🔔</span>
              {/* 红点提示 */}
              <motion.div
                className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              ></motion.div>
            </motion.button>

            {/* 更多选项 */}
            <motion.button
              className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="更多"
            >
              <span className="text-xl">⋮</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
});
