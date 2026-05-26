"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "今日", icon: "🏠" },
  { href: "/scan", label: "扫描", icon: "📷" },
  { href: "/recipes", label: "食谱", icon: "🍳" },
  { href: "/profile", label: "我的", icon: "👤" },
];

export function BottomTab() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e5e3df] bg-white md:static md:border-t md:mt-auto">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-2 md:py-3">
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[8px] px-3 py-2 text-xs font-medium transition ${
                active ? "text-[#1a1a1a]" : "text-[#787671]"
              }`}
              style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.4 }}
            >
              <span className="text-xl mb-0.5">{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
