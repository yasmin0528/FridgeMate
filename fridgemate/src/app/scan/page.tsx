"use client";

import Link from "next/link";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { useFridgeStore } from "@/store/fridgeStore";
import { MOCK_INGREDIENTS } from "@/mock/ingredients";

type RecognitionStage = "idle" | "recognizing" | "review" | "synced";
type IngredientStatus = "fresh" | "soon" | "urgent";
type IngredientZone = "fridge" | "freeze";
type IngredientCategory = "vegetable" | "fruit" | "dairy" | "meat" | "grain" | "protein";

type Ingredient = {
  id: number;
  name: string;
  amount: string;
  shelfLife: string;
  status: IngredientStatus;
  zone: IngredientZone;
  category: IngredientCategory;
  confidence?: number;
  source?: string;
};

type RecognitionMeta = {
  provider?: string;
  imageApis?: string[];
  candidates?: Array<{
    name: string;
    confidence: number;
    source: string;
  }>;
  warnings?: string[];
};

type RecognizedIngredient = Omit<Ingredient, "zone" | "category"> & {
  zone?: IngredientZone;
  category?: IngredientCategory;
};

type RecognitionPayload = {
  ingredients?: RecognizedIngredient[];
  meta?: RecognitionMeta;
  error?: string;
};

