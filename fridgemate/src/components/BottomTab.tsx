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
    <nav
      className="fixed bottom-0 left-0 right-0 mx-auto bg-white border-t border-gray-200"
      style={{ maxWidth: 414 }}
    >
      <ul className="flex justify-around items-center h-16">
        {TABS.map((t) => {
          const active =
            t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className="flex flex-col items-center gap-1 px-4 py-2"
                style={{
                  color: active
                    ? "var(--color-primary)"
                    : "var(--color-text-tertiary)",
                }}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-xs">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
