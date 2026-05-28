"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFridgeStore } from "@/store/fridgeStore";
import { MOCK_INGREDIENTS } from "@/mock/ingredients";
import { CameraView } from "@/components/scan/CameraView";
import type { ScanStatus } from "@/components/scan/CameraView";
import { RecognitionDrawer } from "@/components/scan/RecognitionDrawer";
import type {
  ScanIngredient,
  IngredientStatus,
  IngredientZone,
  IngredientCategory,
} from "@/components/scan/RecognitionDrawer";

/* ── Shared types ───────────────────────────────────────────────────────── */

type RecognitionMeta = {
  provider?: string;
  imageApis?: string[];
  candidates?: Array<{ name: string; confidence: number; source: string }>;
  warnings?: string[];
};

type RecognizedIngredient = Omit<ScanIngredient, "zone" | "category"> & {
  zone?: IngredientZone;
  category?: IngredientCategory;
};

type RecognitionPayload = {
  ingredients?: RecognizedIngredient[];
  meta?: RecognitionMeta;
  error?: string;
};

/* ── Utility functions ──────────────────────────────────────────────────── */

const NAME_TO_ID = new Map<string, string>(
  MOCK_INGREDIENTS.filter((i) => !i.isPantry).map((i) => [i.name, i.id]),
);

function parseAmountToQty(amount: string) {
  const match = amount.match(/\d+(\.\d+)?/);
  const parsed = match ? Number(match[0]) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function formatShelfLifeDays(value: string) {
  const match = value.match(/\d+(\.\d+)?/);
  if (!match) return "";
  const days = Number(match[0]);
  return Number.isFinite(days) && days >= 0 ? `${days} 天` : "";
}

function inferCategory(name: string): IngredientCategory {
  const matched = MOCK_INGREDIENTS.find((item) => item.name === name.trim());
  if (matched?.category === "fruit") return "fruit";
  if (matched?.category === "dairy") return "dairy";
  if (matched?.category === "protein") return "protein";
  if (matched?.category === "carb") return "grain";
  return "vegetable";
}

function withDefaultFields(items: RecognizedIngredient[]): ScanIngredient[] {
  return items.map((item) => ({
    ...item,
    shelfLife: formatShelfLifeDays(item.shelfLife) || "",
    zone: item.zone ?? "fridge",
    category: item.category ?? inferCategory(item.name),
  }));
}

function getIngredientIdForSync(name: string) {
  const normalized = name.trim();
  return NAME_TO_ID.get(normalized) ?? `custom:${normalized}`;
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("图片预处理失败")); };
    image.src = url;
  });
}