const copy = {
  appSubtitle: "\u6570\u5b57\u51b0\u7bb1\u52a9\u624b",
  navInventory: "\u5e93\u5b58",
  navUpload: "\u4e0a\u4f20\u8bc6\u522b",
  navRecipes: "\u83dc\u8c31",
  navProfile: "\u6210\u5c31",
  pageKicker: "\u9875\u9762\u4e8c · \u62cd\u7167\u4e0a\u4f20\u9875",
  heroTitle: "\u62cd\u4e0b\u51b0\u7bb1\uff0c\u5feb\u901f\u5f55\u5165\u98df\u6750",
  heroDesc:
    "\u652f\u6301\u62cd\u7167\u6216\u4ece\u76f8\u518c\u4e0a\u4f20\u51b0\u7bb1\u56fe\u7247\uff0c\u8bc6\u522b\u5b8c\u6210\u540e\u53ef\u4fee\u6539\u3001\u5220\u9664\u6216\u8865\u5145\u7ed3\u679c\uff0c\u518d\u540c\u6b65\u5230\u9996\u9875\u6570\u5b57\u51b0\u7bb1\u5e93\u5b58\u3002",
  camera: "\u62cd\u7167\u5f55\u5165",
  album: "\u4ece\u76f8\u518c\u4e0a\u4f20",
  uploadAction: "\u4e0a\u4f20\u6216\u62cd\u7167\u8bc6\u522b",
  previewTitle: "AI \u8bc6\u522b\u9884\u89c8",
  emptyUpload: "\u9009\u62e9\u4e00\u5f20\u51b0\u7bb1\u56fe\u7247\u5f00\u59cb\u8bc6\u522b",
  uploadHint: "JPG\u3001PNG \u6216 HEIC \u5747\u53ef\u7528\u4e8e\u6f14\u793a",
  dragHint: "\u4e5f\u53ef\u4ee5\u5c06\u56fe\u7247\u62d6\u5230\u8fd9\u91cc",
  currentStatus: "\u5f53\u524d\u72b6\u6001",
  progress: "\u8bc6\u522b\u8fdb\u5ea6",
  stageIdle: "\u7b49\u5f85\u4e0a\u4f20",
  stageRecognizing: "\u6b63\u5728\u8bc6\u522b",
  stageReview: "\u8bf7\u786e\u8ba4\u7ed3\u679c",
  stageSynced: "\u5df2\u540c\u6b65\u5e93\u5b58",
  recognizingDesc:
    "\u7cfb\u7edf\u6b63\u5728\u5206\u6790\u56fe\u7247\u4e2d\u7684\u98df\u6750\u540d\u79f0\u3001\u6570\u91cf\u4e0e\u4fdd\u8d28\u671f\u3002",
  idleDesc:
    "\u8bc6\u522b\u7ed3\u679c\u4f1a\u5148\u8fdb\u5165\u4eba\u5de5\u786e\u8ba4\u73af\u8282\uff0c\u907f\u514d\u9519\u8bef\u4fe1\u606f\u76f4\u63a5\u8fdb\u5165\u5e93\u5b58\u3002",
  syncedDesc:
    "\u672c\u6b21\u786e\u8ba4\u7684\u98df\u6750\u5df2\u8bb0\u5f55\u5728\u672c\u5730\u6f14\u793a\u5e93\u5b58\u4e2d\u3002",
  file: "\u672c\u6b21\u6587\u4ef6",
  noFile: "\u5c1a\u672a\u9009\u62e9\u56fe\u7247",
  recognitionSource: "\u8bc6\u522b\u6765\u6e90",
  sourcePending: "\u5c1a\u672a\u8bc6\u522b",
  optimizedUpload: "\u5df2\u4f18\u5316\u4e0a\u4f20",
  originalUpload: "\u539f\u56fe\u4e0a\u4f20",
  candidateCount: "\u5019\u9009",
  confidence: "\u7f6e\u4fe1\u5ea6",
  source: "\u6765\u6e90",
  detected: "\u8bc6\u522b\u98df\u6750",
  freshCount: "\u65b0\u9c9c\u72b6\u6001",
  steps: "\u8bc6\u522b\u6d41\u7a0b",
  stepUpload: "\u4e0a\u4f20\u51b0\u7bb1\u56fe\u7247",
  stepAi: "AI \u5206\u6790\u753b\u9762",
  stepReview: "\u4eba\u5de5\u786e\u8ba4\u7ed3\u679c",
  stepSync: "\u540c\u6b65\u5230\u9996\u9875\u5e93\u5b58",
  results: "\u8bc6\u522b\u7ed3\u679c",
  editTitle: "\u4fee\u6539\u3001\u5220\u9664\u6216\u8865\u5145\u98df\u6750",
  add: "\u8865\u5145\u98df\u6750",
  name: "\u540d\u79f0",
  amount: "\u6570\u91cf",
  shelfLife: "\u4fdd\u8d28\u671f",
  category: "食材种类",
  stockStatus: "\u5e93\u5b58\u72b6\u6001",
  storageZone: "存放方式",
  fridgeZone: "冷藏",
  freezeZone: "冷冻",
  delete: "\u5220\u9664",
  syncItem: "同步此项",
  retry: "\u91cd\u65b0\u8bc6\u522b",
  reset: "\u6e05\u7a7a\u91cd\u6765",
  confirm: "\u786e\u8ba4\u5e76\u540c\u6b65\u5e93\u5b58",
  syncedItem: "已同步并移出识别结果",
  unmatchedItem: "该食材暂未匹配到首页食材库，请先修改名称后再同步。",
  confirmSummary: "\u786e\u8ba4\u540e\u5c06\u540c\u6b65\u5230\u9996\u9875\u5e93\u5b58",
  readyToSync: "\u5f85\u540c\u6b65",
  needReview: "\u9700\u8865\u5168",
  emptyResults: "\u6682\u65e0\u8bc6\u522b\u7ed3\u679c\uff0c\u8bf7\u8865\u5145\u98df\u6750\u6216\u91cd\u65b0\u4e0a\u4f20\u56fe\u7247\u3002",
  validation: "\u8bf7\u8865\u5168\u98df\u6750\u540d\u79f0\u3001\u6570\u91cf\u548c\u4fdd\u8d28\u671f\u540e\u518d\u540c\u6b65\u3002",
  success: "\u540c\u6b65\u6210\u529f\uff1a\u5df2\u66f4\u65b0\u9996\u9875\u6570\u5b57\u51b0\u7bb1\u5e93\u5b58\u3002",
  addFromEmpty: "\u6dfb\u52a0\u7b2c\u4e00\u4e2a\u98df\u6750",
  chooseInput: "\u9009\u62e9\u5f55\u5165\u65b9\u5f0f",
  chooseInputDesc:
    "\u5148\u6dfb\u52a0\u98df\u6750\uff0c\u518d\u901a\u8fc7\u62cd\u7167\u6216\u76f8\u518c\u56fe\u7247\u8bc6\u522b\u98df\u7269\u3002",
  manualAdd: "\u624b\u52a8\u8865\u5f55",
  added: "\u5df2\u6dfb\u52a0\u4e00\u6761\u98df\u6750\uff0c\u53ef\u76f4\u63a5\u4fee\u6539\u540d\u79f0\u3001\u6570\u91cf\u548c\u4fdd\u8d28\u671f\u3002",
};

