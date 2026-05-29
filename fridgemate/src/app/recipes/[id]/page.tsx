"use client";

import { useRouter } from "next/navigation";
import { use, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRecipeStore } from "@/store/recipeStore";
import { useFridgeStore } from "@/store/fridgeStore";
import { useCheckinStore } from "@/store/checkinStore";
import { INGREDIENT_BY_ID } from "@/mock/ingredients";
import { CookingTimer } from "@/components/CookingTimer";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STEP_TINTS = [
  "var(--color-card-mint)",
  "var(--color-card-peach)",
  "var(--color-card-lavender)",
  "var(--color-card-sky)",
  "var(--color-card-strawberry)",
  "var(--color-card-banana)",
];

export default function RecipeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getRecipe } = useRecipeStore();
  const { selectedSet, clearSelection } = useFridgeStore();
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
      <main className="p-6" style={{ maxWidth: 414, margin: "0 auto" }}>
        <div className="emotion-card flex flex-col items-center gap-3 py-12" style={{ backgroundColor: "var(--color-card-peach)" }}>
          <span className="text-4xl">😕</span>
          <p className="text-body" style={{ color: "var(--color-ink-soft)" }}>菜谱不存在</p>
          <button onClick={() => router.back()} className="btn-secondary mt-2">
            返回
          </button>
        </div>
      </main>
    );
  }

  const doCheckin = () => {
    clearSelection();
    const { oldStreak, newStreak } = recordCooking(recipe.id);
    router.push(`/recipes/${recipe.id}/done?old=${oldStreak}&new=${newStreak}`);
  };

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
  const stepProgress = ((stepIdx + 1) / recipe.steps.length) * 100;

  const searchUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(recipe.name)}`;
  const hasRealVideo = !!recipe.videoUrl;
  const videoHref = recipe.videoUrl ?? searchUrl;

  return (
    <main className="flex flex-col" style={{ maxWidth: 414, margin: "0 auto" }}>
      {/* Sticky header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{
          backgroundColor: "var(--color-canvas)",
          borderBottom: "1px solid var(--color-hairline-soft)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center clay-card"
          aria-label="返回"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h1 className="text-h3 truncate mx-2 text-center flex-1">{recipe.name}</h1>

        <button
          onClick={() => setShowConfirm(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "var(--color-card-mint)",
            color: "var(--color-primary-deep)",
          }}
          aria-label="快捷打卡"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </motion.header>

      {/* Hero section */}
      <section className="px-4 py-4 flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full h-44 rounded-[28px] flex items-center justify-center text-6xl"
          style={{
            backgroundColor: "var(--color-card-banana)",
            boxShadow: "0 4px 16px rgba(43,43,43,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset",
          }}
        >
          <span className="animate-float">🍳</span>
        </motion.div>

        {/* Nutrition info pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex gap-2 flex-wrap"
        >
          <span className="px-3 py-1.5 rounded-full text-caption" style={{ backgroundColor: "var(--color-card-mint)", color: "var(--color-primary-deep)" }}>
            🔥 {recipe.kcal} kcal
          </span>
          <span className="px-3 py-1.5 rounded-full text-caption" style={{ backgroundColor: "var(--color-card-sky)", color: "#3A8DB5" }}>
            💪 蛋白 {recipe.protein}g
          </span>
          <span className="px-3 py-1.5 rounded-full text-caption" style={{ backgroundColor: "var(--color-card-peach)", color: "#C07A4A" }}>
            ⏱ {recipe.cookTimeMin} 分钟
          </span>
          <span className="px-3 py-1.5 rounded-full text-caption" style={{ backgroundColor: "var(--color-card-lavender)", color: "#7B6BBF" }}>
            {["", "⭐", "⭐⭐", "⭐⭐⭐"][recipe.difficulty]} 难度
          </span>
        </motion.div>

        {/* Video link card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <a
            href={videoHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              hasRealVideo
                ? `打开 B 站视频 ${recipe.name}`
                : `在哔哩哔哩搜索 ${recipe.name}`
            }
            className="bento-cell flex items-center gap-3 p-4"
            style={{
              backgroundColor: hasRealVideo ? "var(--color-card-mint)" : "var(--color-surface)",
              border: hasRealVideo ? "none" : "1.5px dashed var(--color-hairline)",
            }}
          >
            <span className="text-2xl">🎥</span>
            <div className="flex-1">
              <div className="text-h3" style={{ color: hasRealVideo ? "var(--color-primary-deep)" : "var(--color-ink-soft)" }}>
                {hasRealVideo ? "看视频版" : `在 B 站搜「${recipe.name}」`}
              </div>
              <div className="text-caption mt-0.5">
                {hasRealVideo ? "B 站 · 看视频教学" : "点击跳转 B 站搜索"}
              </div>
            </div>
            <span className="text-lg" style={{ color: "var(--color-ink-muted)" }}>↗</span>
          </a>
        </motion.div>
      </section>

      {/* Ingredients section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="mx-4 mb-2 p-5 bento-cell"
        style={{ backgroundColor: "var(--color-surface-elevated)" }}
      >
        {/* Fridge ingredients */}
        <div>
          <h2 className="text-h3 mb-3 flex items-center gap-2">
            <span>🧊</span>
            <span>冰箱食材</span>
          </h2>
          <ul className="flex flex-col gap-2.5">
            <AnimatePresence>
              {fridgeIngredients.map((ref, i) => {
                const ing = INGREDIENT_BY_ID.get(ref.id);
                const has = selectedSet.has(ref.id);
                return (
                  <motion.li
                    key={ref.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    className="flex items-center justify-between text-small"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{
                          backgroundColor: has ? "var(--color-card-mint)" : "var(--color-surface)",
                          color: has ? "var(--color-primary-deep)" : "var(--color-ink-muted)",
                        }}
                      >
                        {has ? "✓" : "·"}
                      </span>
                      <span>
                        {ing?.emoji} {ing?.name}
                      </span>
                    </span>
                    <span style={{ color: "var(--color-ink-muted)" }}>
                      {ref.amount}
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>

        {/* Condition divider */}
        {pantryIngredients.length > 0 && (
          <>
            <div
              className="my-4"
              style={{ borderTop: "1px solid var(--color-hairline-soft)" }}
            />
            <div>
              <h2 className="text-h3 mb-3 flex items-center gap-2">
                <span>🥢</span>
                <span>需要自己准备</span>
              </h2>
              <ul className="flex flex-col gap-2.5">
                {pantryIngredients.map((ref, i) => {
                  const ing = INGREDIENT_BY_ID.get(ref.id);
                  return (
                    <motion.li
                      key={ref.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      className="flex items-center justify-between text-small"
                      style={{ color: "var(--color-ink-muted)" }}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ color: "var(--color-ink-muted)" }}>
                          ·
                        </span>
                        <span>
                          {ing?.emoji} {ing?.name}
                        </span>
                      </span>
                      <span>{ref.amount}</span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </motion.section>

      {/* Cooking steps section */}
      <section className="px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "var(--color-surface)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "var(--color-primary)" }}
              initial={{ width: 0 }}
              animate={{ width: `${stepProgress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <motion.span
            key={stepIdx}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-small font-medium"
            style={{ color: "var(--color-primary-deep)" }}
          >
            {stepIdx + 1}/{recipe.steps.length}
          </motion.span>
        </div>

        {/* Step card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bento-cell p-5 flex flex-col gap-4 min-h-[200px]"
            style={{ backgroundColor: STEP_TINTS[stepIdx % STEP_TINTS.length] }}
          >
            {/* Step number badge */}
            <div className="flex items-center gap-3">
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: "rgba(255,255,255,0.7)",
                  color: "var(--color-ink)",
                  boxShadow: "0 2px 6px rgba(43,43,43,0.06)",
                }}
              >
                {stepIdx + 1}
              </span>
              <span className="text-caption" style={{ color: "var(--color-ink-soft)" }}>
                步骤 {stepIdx + 1}
              </span>
            </div>

            {/* Step text */}
            <div
              className="text-body leading-relaxed"
              style={{
                fontSize: 17,
                lineHeight: "28px",
                color: "var(--color-ink)",
              }}
            >
              {step.text}
            </div>

            {/* Timer button */}
            {step.timerMin !== undefined && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onClick={() => setTimerMin(step.timerMin!)}
                className="self-start btn-secondary flex items-center gap-2"
              >
                <span>⏱</span>
                <span>启动 {step.timerMin} 分钟计时器</span>
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            disabled={stepIdx === 0}
            className="btn-secondary px-5 py-2.5 disabled:opacity-30 flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            上一步
          </motion.button>

          {isLastStep ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={doCheckin}
              className="btn-primary px-6 py-2.5 flex items-center gap-1.5"
            >
              <span>✅</span>
              已完成菜肴
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                setStepIdx((i) => Math.min(recipe.steps.length - 1, i + 1))
              }
              disabled={isLastStep}
              className="btn-primary px-5 py-2.5 disabled:opacity-30 flex items-center gap-1.5"
            >
              下一步
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.button>
          )}
        </div>
      </section>

      {/* Timer overlay */}
      {timerMin !== null && (
        <CookingTimer minutes={timerMin} onClose={() => setTimerMin(null)} />
      )}

      {/* Confirm overlay */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ backgroundColor: "rgba(43,43,43,0.45)" }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="w-full clay-card p-6 flex flex-col items-center gap-4"
              style={{ maxWidth: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-4xl">🎉</span>
              <h3 className="text-h2 text-center">跟着外链做完了？</h3>
              <p className="text-small text-center" style={{ color: "var(--color-ink-soft)" }}>
                确认要直接打卡吗？你的连续烹饪天数会增加哦！
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  继续看教程
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    doCheckin();
                  }}
                  className="btn-primary flex-1"
                >
                  ✓ 打卡
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visibility toast */}
      <AnimatePresence>
        {showVisToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
          >
            <button
              onClick={() => {
                setShowVisToast(false);
                setShowConfirm(true);
              }}
              className="btn-primary px-5 py-3 flex items-center gap-2 shadow-lg"
            >
              <span>🎬</span>
              <span>跟着视频做完了？一键打卡</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
