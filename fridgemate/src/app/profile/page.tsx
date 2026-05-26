"use client";

import { useCheckinStore } from "@/store/checkinStore";
import { computeProfileXp } from "@/lib/profileXp";
import { ExpBar } from "@/components/profile/ExpBar";
import { CheckinCalendar } from "@/components/profile/CheckinCalendar";
import { RecentCookingList } from "@/components/profile/RecentCookingList";

const PROFILE = {
  nickname: "小厨",
  avatar: "🧑‍🍳",
} as const;

export default function ProfilePage() {
  const { history, streak, lastCookedDate } = useCheckinStore();
  const { level, progressInLevel, progressPercent } = computeProfileXp(
    history.length
  );

  return (
    <main className="px-4 py-6 flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">我的</h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          成长与打卡记录
        </p>
      </header>

      {/* 用户区 + 经验条 */}
      <section className="rounded-2xl bg-white p-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl"
            style={{ backgroundColor: "var(--color-primary-light)" }}
            aria-hidden
          >
            {PROFILE.avatar}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold truncate">
              {PROFILE.nickname}
            </div>
            <div
              className="text-sm mt-0.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              累计完成 {history.length} 道菜
            </div>
          </div>
        </div>
        <ExpBar
          level={level}
          progressInLevel={progressInLevel}
          progressPercent={progressPercent}
        />
      </section>

      {/* 统计摘要 */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4">
          <div
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            连续打卡
          </div>
          <div className="text-xl font-semibold mt-1">🔥 {streak} 天</div>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <div
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            总做饭次数
          </div>
          <div className="text-xl font-semibold mt-1">{history.length} 次</div>
        </div>
      </section>

      <p
        className="text-sm text-center"
        style={{ color: "var(--color-text-secondary)" }}
      >
        上次烹饪：{lastCookedDate ?? "还没有记录，做完一道菜来打卡吧"}
      </p>

      <CheckinCalendar history={history} />

      <RecentCookingList history={history} />
    </main>
  );
}
