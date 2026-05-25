"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  Upload,
  Image as ImageIcon,
  ScanEye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ANIMATION_TEMPLATES,
  DIRECTION_LABELS,
} from "@/lib/animation-templates";
import type { AnimationTemplate, Style, TaskStatus } from "@/types";
import Image from "next/image";

interface AnimationBuilderProps {
  prompt: string;
  style: Style;
  userId?: string;
  seed?: number;
  negativePrompt?: string;
  referenceImage?: string | null;
  onReferenceImageChange?: (image: string | null) => void;
  onSequenceCreated?: (
    tasks: Array<{
      taskId: string;
      frame: number;
      direction: number;
      directionLabel: string;
      prompt: string;
    }>,
  ) => void;
  onFrameGenerated?: (frame: {
    id: string;
    url: string;
    prompt: string;
    style: Style;
    type: "character" | "monster" | "scene" | "tile" | "item" | "ui" | "effect";
    size: number;
  }) => void;
  onSequenceFinished?: () => void;
}

type SequenceTask = {
  taskId: string;
  frame: number;
  direction: number;
  directionLabel: string;
  prompt: string;
};

type SequenceProgress = {
  status: TaskStatus;
  progress: number;
};

type FrameImage = {
  frame: number;
  direction: number;
  url: string;
};