const statusMeta: Record<
  IngredientStatus,
  { label: string; className: string; dot: string }
> = {
  fresh: {
    label: "\u65b0\u9c9c",
    className: "bg-[#d9f3e1] text-[#1aae39]",
    dot: "bg-[#1aae39]",
  },
  soon: {
    label: "\u4e34\u671f",
    className: "bg-[#fef7d6] text-[#793400]",
    dot: "bg-[#dd5b00]",
  },
  urgent: {
    label: "\u9700\u5c3d\u5feb\u5904\u7406",
    className: "bg-[#ffe8d4] text-[#dd5b00]",
    dot: "bg-[#e03131]",
  },
};

const categoryOptions: Array<{ value: IngredientCategory; label: string }> = [
  { value: "vegetable", label: "蔬菜" },
  { value: "fruit", label: "水果" },
  { value: "dairy", label: "乳制品" },
  { value: "meat", label: "肉类" },
  { value: "grain", label: "主食" },
  { value: "protein", label: "高蛋白" },
];

function getStageLabel(stage: RecognitionStage) {
  if (stage === "recognizing") return copy.stageRecognizing;
  if (stage === "review") return copy.stageReview;
  if (stage === "synced") return copy.stageSynced;
  return copy.stageIdle;
}

// 按中文名称反查共享 ingredient id, 用于把识别结果同步到 fridgeStore
const NAME_TO_ID = new Map<string, string>(
  MOCK_INGREDIENTS.filter((i) => !i.isPantry).map((i) => [i.name, i.id])
);

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function formatConfidence(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "\u5f85\u786e\u8ba4";
  }

  return `${Math.round(value * 100)}%`;
}

