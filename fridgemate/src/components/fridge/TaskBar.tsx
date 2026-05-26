"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * TaskBar 组件
 * 职责：显示今日提醒模块（即将过期、今日任务等）
 */
export const TaskBar = React.memo(function TaskBar() {
  const tasks = [
    {
      id: 1,
      type: "expiring",
      title: "即将过期",
      description: "牛奶剩余1天",
      icon: "⏰",
      color: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
    },
    {
      id: 2,
      type: "task",
      title: "今日任务",
      description: "完成一道菜",
      icon: "📝",
      color: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
    },
    {
      id: 3,
      type: "task",
      title: "今日任务",
      description: "整理冰箱",
      icon: "🧹",
      color: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
    },
  ];

  return (
    <div className="px-4 md:px-6 py-6">
      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
        今日提醒
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            className={`${task.color} border ${task.borderColor} rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{task.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${task.textColor}`}>
                  {task.title}
                </p>
                <p className="text-sm font-medium text-gray-800 mt-1 truncate">
                  {task.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