async function optimizeImageForRecognition(file: File) {
  const image = await loadImageFromFile(file);
  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器无法处理图片。");
  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  if (!blob) throw new Error("图片压缩失败");
  const safeName = file.name.replace(/\.[^.]+$/, "") || "fridge-photo";
  return new File([blob], `${safeName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}

/* ── Page Component ─────────────────────────────────────────────────────── */

export default function ScanPage() {
  const router = useRouter();
  const { addItems } = useFridgeStore();

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<ScanIngredient[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">("info");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const progressTimers = useRef<number[]>([]);
  const lastFileRef = useRef<File | null>(null);

  const hasInvalidRows = ingredients.some(
    (item) => !item.name.trim() || !item.amount.trim() || !item.shelfLife.trim(),
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      progressTimers.current.forEach(window.clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearProgressTimers() {
    progressTimers.current.forEach(window.clearTimeout);
    progressTimers.current = [];
  }

  function runProgressUntilResponse() {
    clearProgressTimers();
    setProgress(12);
    const checkpoints = [28, 46, 63, 78, 90];
    checkpoints.forEach((value, index) => {
      const timer = window.setTimeout(() => setProgress(value), 600 * (index + 1));
      progressTimers.current.push(timer);
    });
  }

  async function startRecognition(file = lastFileRef.current) {
    if (!file) return;

    clearProgressTimers();
    setMessage("");
    setStatus("scanning");
    setIngredients([]);
    runProgressUntilResponse();

    const formData = new FormData();
    try {
      let uploadFile = file;
      try {
        uploadFile = await optimizeImageForRecognition(file);
      } catch (_err) {
        // use original
      }

      formData.append("image", uploadFile);
      formData.append("originalName", file.name);
      formData.append("baiduMode", "auto");

      const response = await fetch("/api/recognize", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as RecognitionPayload;

      if (!response.ok) throw new Error(payload?.error || "识别失败。");

      clearProgressTimers();
      setProgress(100);
      const items = withDefaultFields(payload.ingredients ?? []);
      setIngredients(items);
      setStatus("review");
      setDrawerOpen(items.length > 0);
      if (!items.length) {
        setMessage("没有识别到明显食材，可以换图重试或手动补录。");
        setMessageType("info");
      }
    } catch (error) {
      clearProgressTimers();
      setProgress(0);
      setStatus("review");
      setDrawerOpen(true);
      setMessage(error instanceof Error ? error.message : "识别失败。");
      setMessageType("error");
    }
  }

  const acceptFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      lastFileRef.current = file;
      setPreviewUrl(URL.createObjectURL(file));
      startRecognition(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewUrl],
  );

  const updateIngredient = useCallback(
    (id: number, field: keyof Omit<ScanIngredient, "id">, value: string) => {
      setMessage("");
      setIngredients((items) =>
        items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      );
    },
    [],
  );

  const deleteIngredient = useCallback((id: number) => {
    setMessage("");
    setIngredients((items) => items.filter((item) => item.id !== id));
  }, []);

  const addIngredientManually = useCallback(() => {
    const newItem: ScanIngredient = {
      id: Date.now(),
      name: "新食材",
      amount: "1 份",
      shelfLife: "3 天",
      status: "fresh",
      zone: "fridge",
      category: "vegetable",
    };
    setIngredients((items) => [...items, newItem]);
    setMessage("已添加一条食材，可直接修改名称、数量和保质期。");
    setMessageType("success");
    if (status === "idle") {
      setStatus("review");
      setDrawerOpen(true);
    }
  }, [status]);

  const confirmSync = useCallback(() => {
    if (ingredients.length === 0 || hasInvalidRows) {
      setMessage("请补全食材名称、数量和保质期后再同步。");
      setMessageType("info");
      return;
    }

    const matched: Array<{
      ingredientId: string;
      name?: string;
      category: IngredientCategory;
      qty: number;
      status: IngredientStatus;
      zone: IngredientZone;
      shelfLife: string;
    }> = [];

    for (const item of ingredients) {
      const id = getIngredientIdForSync(item.name);
      if (id) {
        matched.push({
          ingredientId: id,
          name: item.name.trim(),
          category: item.category,
          qty: parseAmountToQty(item.amount),
          status: item.status,
          zone: item.zone,
          shelfLife: formatShelfLifeDays(item.shelfLife),
        });
      }
    }

    if (matched.length > 0) addItems(matched);

    // Auto-clear: reset everything for a fresh start
    clearProgressTimers();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setIngredients([]);
    setDrawerOpen(false);
    setStatus("idle");
    setProgress(0);
    setMessage(`同步成功：已更新冰箱库存。（已同步 ${matched.length} 项）`);
    setMessageType("success");
    lastFileRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredients, hasInvalidRows, addItems, previewUrl]);

  const resetPage = useCallback(() => {
    clearProgressTimers();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setIngredients([]);
    setProgress(0);
    setStatus("idle");
    setMessage("");
    setDrawerOpen(false);
    lastFileRef.current = null;
  }, [previewUrl]);

  const handleBack = useCallback(() => {
    router.push("/fridge");
  }, [router]);

  return (
    <main className="fixed inset-0 bg-[#e8e6e1] text-[#1a1a1a] flex flex-col z-50">
      {/* Fullscreen camera section — takes entire viewport */}
      <section className="flex-1 relative">
        <CameraView
          status={status}
          progress={progress}
          previewUrl={previewUrl}
          onFileSelected={acceptFile}
          onAlbumClick={() => albumInputRef.current?.click()}
          onCameraClick={() => cameraInputRef.current?.click()}
          onConfirm={confirmSync}
          onBack={handleBack}
        />
      </section>

      {/* Message bar — overlaid at bottom above control panel */}
      {message && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-[414px] mx-auto pointer-events-none">
          <div
            className={`rounded-[12px] p-4 text-xs font-medium ${
              messageType === "success"
                ? "bg-[#d9f3e1] text-[#1aae39]"
                : messageType === "error"
                  ? "bg-[#ffe8d4] text-[#e03131]"
                  : "bg-[#fef7d6] text-[#793400]"
            }`}
          >
            <p className="text-xs font-semibold opacity-70 mb-1">提示</p>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      )}

      {/* Recognition Drawer */}
      <RecognitionDrawer
        isOpen={drawerOpen && status === "review"}
        ingredients={ingredients}
        message={message}
        messageType={messageType}
        onClose={() => setDrawerOpen(false)}
        onUpdate={updateIngredient}
        onDelete={deleteIngredient}
        onAdd={addIngredientManually}
        onConfirmSync={confirmSync}
        hasInvalidRows={hasInvalidRows}
      />

      {/* Hidden file inputs */}
      <input
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) acceptFile(file);
          e.target.value = "";
        }}
        ref={cameraInputRef}
        type="file"
      />
      <input
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) acceptFile(file);
          e.target.value = "";
        }}
        ref={albumInputRef}
        type="file"
      />
    </main>
  );
}
