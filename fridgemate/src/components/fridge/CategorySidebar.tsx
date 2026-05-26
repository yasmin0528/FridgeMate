"use client";

export type FilterMode = "zone" | "category";

interface CategorySidebarProps {
  mode: FilterMode;
  selectedKey: string;
  onModeChange: (mode: FilterMode) => void;
  onSelectKey: (key: string) => void;
  categories: Array<{ key: string; label: string }>;
  zones: Array<{ key: string; label: string }>;
  className?: string;
}

export function CategorySidebar({
  mode,
  selectedKey,
  onModeChange,
  onSelectKey,
  categories,
  zones,
  className = "",
}: CategorySidebarProps) {
  const options = mode === "zone" ? zones : categories;

  return (
    <div className={`${className} bg-white rounded-[12px] border border-[#e5e3df] p-[24px]`}>
      {/* Pill-tab mode switcher */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => onModeChange("zone")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "zone"
              ? "bg-[#1a1a1a] text-white"
              : "border border-[#e5e3df] text-[#787671] bg-transparent"
          }`}
          style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}
        >
          存储分类
        </button>
        <button
          type="button"
          onClick={() => onModeChange("category")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "category"
              ? "bg-[#1a1a1a] text-white"
              : "border border-[#e5e3df] text-[#787671] bg-transparent"
          }`}
          style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}
        >
          食材种类
        </button>
      </div>

      {/* Option grid: 3-col on mobile, 1-col on sidebar */}
      <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelectKey(option.key)}
            className={`rounded-[8px] px-3 py-2.5 text-sm text-left transition-all border ${
              selectedKey === option.key
                ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                : "border-[#e5e3df] bg-white text-[#5d5b54]"
            }`}
            style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
