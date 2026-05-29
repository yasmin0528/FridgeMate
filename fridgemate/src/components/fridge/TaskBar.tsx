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

const TINT_STYLES: Record<string, { bg: string }> = {
  peach: { bg: "var(--color-card-peach)" },
  sky: { bg: "var(--color-card-sky)" },
  mint: { bg: "var(--color-card-mint)" },
};

export const TaskBar = React.memo(function TaskBar() {
  return (
    <div
      className="bento-cell"
      style={{
        background: "var(--color-surface-elevated)",
        padding: "24px",
        borderRadius: "28px",
        boxShadow:
          "0 2px 8px rgba(43, 43, 43, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.6) inset",
      }}
    >
      <h3
        className="text-h3 mb-4"
        style={{ color: "var(--color-ink)" }}
      >
        今日提醒
      </h3>
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const tint = TINT_STYLES[task.tint];
          return (
            <motion.div
              key={task.id}
              className="cursor-pointer transition-all"
              style={{
                backgroundColor: tint.bg,
                borderRadius: "20px",
                padding: "16px",
                boxShadow:
                  "0 2px 6px rgba(43, 43, 43, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.25 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-h3 mb-0.5"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {task.title}
                  </p>
                  <p
                    className="text-small truncate"
                    style={{ color: "var(--color-ink-soft)" }}
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