export default function AnimationBuilder({
  prompt: externalPrompt,
  style,
  userId,
  seed: externalSeed,
  negativePrompt: externalNegativePrompt,
  referenceImage,
  onReferenceImageChange,
  onSequenceCreated,
  onFrameGenerated,
  onSequenceFinished,
}: AnimationBuilderProps) {
  const [template, setTemplate] = useState<AnimationTemplate>("walk");
  const [direction, setDirection] = useState<2 | 4>(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tasks, setTasks] = useState<SequenceTask[]>([]);
  const [taskProgress, setTaskProgress] = useState<
    Record<string, SequenceProgress>
  >({});
  const [sequenceError, setSequenceError] = useState<string | null>(null);
  const [frameImages, setFrameImages] = useState<FrameImage[]>([]);
  const [visionPrompt, setVisionPrompt] = useState<string | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emittedTaskIdsRef = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectivePrompt = visionPrompt || externalPrompt;

  const templateInfo = ANIMATION_TEMPLATES[template];
  const previewDirections = DIRECTION_LABELS[direction];

  const previewFrames = useMemo(
    () => Array.from({ length: templateInfo.frames }, (_, i) => i + 1),
    [templateInfo.frames],
  );

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const summary = useMemo(() => {
    if (tasks.length === 0) {
      return { done: 0, failed: 0, total: 0, progress: 0, label: "尚未生成" };
    }

    let totalProgress = 0;
    let done = 0;
    let failed = 0;
    for (const task of tasks) {
      const state = taskProgress[task.taskId];
      const p = state?.progress ?? 0;
      totalProgress += p;
      if (state?.status === "completed") done += 1;
      if (state?.status === "failed") failed += 1;
    }
    const progress = Math.round(totalProgress / tasks.length);
    const label =
      done === tasks.length
        ? "全部完成"
        : failed > 0
          ? `进行中（${failed} 失败）`
          : "生成中";

    return { done, failed, total: tasks.length, progress, label };
  }, [tasks, taskProgress]);

  useEffect(() => {
    if (tasks.length === 0) {
      stopPolling();
      return;
    }

    stopPolling();
    pollingRef.current = setInterval(async () => {
      const updates = await Promise.all(
        tasks.map(async (task) => {
          try {
            const res = await fetch(
              `/api/generate/status?taskId=${task.taskId}`,
            );
            const json = await res.json();
            if (!res.ok || !json?.success) {
              return [
                task.taskId,
                { status: "failed", progress: 0 } as SequenceProgress,
                null,
                task,
              ] as const;
            }
            const firstImage = Array.isArray(json.data.images)
              ? json.data.images[0]
              : null;
            return [
              task.taskId,
              {
                status: json.data.status as TaskStatus,
                progress: Number(json.data.progress) || 0,
              } as SequenceProgress,
              firstImage,
              task,
            ] as const;
          } catch {
            return [
              task.taskId,
              { status: "failed", progress: 0 } as SequenceProgress,
              null,
              task,
            ] as const;
          }
        }),
      );

      setTaskProgress((prev) => {
        const next = { ...prev };
        for (const [taskId, p] of updates) {
          next[taskId] = p;
        }
        return next;
      });

      for (const [taskId, p, firstImage, taskMeta] of updates) {
        if (p.status !== "completed" || !firstImage) continue;
        if (emittedTaskIdsRef.current.has(taskId)) continue;
        emittedTaskIdsRef.current.add(taskId);
        onFrameGenerated?.({
          id: firstImage.id,
          url: firstImage.url,
          prompt: firstImage.prompt,
          style: firstImage.style,
          type: firstImage.type,
          size: firstImage.size,
        });
        // Track frame image for cover display
        setFrameImages((prev) => {
          const exists = prev.some(
            (f) =>
              f.frame === taskMeta.frame && f.direction === taskMeta.direction,
          );
          if (exists) return prev;
          return [
            ...prev,
            {
              frame: taskMeta.frame,
              direction: taskMeta.direction,
              url: firstImage.url,
            },
          ];
        });
      }

      const allDone = updates.every(
        ([, p]) => p.status === "completed" || p.status === "failed",
      );
      if (allDone) {
        stopPolling();
        setIsGenerating(false);
        onSequenceFinished?.();
      }
    }, 1200);

    return stopPolling;
  }, [tasks, onFrameGenerated, onSequenceFinished]);

  useEffect(() => stopPolling, []);

  // ─── Image upload → Vision analysis ─────────────────────
  const handleImageUpload = async (file: File) => {
    setVisionError(null);
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || "视觉识别失败");
      }
      setVisionPrompt(json.data.analysis);
      // Convert file to base64 for reference display
      const reader = new FileReader();
      reader.onload = () => {
        onReferenceImageChange?.(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setVisionError(error instanceof Error ? error.message : "视觉识别失败");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveReference = () => {
    setVisionPrompt(null);
    setVisionError(null);
    onReferenceImageChange?.(null);
  };

  // ─── Sequence generation ────────────────────────────────
  const handleCreateSequence = async () => {
    if (!effectivePrompt || isGenerating) return;
    setIsGenerating(true);
    setSequenceError(null);
    setTaskProgress({});
    setFrameImages([]);
    emittedTaskIdsRef.current.clear();

    try {
      const res = await fetch("/api/generate/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          prompt: effectivePrompt,
          style,
          size: 256,
          template,
          direction,
          seed: externalSeed,
          negativePrompt: externalNegativePrompt,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || "sequence 生成失败");
      }
      setTasks(json.data.tasks);
      onSequenceCreated?.(json.data.tasks);
    } catch (error) {
      console.error(error);
      setTasks([]);
      setIsGenerating(false);
      setSequenceError(
        error instanceof Error ? error.message : "sequence 生成失败",
      );
    }
  };

  // ─── Frame cover lookup ─────────────────────────────────
  const getFrameImage = (frame: number, dirIndex: number): string | null => {
    const match = frameImages.find(
      (f) => f.frame === frame && f.direction === dirIndex + 1,
    );
    return match?.url ?? null;
  };

  return (
    <div className="glass-panel rounded-4xl bg-white/60 border border-white p-4 md:p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#0EA5E9]" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-700">
            Animation Builder
          </p>
          <p className="text-[10px] text-gray-400">
            上传参考图 → 视觉识别 → 批量生成动作帧
          </p>
        </div>
      </div>

      {/* ─── Reference Image Upload ─────────────────────── */}
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ScanEye className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-bold text-gray-600">
            参考图片（可选）
          </span>
        </div>

        {referenceImage ? (
          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-white">
            <Image
              src={referenceImage}
              alt="参考图"
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveReference}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50/30 transition-all"
          >
            {isAnalyzing ? (
              <>
                <ScanEye className="w-6 h-6 text-purple-500 animate-pulse" />
                <span className="text-xs font-medium text-purple-500">
                  视觉识别中...
                </span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">
                  点击上传参考图片，AI 自动识别并生成动作帧
                </span>
              </>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = "";
          }}
        />

        {visionPrompt && (
          <div className="rounded-xl bg-purple-50 border border-purple-200 p-3">
            <p className="text-[10px] font-bold text-purple-700 mb-1">
              AI 视觉识别结果
            </p>
            <p className="text-[11px] text-purple-900 leading-relaxed">
              {visionPrompt}
            </p>
          </div>
        )}
        {visionError && (
          <p className="text-[11px] text-red-500">{visionError}</p>
        )}
      </div>

      {/* ─── Template Picker ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {(Object.keys(ANIMATION_TEMPLATES) as AnimationTemplate[]).map(
          (key) => {
            const info = ANIMATION_TEMPLATES[key];
            const active = template === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTemplate(key)}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  active
                    ? "bg-black text-white border-black shadow-lg"
                    : "bg-white border-border/50 hover:border-[#0EA5E9]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold capitalize">{key}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </div>
                <p
                  className={`mt-2 text-[10px] ${active ? "text-white/70" : "text-gray-400"}`}
                >
                  {info.frames} 帧 · {info.direction} 方向
                </p>
              </button>
            );
          },
        )}
      </div>

      {/* ─── Direction Selector ─────────────────────────── */}
      <div className="flex items-center gap-2">
        {[2, 4].map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => setDirection(count as 2 | 4)}
            className={`h-9 px-4 rounded-xl text-xs font-bold border ${
              direction === count
                ? "bg-[#0EA5E9] text-white border-[#0EA5E9]"
                : "bg-white text-gray-600 border-border/50"
            }`}
          >
            {count} 方向
          </button>
        ))}
        <div className="text-[11px] text-gray-500 font-medium">
          {previewDirections.join(" / ")}
        </div>
      </div>

      {/* ─── Frame Preview Grid (covers use real images) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {previewDirections.map((dirLabel, dirIndex) =>
          previewFrames.map((frame) => {
            const imgUrl = getFrameImage(frame, dirIndex);
            return (
              <div
                key={`${dirLabel}-${frame}`}
                className="rounded-2xl border border-border/40 bg-white p-2"
              >
                <div className="h-20 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={`${dirLabel}方向 帧${frame}`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <ImageIcon className="w-5 h-5 text-gray-300" />
                      <span className="text-[9px] font-bold text-gray-400">
                        {dirLabel} · 帧{frame}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          }),
        )}
      </div>

      {/* ─── Progress Bar ───────────────────────────────── */}
      <div className="rounded-2xl border border-border/50 bg-white p-3">
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-600 mb-2">
          <span>{summary.label}</span>
          <span>
            {summary.total > 0
              ? `${summary.done}/${summary.total} · ${summary.progress}%`
              : "0%"}
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-[#0EA5E9] transition-all duration-300"
            style={{ width: `${summary.progress}%` }}
          />
        </div>
      </div>

      {/* ─── Action Buttons ─────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleCreateSequence}
          disabled={!effectivePrompt || isGenerating || isAnalyzing}
          className="h-10 rounded-xl text-xs font-bold gap-2"
        >
          {isGenerating
            ? "生成中..."
            : isAnalyzing
              ? "分析中..."
              : "生成动画序列"}
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
        <span className="text-[11px] text-gray-500">
          {sequenceError
            ? `失败：${sequenceError}`
            : summary.total > 0
              ? `${summary.total} 个任务已创建`
              : visionPrompt
                ? "已识别参考图，点击生成"
                : effectivePrompt
                  ? "就绪"
                  : "输入提示词或上传参考图"}
        </span>
      </div>
    </div>
  );
}
