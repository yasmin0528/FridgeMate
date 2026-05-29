"use client";

import React, { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ControlPanel } from "./ControlPanel";

/* ── Types ──────────────────────────────────────────────────────────────── */

export type ScanStatus = "idle" | "scanning" | "review";

interface CameraViewProps {
  status: ScanStatus;
  progress: number;
  previewUrl: string | null;
  onFileSelected: (file: File) => void;
  onAlbumClick: () => void;
  onCameraClick: () => void;
  onConfirm: () => void;
  onBack: () => void;
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

/** Warm claymorphism focus brackets using primary green */
function FocusBracket({ isScanning }: { isScanning: boolean }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      animate={
        isScanning
          ? { width: "60%", height: "60%", opacity: 0.5 }
          : { width: "72%", height: "72%", opacity: 0.8 }
      }
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ aspectRatio: "4/3" }}
    >
      {/* top-left */}
      <div className="absolute left-0 top-0 w-6 h-6">
        <div
          className="absolute left-0 top-0 w-6 h-[3px] rounded-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
        <div
          className="absolute left-0 top-0 w-[3px] h-6 rounded-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
      </div>
      {/* top-right */}
      <div className="absolute right-0 top-0 w-6 h-6">
        <div
          className="absolute right-0 top-0 w-6 h-[3px] rounded-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
        <div
          className="absolute right-0 top-0 w-[3px] h-6 rounded-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
      </div>
      {/* bottom-left */}
      <div className="absolute left-0 bottom-0 w-6 h-6">
        <div
          className="absolute left-0 bottom-0 w-6 h-[3px] rounded-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
        <div
          className="absolute left-0 bottom-0 w-[3px] h-6 rounded-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
      </div>
      {/* bottom-right */}
      <div className="absolute right-0 bottom-0 w-6 h-6">
        <div
          className="absolute right-0 bottom-0 w-6 h-[3px] rounded-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
        <div
          className="absolute right-0 bottom-0 w-[3px] h-6 rounded-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
      </div>
    </motion.div>
  );
}

/** AR HUD — warm title with floating animation */
function ARHud({
  status,
  hasPreview,
}: {
  status: ScanStatus;
  hasPreview: boolean;
}) {
  return (
    <div className="absolute left-5 top-5 z-10 pointer-events-none">
      <AnimatePresence mode="wait">
        {status === "scanning" ? (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.p
              className="text-h1 leading-none"
              style={{ color: "var(--color-ink)" }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              识别中...
            </motion.p>
            <p className="text-small mt-1" style={{ color: "var(--color-ink-soft)" }}>
              正在分析冰箱中的食材
            </p>
          </motion.div>
        ) : status === "review" && hasPreview ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-h1 leading-none" style={{ color: "var(--color-ink)" }}>
              识别完成
            </p>
            <p className="text-small mt-1" style={{ color: "var(--color-ink-soft)" }}>
              请确认识别结果并同步
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-h1 leading-none" style={{ color: "var(--color-ink)" }}>
              冰箱扫描
            </p>
            <p className="text-small mt-1" style={{ color: "var(--color-ink-soft)" }}>
              拍下冰箱，快速录入食材
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Warm glowing scan line using primary green gradient */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-4 right-4 h-[3px] z-20 pointer-events-none rounded-full"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, var(--color-primary) 50%, transparent 100%)",
        boxShadow: "0 0 20px var(--color-primary), 0 0 40px rgba(123, 207, 142, 0.3)",
        filter: "blur(0.5px)",
      }}
      animate={{ top: ["15%", "85%", "15%"] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/** Warm claymorphism progress bar */
function ScanProgressBar({ progress }: { progress: number }) {
  const label =
    progress < 45
      ? "正在提取特征..."
      : progress < 78
        ? "正在智能校对..."
        : "生成食材清单...";

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-6">
      <div className="flex justify-between items-center mb-2">
        <motion.span
          className="text-small font-medium"
          style={{ color: "var(--color-ink-soft)" }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {label}
        </motion.span>
        <span className="text-xs font-semibold" style={{ color: "var(--color-primary-deep)" }}>
          {progress}%
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--color-hairline)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--color-primary)" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */

export const CameraView = React.memo(function CameraView({
  status,
  progress,
  previewUrl,
  onFileSelected,
  onAlbumClick,
  onCameraClick,
  onConfirm,
  onBack,
}: CameraViewProps) {
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected],
  );

  const isScanning = status === "scanning";
  const isReview = status === "review";
  const hasPreview = !!previewUrl;

  return (
    <div
      className="relative w-full h-full flex flex-col"
      ref={dropRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Fullscreen background */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="冰箱图片"
                className="max-w-full max-h-full w-auto h-auto object-contain"
                style={{ display: "block" }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="absolute inset-0 flex flex-col items-center justify-center px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Upload zone — warm claymorphism card */}
              <motion.div
                className="flex flex-col items-center justify-center w-56 h-56 cursor-pointer"
                style={{
                  borderRadius: 32,
                  backgroundColor: "var(--color-surface-elevated)",
                  boxShadow:
                    "0 4px 16px rgba(43,43,43,0.06), 0 0 0 1px rgba(255,255,255,0.8) inset, 0 -1px 0 rgba(43,43,43,0.03) inset",
                  border: "2px dashed var(--color-hairline)",
                }}
                onClick={onAlbumClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAlbumClick();
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                {/* Upload icon with warm tint */}
                <motion.div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "var(--color-card-mint)" }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-primary-deep)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </motion.div>
                <p className="text-body font-medium mb-1" style={{ color: "var(--color-ink-soft)" }}>
                  点击或拖拽上传冰箱照片
                </p>
                <p className="text-caption" style={{ color: "var(--color-ink-muted)" }}>
                  JPG / PNG / HEIC
                </p>
              </motion.div>

              {/* Quick action hint */}
              <motion.div
                className="mt-6 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "var(--color-primary)" }}
                />
                <span className="text-caption" style={{ color: "var(--color-ink-muted)" }}>
                  也可以使用下方相机按钮直接拍摄
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Warm gradient overlay — very soft */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(43,43,43,0.04) 0%, transparent 40%, rgba(43,43,43,0.02) 100%)",
        }}
      />

      {/* AR HUD */}
      <ARHud status={status} hasPreview={hasPreview} />

      {/* Focus bracket */}
      {!isScanning && <FocusBracket isScanning={false} />}

      {/* Scanning elements */}
      {isScanning && (
        <>
          <FocusBracket isScanning={true} />
          <ScanLine />
        </>
      )}

      {/* Progress bar */}
      {isScanning && <ScanProgressBar progress={progress} />}

      {/* Bottom control panel */}
      <ControlPanel
        status={status}
        hasPreview={hasPreview}
        onAlbumClick={onAlbumClick}
        onCameraClick={onCameraClick}
        onConfirm={onConfirm}
        onBack={onBack}
      />
    </div>
  );
});
