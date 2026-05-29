"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── SVG icon components — softer, rounded strokes ────────────────────── */
function FridgeIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" />
      <path d="M5 10h14" />
      <path d="M15 7v6" />
    </svg>
  );
}

function ScanIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    </svg>
  );
}

function RecipeIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 22H5.5a1 1 0 0 1 0-5h4.501" />
      <path d="m21 22-1.879-1.878" />
      <path d="M3 19.5v-15A2.5 2.5 0 0 1 5.5 2H18a1 1 0 0 1 1 1v8" />
      <circle cx="17" cy="18" r="3" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const TABS = [
  { href: "/fridge", label: "冰箱", icon: FridgeIcon },
  { href: "/scan", label: "扫描", icon: ScanIcon },
  { href: "/recipes", label: "食谱", icon: RecipeIcon },
  { href: "/profile", label: "我的", icon: ProfileIcon },
];

export function BottomTab() {
  const pathname = usePathname();

  if (pathname.startsWith("/scan")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:static md:mt-auto"
      style={{
        background: "rgba(255, 253, 248, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 -2px 20px rgba(43, 43, 43, 0.06)",
      }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className="relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 transition-all duration-200"
            >
              <div
                className="flex items-center justify-center transition-all duration-200"
                style={{
                  color: active ? "var(--color-primary)" : "var(--color-ink-muted)",
                }}
              >
                {t.icon({ active })}
              </div>
              <span
                className="text-[11px] font-semibold tracking-[0.3px] transition-all duration-200"
                style={{
                  color: active ? "var(--color-primary)" : "var(--color-ink-muted)",
                }}
              >
                {t.label}
              </span>
              {active && (
                <div
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: "var(--color-primary)" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