function parseAmountToQty(amount: string) {
  const match = amount.match(/\d+(\.\d+)?/);
  const parsed = match ? Number(match[0]) : 1;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function readShelfLifeDays(value: string) {
  if (value.includes("周")) {
    const match = value.match(/\d+(\.\d+)?/);
    const weeks = match ? Number(match[0]) : 1;

    return Number.isFinite(weeks) ? String(Math.round(weeks * 7)) : "";
  }

  const match = value.match(/\d+(\.\d+)?/);

  return match ? match[0] : "";
}

function formatShelfLifeDays(value: string) {
  const match = value.match(/\d+(\.\d+)?/);

  if (!match) {
    return "";
  }

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

function withDefaultFields(items: RecognizedIngredient[]) {
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

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("\u56fe\u7247\u9884\u5904\u7406\u5931\u8d25\uff0c\u5c06\u5c1d\u8bd5\u4f7f\u7528\u539f\u56fe\u8bc6\u522b\u3002"));
    };
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

  if (!context) {
    throw new Error("\u5f53\u524d\u6d4f\u89c8\u5668\u65e0\u6cd5\u5904\u7406\u56fe\u7247\u3002");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.86);
  });

  if (!blob) {
    throw new Error("\u56fe\u7247\u538b\u7f29\u5931\u8d25\uff0c\u5c06\u5c1d\u8bd5\u4f7f\u7528\u539f\u56fe\u8bc6\u522b\u3002");
  }

  const safeName = file.name.replace(/\.[^.]+$/, "") || "fridge-photo";

  return new File([blob], `${safeName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export default function UploadPage() {
  const { addItems } = useFridgeStore();
  const [stage, setStage] = useState<RecognitionStage>("idle");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [message, setMessage] = useState("");
  const [uploadSummary, setUploadSummary] = useState("");
  const [recognitionMeta, setRecognitionMeta] = useState<RecognitionMeta | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const progressTimers = useRef<number[]>([]);
  const lastFileRef = useRef<File | null>(null);

  const hasInvalidRows = ingredients.some(
    (item) => !item.name.trim() || !item.amount.trim() || !item.shelfLife.trim(),
  );
  const recognitionSource = useMemo(() => {
    if (!recognitionMeta?.provider) {
      return copy.sourcePending;
    }

    const provider =
      recognitionMeta.provider === "baidu"
        ? "\u767e\u5ea6"
        : recognitionMeta.provider === "doubao"
          ? "\u8c46\u5305"
        : recognitionMeta.provider.toUpperCase();
    const apis = recognitionMeta.imageApis?.length
      ? ` / ${recognitionMeta.imageApis.join(" + ")}`
      : "";

    return `${provider}${apis}`;
  }, [recognitionMeta]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      progressTimers.current.forEach(window.clearTimeout);
    };
  }, [previewUrl]);

  function clearProgressTimers() {
    progressTimers.current.forEach(window.clearTimeout);
    progressTimers.current = [];
  }

  function runProgressUntilResponse() {
    clearProgressTimers();
    setProgress(12);

    const checkpoints = [28, 46, 63, 78, 90];
    checkpoints.forEach((value, index) => {
      const timer = window.setTimeout(() => {
        setProgress(value);
      }, 600 * (index + 1));

      progressTimers.current.push(timer);
    });
  }

  async function startRecognition(file = lastFileRef.current) {
    if (!file) {
      setMessage("\u8bf7\u5148\u62cd\u7167\u6216\u9009\u62e9\u4e00\u5f20\u56fe\u7247\u3002");
      return;
    }

    clearProgressTimers();
    setMessage("");
    setStage("recognizing");
    setIngredients([]);
    setRecognitionMeta(null);
    setUploadSummary("");
    runProgressUntilResponse();

    const formData = new FormData();

    try {
      let uploadFile = file;

      try {
        uploadFile = await optimizeImageForRecognition(file);
        const optimized =
          uploadFile.size < file.size || uploadFile.type !== file.type;
        setUploadSummary(
          `${optimized ? copy.optimizedUpload : copy.originalUpload}: ${formatBytes(file.size)} -> ${formatBytes(uploadFile.size)}`,
        );
      } catch (error) {
        setUploadSummary(
          error instanceof Error ? error.message : "\u4f7f\u7528\u539f\u56fe\u4e0a\u4f20",
        );
      }

      formData.append("image", uploadFile);
      formData.append("originalName", file.name);
      formData.append("baiduMode", "auto");

      const response = await fetch("/api/recognize", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as RecognitionPayload;

      if (!response.ok) {
        throw new Error(payload?.error || "\u8bc6\u522b\u5931\u8d25\u3002");
      }

      clearProgressTimers();
      setProgress(100);
      setIngredients(withDefaultFields(payload.ingredients ?? []));
      setRecognitionMeta(payload.meta ?? null);
      setStage("review");
      setMessage(
        payload.ingredients?.length
          ? payload.meta?.warnings?.filter(Boolean).join("\uff1b") ?? ""
          : "\u6ca1\u6709\u8bc6\u522b\u5230\u660e\u663e\u98df\u6750\uff0c\u53ef\u4ee5\u6362\u56fe\u91cd\u8bd5\u6216\u624b\u52a8\u8865\u5f55\u3002",
      );
    } catch (error) {
      clearProgressTimers();
      setProgress(0);
      setStage("review");
      setMessage(error instanceof Error ? error.message : "\u8bc6\u522b\u5931\u8d25\u3002");
    }
  }

  function acceptFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setMessage("\u8bf7\u9009\u62e9\u56fe\u7247\u6587\u4ef6\u3002");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    lastFileRef.current = file;
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setUploadSummary("");
    setRecognitionMeta(null);
    startRecognition(file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) acceptFile(file);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  }

  function updateIngredient(
    id: number,
    field: keyof Omit<Ingredient, "id">,
    value: string,
  ) {
    setMessage("");
    setIngredients((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function deleteIngredient(id: number) {
    setMessage("");
    setIngredients((items) => items.filter((item) => item.id !== id));
  }

  function addIngredientManually() {
    const newItem: Ingredient = {
      id: Date.now(),
      name: "\u65b0\u98df\u6750",
      amount: "1 \u4efd",
      shelfLife: "3 \u5929",
      status: "fresh",
      zone: "fridge",
      category: "vegetable",
    };

    setIngredients((items) => [
      ...items,
      newItem,
    ]);
    setMessage(copy.added);
    if (stage === "idle") setStage("review");
  }

  function confirmSync() {
    if (ingredients.length === 0 || hasInvalidRows) {
      setMessage(copy.validation);
      return;
    }

    // 把识别结果按中文名匹配到 INGREDIENT_BY_ID, 通过共享 fridgeStore 同步到首页冰箱
    const matched: {
      ingredientId: string;
      name?: string;
      category: IngredientCategory;
      qty: number;
      status: IngredientStatus;
      zone: IngredientZone;
      shelfLife: string;
    }[] = [];
    const unmatched: string[] = [];
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
      } else {
        unmatched.push(item.name);
      }
    }

    if (matched.length > 0) {
      addItems(matched);
      setIngredients([]);
    }

    setStage("synced");
    setProgress(100);
    if (unmatched.length === 0) {
      setMessage(`${copy.success} (已同步 ${matched.length} 项)`);
    } else {
      setMessage(
        `${copy.success} 已同步 ${matched.length} 项, ${unmatched.length} 项未在食材库中匹配: ${unmatched.join("、")}`
      );
    }
  }

  function syncSingleIngredient(item: Ingredient) {
    if (!item.name.trim() || !item.amount.trim() || !item.shelfLife.trim()) {
      setMessage(copy.validation);
      return;
    }

    const ingredientId = getIngredientIdForSync(item.name);

    addItems([
      {
        ingredientId,
        name: item.name.trim(),
        category: item.category,
        qty: parseAmountToQty(item.amount),
        status: item.status,
        zone: item.zone,
        shelfLife: formatShelfLifeDays(item.shelfLife),
      },
    ]);
    setIngredients((items) => items.filter((current) => current.id !== item.id));
    setStage("synced");
    setProgress(100);
    setMessage(`${item.name} ${copy.syncedItem}。`);
  }

  function resetPage() {
    clearProgressTimers();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName("");
    setIngredients([]);
    setProgress(0);
    setStage("idle");
    setMessage("");
    setUploadSummary("");
    setRecognitionMeta(null);
    lastFileRef.current = null;
  }

  return (
    <main className="min-h-screen bg-[#fafaf9] text-[#1a1a1a]">
      {/* Mobile header (\u4e0e BottomTab \u914d\u5957, \u4e0d\u518d\u4f7f\u7528\u684c\u9762\u9876\u90e8\u5bfc\u822a) */}
      <header className="px-4 py-3 border-b border-[#e5e3df] bg-white flex items-center gap-2">
        <Link href="/" className="text-xl" aria-label={"\u8fd4\u56de\u9996\u9875"}>{"\u2190"}</Link>
        <h1 className="text-base font-semibold">{copy.navUpload}</h1>
      </header>

      {/* Hero: navy \u80cc\u666f + \u6807\u9898 + \u884c\u52a8\u6309\u94ae */}
      <section className="bg-[#0a1530] text-white px-4 py-5">
        <p className="text-xs font-semibold text-[#d6b6f6]">
          {copy.pageKicker}
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-snug">
          {copy.heroTitle}
        </h2>
        <p className="mt-2 text-xs leading-5 text-[#d7d2ca]">
          {copy.heroDesc}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            className="h-11 w-full rounded-lg bg-[#5645d4] text-sm font-medium text-white"
            onClick={() => cameraInputRef.current?.click()}
            type="button"
          >
            {copy.camera}
          </button>
          <button
            className="h-11 w-full rounded-lg border border-[#a4a097] text-sm font-medium text-white"
            onClick={() => albumInputRef.current?.click()}
            type="button"
          >
            {copy.album}
          </button>
        </div>
      </section>

      {/* \u9884\u89c8 + \u5f53\u524d\u72b6\u6001 (\u5355\u5217\u5782\u76f4\u5806\u53e0) */}
      <section className="px-4 py-4 flex flex-col gap-3">
        <div
          className={`rounded-xl border border-dashed bg-white transition ${isDragging ? "border-[#5645d4] ring-2 ring-[#e6e0f5]" : "border-[#c8c4be]"}`}
          onClick={() => albumInputRef.current?.click()}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              albumInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="\u4e0a\u4f20\u7684\u51b0\u7bb1\u56fe\u7247\u9884\u89c8"
              className="w-full rounded-xl object-cover max-h-64"
              src={previewUrl}
            />
          ) : (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-[#e6e0f5] text-2xl text-[#391c57]">
                +
              </div>
              <p className="text-sm font-medium text-[#37352f]">
                {copy.emptyUpload}
              </p>
              <p className="mt-1 text-xs text-[#787671]">{copy.uploadHint}</p>
              <p className="mt-1 text-xs text-[#a4a097]">{copy.dragHint}</p>
            </div>
          )}
        </div>

        {/* \u5f53\u524d\u72b6\u6001\u5361 */}
        <div className="rounded-xl bg-[#f9e79f] p-4">
          <p className="text-xs font-semibold text-[#523410]">
            {copy.currentStatus}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[#37352f]">
            {getStageLabel(stage)}
          </h3>
          <p className="mt-2 text-xs leading-5 text-[#523410]">
            {stage === "recognizing"
              ? copy.recognizingDesc
              : stage === "synced"
                ? copy.syncedDesc
                : copy.idleDesc}
          </p>
          <div className="mt-3 rounded-lg bg-white/70 p-3">
            <div className="flex justify-between text-xs font-medium">
              <span>{copy.progress}</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white">
              <div
                className="h-2 rounded-full bg-[#5645d4] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* \u6587\u4ef6\u540d + \u7edf\u8ba1 chip */}
        <div className="rounded-xl bg-white border border-[#e5e3df] p-3">
          <p className="text-xs font-semibold text-[#787671]">{copy.file}</p>
          <p className="mt-1 break-all text-sm font-medium">
            {fileName || copy.noFile}
          </p>
          {uploadSummary ? (
            <p className="mt-1 text-xs text-[#5d5b54]">{uploadSummary}</p>
          ) : null}
          <div className="mt-3 rounded-lg bg-[#f6f5f4] p-2">
            <p className="text-xs font-semibold text-[#787671]">
              {copy.recognitionSource}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#37352f]">
              {recognitionSource}
              {recognitionMeta?.candidates?.length
                ? ` · ${copy.candidateCount} ${recognitionMeta.candidates.length}`
                : ""}
            </p>
          </div>
        </div>
      </section>

      {/* \u8bc6\u522b\u7ed3\u679c\u5217\u8868 */}
      <section className="px-4 pb-6">
        <div className="rounded-xl border border-[#e5e3df] bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-[#ede9e4] p-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#5645d4]">
                {copy.results}
              </p>
              <h2 className="mt-0.5 text-base font-semibold truncate">
                {copy.editTitle}
              </h2>
            </div>
            <button
              className="h-9 shrink-0 rounded-lg border border-[#c8c4be] px-3 text-xs font-medium text-[#1a1a1a]"
              onClick={addIngredientManually}
              type="button"
            >
              {copy.add}
            </button>
          </div>

          {message ? (
            <div
              className={`m-3 rounded-lg p-3 text-xs font-medium ${stage === "synced" ? "bg-[#d9f3e1] text-[#1aae39]" : "bg-[#ffe8d4] text-[#793400]"}`}
            >
              {message}
            </div>
          ) : null}

          {ingredients.length > 0 ? (
            <div className="divide-y divide-[#ede9e4]">
              {ingredients.map((item) => (
                <article
                  className="space-y-3 p-3"
                  key={item.id}
                >
                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-[#787671]">
                      {copy.name}
                    </span>
                    <input
                      className="h-10 rounded-lg border border-[#c8c4be] px-3 text-sm outline-none focus:border-2 focus:border-[#5645d4]"
                      onChange={(event) =>
                        updateIngredient(item.id, "name", event.target.value)
                      }
                      value={item.name}
                    />
                    {(item.source || typeof item.confidence === "number") ? (
                      <span className="text-xs leading-5 text-[#787671]">
                        {copy.source}: {item.source || "\u5f85\u786e\u8ba4"} · {copy.confidence}:{" "}
                        {formatConfidence(item.confidence)}
                      </span>
                    ) : null}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-[#787671]">
                      {copy.category}
                    </span>
                    <select
                      className="h-10 min-w-0 rounded-lg border border-[#c8c4be] px-2 text-xs font-semibold text-[#37352f] outline-none focus:border-2 focus:border-[#5645d4]"
                      onChange={(event) =>
                        updateIngredient(
                          item.id,
                          "category",
                          event.target.value as IngredientCategory,
                        )
                      }
                      value={item.category}
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-[#787671]">
                      {copy.amount}
                    </span>
                    <input
                      className="h-10 min-w-0 rounded-lg border border-[#c8c4be] px-2 text-xs outline-none focus:border-2 focus:border-[#5645d4]"
                      onChange={(event) =>
                        updateIngredient(item.id, "amount", event.target.value)
                      }
                      value={item.amount}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-[#787671]">
                      {copy.shelfLife}
                    </span>
                    <div className="relative">
                      <input
                        className="h-10 w-full min-w-0 rounded-lg border border-[#c8c4be] px-2 pr-6 text-xs outline-none focus:border-2 focus:border-[#5645d4]"
                        inputMode="decimal"
                        min="0"
                        onChange={(event) =>
                          updateIngredient(
                            item.id,
                            "shelfLife",
                            formatShelfLifeDays(event.target.value),
                          )
                        }
                        type="number"
                        value={readShelfLifeDays(item.shelfLife)}
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#787671]">
                        天
                      </span>
                    </div>
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-[#787671]">
                      {copy.stockStatus}
                    </span>
                    <select
                      className={`h-10 min-w-0 rounded-lg border border-[#c8c4be] px-2 text-xs font-semibold outline-none focus:border-2 focus:border-[#5645d4] ${statusMeta[item.status].className}`}
                      onChange={(event) =>
                        updateIngredient(
                          item.id,
                          "status",
                          event.target.value as IngredientStatus,
                        )
                      }
                      value={item.status}
                    >
                      {Object.entries(statusMeta).map(([value, meta]) => (
                        <option key={value} value={value}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-[#787671]">
                      {copy.storageZone}
                    </span>
                    <select
                      className="h-10 min-w-0 rounded-lg border border-[#c8c4be] px-2 text-xs font-semibold text-[#37352f] outline-none focus:border-2 focus:border-[#5645d4]"
                      onChange={(event) =>
                        updateIngredient(
                          item.id,
                          "zone",
                          event.target.value as IngredientZone,
                        )
                      }
                      value={item.zone}
                    >
                      <option value="fridge">{copy.fridgeZone}</option>
                      <option value="freeze">{copy.freezeZone}</option>
                    </select>
                  </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                  <button
                    className="h-10 rounded-lg bg-[#5645d4] text-xs font-medium text-white"
                    onClick={() => syncSingleIngredient(item)}
                    type="button"
                  >
                    {copy.syncItem}
                  </button>
                  <button
                    aria-label={`${copy.delete}${item.name}`}
                    className="h-10 rounded-lg border border-[#e5e3df] text-xs font-medium text-[#dd5b00]"
                    onClick={() => deleteIngredient(item.id)}
                    type="button"
                  >
                    {copy.delete}
                  </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-[#37352f]">
                {copy.emptyResults}
              </p>
              <button
                className="mt-4 h-10 rounded-lg bg-[#5645d4] px-4 text-sm font-medium text-white"
                onClick={addIngredientManually}
                type="button"
              >
                {copy.addFromEmpty}
              </button>
            </div>
          )}

          <div className="border-t border-[#ede9e4] bg-white p-3">
            <div className="mb-3 rounded-lg bg-[#f6f5f4] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#787671]">
                    {copy.confirmSummary}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#37352f]">
                    {hasInvalidRows ? copy.needReview : copy.readyToSync}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-semibold text-[#1a1a1a]">
                    {ingredients.length}
                  </p>
                  <p className="text-xs text-[#787671]">{copy.detected}</p>
                </div>
              </div>
            </div>
            <button
              className="h-11 w-full rounded-lg bg-[#5645d4] text-sm font-medium text-white disabled:bg-[#e5e3df] disabled:text-[#bbb8b1]"
              disabled={ingredients.length === 0 || stage === "recognizing"}
              onClick={confirmSync}
              type="button"
            >
              {copy.confirm}
            </button>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                className="h-10 rounded-lg border border-[#c8c4be] text-xs font-medium disabled:opacity-40"
                disabled={!previewUrl || stage === "recognizing"}
                onClick={() => startRecognition()}
                type="button"
              >
                {copy.retry}
              </button>
              <button
                className="h-10 rounded-lg border border-[#c8c4be] text-xs font-medium"
                onClick={resetPage}
                type="button"
              >
                {copy.reset}
              </button>
            </div>
          </div>
        </div>
      </section>

      <input
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        ref={cameraInputRef}
        type="file"
      />
      <input
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        ref={albumInputRef}
        type="file"
      />
    </main>
  );
}
