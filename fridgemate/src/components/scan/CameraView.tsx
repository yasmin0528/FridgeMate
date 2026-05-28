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

/** 四角对焦框 — 深色用于浅色背景 */
function FocusBracket({ isScanning }: { isScanning: boolean }) {
  const borderColor = "rgba(80,80,80,0.5)";
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      animate={
        isScanning
          ? { width: "60%", height: "60%", opacity: 0.4 }
          : { width: "70%", height: "70%", opacity: 0.7 }
      }
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ aspectRatio: "4/3" }}
    >
      {/* top-left */}
      <div className="absolute left-0 top-0 w-5 h-5">
        <div className="absolute left-0 top-0 w-5 h-[2px]" style={{ backgroundColor: borderColor }} />
        <div className="absolute left-0 top-0 w-[2px] h-5" style={{ backgroundColor: borderColor }} />
      </div>
      {/* top-right */}
      <div className="absolute right-0 top-0 w-5 h-5">
        <div className="absolute right-0 top-0 w-5 h-[2px]" style={{ backgroundColor: borderColor }} />
        <div className="absolute right-0 top-0 w-[2px] h-5" style={{ backgroundColor: borderColor }} />
      </div>
      {/* bottom-left */}
      <div className="absolute left-0 bottom-0 w-5 h-5">
        <div className="absolute left-0 bottom-0 w-5 h-[2px]" style={{ backgroundColor: borderColor }} />
        <div className="absolute left-0 bottom-0 w-[2px] h-5" style={{ backgroundColor: borderColor }} />
      </div>
      {/* bottom-right */}
      <div className="absolute right-0 bottom-0 w-5 h-5">
        <div className="absolute right-0 bottom-0 w-5 h-[2px]" style={{ backgroundColor: borderColor }} />
        <div className="absolute right-0 bottom-0 w-[2px] h-5" style={{ backgroundColor: borderColor }} />
      </div>
    </motion.div>
  );
}

/** AR HUD — 左上角悬浮信息，深色文字适配浅色背景 */
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
          >
            <p className="text-[36px] font-semibold text-[#2a2a2a] leading-none">
              识别中…
            </p>
            <p className="text-xs font-medium text-[#5a5a5a] mt-1">
              正在分析冰箱中的食材
            </p>
          </motion.div>
        ) : status === "review" && hasPreview ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <p className="text-[36px] font-semibold text-[#2a2a2a] leading-none">
              识别完成
            </p>
            <p className="text-xs font-medium text-[#5a5a5a] mt-1">
              请确认识别结果并同步
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <p className="text-[36px] font-semibold text-[#2a2a2a] leading-none">
              冰箱扫描
            </p>
            <p className="text-xs font-medium text-[#5a5a5a] mt-1">
              拍下冰箱，快速录入食材
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 扫描激光线 — 调整为深色以适配浅色背景 */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-2 right-2 h-[2px] z-20 pointer-events-none"
      style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(80,80,80,0.6) 50%, transparent 100%)",
        boxShadow: "0 0 15px rgba(80,80,80,0.3), 0 0 30px rgba(80,80,80,0.1)",
      }}
      animate={{ top: ["12%", "88%", "12%"] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/** 进度条 — 浅色主题 */
function ScanProgressBar({ progress }: { progress: number }) {
  const label =
    progress < 45
      ? "正在提取特征…"
      : progress < 78
        ? "正在智能校对…"
        : "生成食材清单…";

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-[#5a5a5a]">
          {label}
        </span>
        <span className="text-xs font-semibold text-[#3a3a3a]">
          {progress}%
        </span>
      </div>
      <div className="h-1 rounded-full bg-black/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "#5645d4" }}
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
    <div className="relative w-full h-full flex flex-col" ref={dropRef} onDragOver={handleDragOver} onDrop={handleDrop}>
      {/* Fullscreen camera background — light color, fills entire area */}
      <div className="absolute inset-0 bg-[#e8e6e1]">
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
              {/* Image keeps its original aspect ratio; empty areas show the light camera background */}
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
              {/* 上传占位 */}
              <div
                className="w-48 h-48 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/15 bg-black/3"
                onClick={onAlbumClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAlbumClick();
                  }
                }}
              >
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(80,80,80,0.4)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="mt-4 text-sm font-medium text-black/40">
                  点击或拖拽上传冰箱照片
                </p>
                <p className="mt-1 text-xs text-black/25">JPG / PNG / HEIC</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部浅色渐变遮罩 — 极淡，保持明亮感 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-black/3" />

      {/* AR HUD */}
      <ARHud status={status} hasPreview={hasPreview} />

      {/* 对焦框 */}
      {!isScanning && <FocusBracket isScanning={false} />}

      {/* 扫描激光线 */}
      {isScanning && (
        <>
          <FocusBracket isScanning={true} />
          <ScanLine />
        </>
      )}

      {/* 扫描进度条 */}
      {isScanning && <ScanProgressBar progress={progress} />}

      {/* 底部控制面板 */}
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
