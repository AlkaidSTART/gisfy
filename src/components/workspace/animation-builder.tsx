"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANIMATION_TEMPLATES, DIRECTION_LABELS } from "@/lib/animation-templates";
import type { AnimationTemplate, Style, TaskStatus } from "@/types";

interface AnimationBuilderProps {
  prompt: string;
  style: Style;
  seed?: number;
  negativePrompt?: string;
  onSequenceCreated?: (tasks: Array<{
    taskId: string;
    frame: number;
    direction: number;
    directionLabel: string;
    prompt: string;
  }>) => void;
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

export default function AnimationBuilder({
  prompt,
  style,
  seed,
  negativePrompt,
  onSequenceCreated,
}: AnimationBuilderProps) {
  const [template, setTemplate] = useState<AnimationTemplate>("walk");
  const [direction, setDirection] = useState<2 | 4>(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tasks, setTasks] = useState<SequenceTask[]>([]);
  const [taskProgress, setTaskProgress] = useState<Record<string, SequenceProgress>>({});
  const [sequenceError, setSequenceError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
            const res = await fetch(`/api/generate/status?taskId=${task.taskId}`);
            const json = await res.json();
            if (!res.ok || !json?.success) {
              return [task.taskId, { status: "failed", progress: 0 } as SequenceProgress] as const;
            }
            return [
              task.taskId,
              {
                status: json.data.status as TaskStatus,
                progress: Number(json.data.progress) || 0,
              } as SequenceProgress,
            ] as const;
          } catch {
            return [task.taskId, { status: "failed", progress: 0 } as SequenceProgress] as const;
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

      const allDone = updates.every(([, p]) => p.status === "completed" || p.status === "failed");
      if (allDone) {
        stopPolling();
        setIsGenerating(false);
      }
    }, 1200);

    return stopPolling;
  }, [tasks]);

  useEffect(() => stopPolling, []);

  const handleCreateSequence = async () => {
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    setSequenceError(null);
    setTaskProgress({});

    try {
      const res = await fetch("/api/generate/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style,
          size: 256,
          template,
          direction,
          seed,
          negativePrompt,
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
      setSequenceError(error instanceof Error ? error.message : "sequence 生成失败");
    }
  };

  return (
    <div className="glass-panel rounded-[2rem] bg-white/60 border border-white p-4 md:p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#0EA5E9]" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-700">Animation Builder</p>
          <p className="text-[10px] text-gray-400">模板化序列生成（同角色一致 + 实时进度）</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {(Object.keys(ANIMATION_TEMPLATES) as AnimationTemplate[]).map((key) => {
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
              <p className={`mt-2 text-[10px] ${active ? "text-white/70" : "text-gray-400"}`}>
                {info.frames} 帧 · {info.direction} 方向
              </p>
            </button>
          );
        })}
      </div>

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {previewFrames.map((frame) => (
          <div key={frame} className="rounded-2xl border border-border/40 bg-white p-3">
            <div className="h-20 rounded-xl bg-linear-to-br from-gray-50 to-gray-100 border border-dashed border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-400">
              帧 {frame}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/50 bg-white p-3">
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-600 mb-2">
          <span>{summary.label}</span>
          <span>
            {summary.total > 0 ? `${summary.done}/${summary.total} · ${summary.progress}%` : "0%"}
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-[#0EA5E9] transition-all duration-300"
            style={{ width: `${summary.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleCreateSequence}
          disabled={!prompt || isGenerating}
          className="h-10 rounded-xl text-xs font-bold gap-2"
        >
          {isGenerating ? "生成中..." : "生成动画序列"}
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
        <span className="text-[11px] text-gray-500">
          {sequenceError ? `失败：${sequenceError}` : summary.total > 0 ? `${summary.total} 个任务已创建` : "尚未生成"}
        </span>
      </div>
    </div>
  );
}
