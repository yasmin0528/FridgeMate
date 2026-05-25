"use client";

import { useCheckinStore } from "@/store/checkinStore";

export default function ProfilePage() {
  const { history, streak, lastCookedDate } = useCheckinStore();
  return (
    <main className="px-4 py-6">
      <h1 className="text-2xl font-semibold">我的</h1>
      <p
        className="mt-2 text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        zyx 负责。订阅 useCheckinStore 渲染经验条、日历打卡格子。
      </p>
      <div className="mt-6 p-4 bg-white rounded-2xl">
        <div className="text-lg">🔥 连续 {streak} 天</div>
        <div
          className="text-sm mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          上次烹饪：{lastCookedDate ?? "—"}
        </div>
        <div
          className="text-sm mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          总打卡：{history.length} 次
        </div>
      </div>
    </main>
  );
}
