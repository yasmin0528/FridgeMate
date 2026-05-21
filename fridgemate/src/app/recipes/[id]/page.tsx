"use client";

import { useRouter } from "next/navigation";
import { use, useState, useEffect, useRef } from "react";
import { useRecipeStore } from "@/store/recipeStore";
import { useFridgeStore } from "@/store/fridgeStore";
import { useCheckinStore } from "@/store/checkinStore";
import { INGREDIENT_BY_ID } from "@/mock/ingredients";
import { CookingTimer } from "@/components/CookingTimer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RecipeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getRecipe } = useRecipeStore();
  const { selectedSet } = useFridgeStore();
  const { recordCooking } = useCheckinStore();
  const recipe = getRecipe(id);

  const [stepIdx, setStepIdx] = useState(0);
  const [timerMin, setTimerMin] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showVisToast, setShowVisToast] = useState(false);
  const leftAtRef = useRef<number | null>(null);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        leftAtRef.current = Date.now();
      } else if (
        document.visibilityState === "visible" &&
        leftAtRef.current &&
        Date.now() - leftAtRef.current > 3000
      ) {
        setShowVisToast(true);
        leftAtRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!recipe) {
    return (
      <main className="p-6">
        <p>菜谱不存在</p>
      </main>
    );
  }

  const doCheckin = () => {
    const { oldStreak, newStreak } = recordCooking(recipe.id);
    router.push(`/recipes/${recipe.id}/done?old=${oldStreak}&new=${newStreak}`);
  };

  // Split ingredients into fridge vs pantry
  const fridgeIngredients = recipe.ingredients.filter((ref) => {
    const ing = INGREDIENT_BY_ID.get(ref.id);
    return ing && !ing.isPantry;
  });
  const pantryIngredients = recipe.ingredients.filter((ref) => {
    const ing = INGREDIENT_BY_ID.get(ref.id);
    return ing && ing.isPantry;
  });

  const isLastStep = stepIdx === recipe.steps.length - 1;
  const step = recipe.steps[stepIdx];

  // External link card
  const searchUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(recipe.name)}`;
  const hasRealVideo = !!recipe.videoUrl;
  const videoHref = recipe.videoUrl ?? searchUrl;

  return (
    <main className="flex flex-col">
      <header
        className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white z-10 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <button onClick={() => router.back()} className="text-xl">
          ←
        </button>
        <h1 className="font-medium truncate mx-2">{recipe.name}</h1>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-xl"
          style={{ color: "var(--color-primary)" }}
          aria-label="快捷打卡"
        >
          ✓
        </button>
      </header>

      <section className="px-4 py-4 flex flex-col gap-3">
        <div
          className="w-full h-40 rounded-2xl flex items-center justify-center text-6xl"
          style={{ backgroundColor: "var(--color-primary-light)" }}
        >
          🍳
        </div>
        <div
          className="flex gap-4 text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <span>{recipe.kcal} kcal</span>
          <span>蛋白质 {recipe.protein}g</span>
          <span>{recipe.cookTimeMin} 分钟</span>
        </div>

        {/* External link card — always renders, 2-state */}
        <a
          href={videoHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            hasRealVideo
              ? `打开 B 站视频 ${recipe.name}`
              : `在哔哩哔哩搜索 ${recipe.name}`
          }
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            border: hasRealVideo
              ? "1px solid var(--color-primary)"
              : "1px dashed var(--color-border)",
            backgroundColor: "white",
          }}
        >
          <span className="text-2xl">🎥</span>
          <div className="flex-1">
            <div
              className="font-medium"
              style={{
                color: hasRealVideo
                  ? "var(--color-text-primary)"
                  : "var(--color-text-tertiary)",
              }}
            >
              {hasRealVideo ? "看视频版" : `在 B 站搜「${recipe.name}」`}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {hasRealVideo ? "B 站 · 看视频教学" : "点击跳转 B 站搜索 →"}
            </div>
          </div>
          <span style={{ color: "var(--color-text-tertiary)" }}>↗</span>
        </a>
      </section>

      {/* Ingredients section — split into fridge / pantry */}
      <section
        className="px-4 py-4 border-t flex flex-col gap-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div>
          <h2 className="font-medium mb-3 flex items-center gap-1">
            <span>🧊</span>
            <span>冰箱食材</span>
          </h2>
          <ul className="flex flex-col gap-2">
            {fridgeIngredients.map((ref) => {
              const ing = INGREDIENT_BY_ID.get(ref.id);
              const has = selectedSet.has(ref.id);
              return (
                <li
                  key={ref.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      style={{
                        color: has
                          ? "var(--color-success)"
                          : "var(--color-text-tertiary)",
                      }}
                    >
                      {has ? "✓" : "✗"}
                    </span>
                    <span>
                      {ing?.emoji} {ing?.name}
                    </span>
                  </span>
                  <span style={{ color: "var(--color-text-tertiary)" }}>
                    {ref.amount}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {pantryIngredients.length > 0 && (
          <div>
            <h2 className="font-medium mb-3 flex items-center gap-1">
              <span>🥢</span>
              <span>你需要准备</span>
            </h2>
            <ul className="flex flex-col gap-2">
              {pantryIngredients.map((ref) => {
                const ing = INGREDIENT_BY_ID.get(ref.id);
                return (
                  <li
                    key={ref.id}
                    className="flex items-center justify-between text-sm"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    <span className="flex items-center gap-2">
                      <span>·</span>
                      <span>
                        {ing?.emoji} {ing?.name}
                      </span>
                    </span>
                    <span>{ref.amount}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <section
        className="px-4 py-4 border-t flex flex-col gap-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--color-border)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${((stepIdx + 1) / recipe.steps.length) * 100}%`,
                backgroundColor: "var(--color-primary)",
                transition: "width 0.3s",
              }}
            />
          </div>
          <span
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {stepIdx + 1}/{recipe.steps.length}
          </span>
        </div>

        <div
          className="min-h-[180px] flex flex-col gap-3 justify-center"
          style={{ fontSize: 28, lineHeight: "36px" }}
        >
          <div>{step.text}</div>
          {step.timerMin !== undefined && (
            <button
              onClick={() => setTimerMin(step.timerMin!)}
              className="self-start text-sm px-4 py-2 rounded-full"
              style={{
                backgroundColor: "var(--color-primary-light)",
                color: "var(--color-primary-dark)",
              }}
            >
              ⏱ 启动 {step.timerMin} 分钟计时器
            </button>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            disabled={stepIdx === 0}
            className="px-4 py-2 text-sm disabled:opacity-30"
          >
            ← 上一步
          </button>
          <button
            onClick={() =>
              setStepIdx((i) => Math.min(recipe.steps.length - 1, i + 1))
            }
            disabled={isLastStep}
            className="px-4 py-2 text-sm disabled:opacity-30"
          >
            下一步 →
          </button>
        </div>

        {isLastStep && (
          <button
            onClick={doCheckin}
            className="w-full py-4 rounded-full text-white text-lg font-medium"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            ✅ 已完成菜肴
          </button>
        )}
      </section>

      {timerMin !== null && (
        <CookingTimer minutes={timerMin} onClose={() => setTimerMin(null)} />
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2">跟着外链做完了？</h3>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--color-text-secondary)" }}
            >
              确认要直接打卡吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-full border"
                style={{ borderColor: "var(--color-border)" }}
              >
                继续看教程
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  doCheckin();
                }}
                className="flex-1 py-2 rounded-full text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                ✓ 打卡
              </button>
            </div>
          </div>
        </div>
      )}

      {showVisToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => {
              setShowVisToast(false);
              setShowConfirm(true);
            }}
            className="px-4 py-3 rounded-full text-white text-sm shadow-lg"
            style={{ backgroundColor: "var(--color-text-primary)" }}
          >
            跟着视频做完了？一键打卡 →
          </button>
        </div>
      )}
    </main>
  );
}
