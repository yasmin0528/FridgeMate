"use client";

import React from "react";
import { motion } from "framer-motion";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface ControlPanelProps {
  /** idle ? shutter (camera), scanning ? disabled, review ? confirm */
  status: "idle" | "scanning" | "review";
  hasPreview: boolean;
  onAlbumClick: () => void;
  onCameraClick: () => void;
  onConfirm: () => void;
  onBack: () => void;
}

/* ── Icon Svg Components ────────────────────────────────────────────────── */

function AlbumIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */

export const ControlPanel = React.memo(function ControlPanel({
  status,
  hasPreview,
  onAlbumClick,
  onCameraClick,
  onConfirm,
  onBack,
}: ControlPanelProps) {
  const isScanning = status === "scanning";
  const isReview = status === "review";

  return (
    <div className="absolute bottom-5 left-4 right-4">
      {/* Warm glassmorphism panel */}
      <div
        className="rounded-[28px] px-6 py-5"
        style={{
          backgroundColor: "rgba(255, 253, 248, 0.85)",
          backdropFilter: "blur(20px) saturate(1.2)",
          WebkitBackdropFilter: "blur(20px) saturate(1.2)",
          boxShadow:
            "0 4px 16px rgba(43,43,43,0.08), 0 0 0 1px rgba(255,255,255,0.8) inset, 0 -1px 0 rgba(43,43,43,0.03) inset",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left: album button */}
          <motion.button
            type="button"
            onClick={onAlbumClick}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "var(--color-surface-soft)",
              boxShadow: "0 2px 8px rgba(43,43,43,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset",
            }}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.04 }}
            disabled={isScanning}
            aria-label="相册导入"
          >
            <AlbumIcon />
          </motion.button>

          {/* Center: shutter / confirm */}
          <motion.button
            type="button"
            onClick={isReview ? onConfirm : onCameraClick}
            disabled={isScanning}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: isReview
                ? "var(--color-primary)"
                : "var(--color-ink)",
              boxShadow: isReview
                ? "0 4px 16px rgba(123, 207, 142, 0.35), 0 0 0 1px rgba(255,255,255,0.4) inset"
                : "0 4px 16px rgba(43,43,43,0.2), 0 0 0 1px rgba(255,255,255,0.15) inset",
            }}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            aria-label={isReview ? "确认同步" : "拍照识别"}
          >
            {isReview ? <CheckIcon /> : <CameraIcon />}
          </motion.button>

          {/* Right: back button */}
          <motion.button
            type="button"
            onClick={onBack}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "var(--color-surface-soft)",
              boxShadow: "0 2px 8px rgba(43,43,43,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset",
            }}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.04 }}
            disabled={isScanning}
            aria-label="返回冰箱"
          >
            <BackIcon />
          </motion.button>
        </div>
      </div>
    </div>
  );
});
