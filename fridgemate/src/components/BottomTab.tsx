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
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white md:static md:border-none">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-3xl px-3 py-2 text-xs font-medium transition ${
                active ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
