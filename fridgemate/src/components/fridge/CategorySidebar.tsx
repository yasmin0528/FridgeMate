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
    <div className={`${className} bg-white rounded-3xl border border-slate-200 shadow-sm p-4`}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">分类方式</p>
          <p className="text-xs text-slate-500">选择显示规则</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => onModeChange("zone")}
          className={`rounded-full px-3 py-2 text-sm font-medium transition ${
            mode === "zone"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          存储分类
        </button>
        <button
          type="button"
          onClick={() => onModeChange("category")}
          className={`rounded-full px-3 py-2 text-sm font-medium transition ${
            mode === "category"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          食材种类
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelectKey(option.key)}
            className={`rounded-3xl px-3 py-3 text-sm text-left transition-all border ${
              selectedKey === option.key
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
