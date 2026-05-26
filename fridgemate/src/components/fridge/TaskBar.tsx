"use client";

import React from "react";
import { motion } from "framer-motion";

const tasks = [
  {
    id: 1,
    title: "即将过期",
    description: "牛奶剩余1天",
    tint: "peach",
  },
  {
    id: 2,
    title: "今日任务",
    description: "完成一道菜",
    tint: "sky",
  },
  {
    id: 3,
    title: "整理冰箱",
    description: "建议整理冰箱库存",
    tint: "mint",
  },
];

const TINT_STYLES: Record<string, { bg: string; text: string }> = {
  peach: { bg: "#ffe8d4", text: "#793400" },
  sky: { bg: "#dcecfa", text: "#005bab" },
  mint: { bg: "#d9f3e1", text: "#1aae39" },
};

export const TaskBar = React.memo(function TaskBar() {
  return (
    <div className="bg-white rounded-[12px] border border-[#e5e3df] p-[24px]">
      <h3
        className="text-sm font-semibold text-[#1a1a1a] mb-4"
        style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.5 }}
      >
        今日提醒
      </h3>
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const tint = TINT_STYLES[task.tint];
          return (
            <motion.div
              key={task.id}
              className="rounded-[8px] p-4 cursor-pointer transition-all"
              style={{ backgroundColor: tint.bg }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.25 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold"
                    style={{ color: tint.text, fontSize: "13px", fontWeight: 600, lineHeight: 1.4 }}
                  >
                    {task.title}
                  </p>
                  <p
                    className="text-sm font-medium text-[#1a1a1a] mt-0.5 truncate"
                    style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}
                  >
                    {task.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
