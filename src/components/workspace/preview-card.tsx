"use client";

import { useEffect, useRef } from "react";
import {
  Download,
  Maximize2,
  Share2,
  Sparkles,
  RotateCw,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

gsap.registerPlugin(useGSAP);

interface PreviewCardProps {
  isGenerating: boolean;
  status?:
    | "queued"
    | "processing"
    | "uploading"
    | "completed"
    | "failed"
    | "idle";
  progress?: number;
  lastResult?: {
    url: string;
    prompt: string;
    style: string;
  };
}

const statusLabels: Record<string, string> = {
  queued: "任务排队中...",
  processing: "AI 正在生成...",
  uploading: "上传至云端...",
  completed: "生成完成",
  failed: "生成失败",
};

export default function PreviewCard({
  isGenerating,
  status = "idle",
  progress = 0,
  lastResult,
}: PreviewCardProps) {
  const container = useRef<HTMLDivElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const particlesContainer = useRef<HTMLDivElement>(null);
  const imageContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressBar.current) {
      gsap.to(progressBar.current, {
        width: `${progress}%`,
        duration: 0.8,
        ease: "power2.out",
      });
    }
  }, [progress]);

  useEffect(() => {
    if (!isGenerating || !particlesContainer.current) return;
    const container = particlesContainer.current;
    const createParticle = () => {
      const particle = document.createElement("div");
      const size = Math.random() * 6 + 2;
      const x = Math.random() * 100;
      const colors = ["#0EA5E9", "#8B5CF6", "#EC4899", "#F59E0B"];
      particle.className = "absolute rounded-full";
      particle.style.cssText = `
        width: ${size}px; height: ${size}px; left: ${x}%; bottom: -10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]}; opacity: 0.6;
      `;
      container.appendChild(particle);
      gsap.to(particle, {
        y: -Math.random() * 400 - 50,
        x: (Math.random() - 0.5) * 100,
        opacity: 0,
        duration: 2 + Math.random() * 3,
        ease: "power1.out",
        onComplete: () => particle.remove(),
      });
    };
    const interval = setInterval(createParticle, 200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useGSAP(
    () => {
      if (status === "completed" && imageContainer.current) {
        gsap.fromTo(
          imageContainer.current,
          { scale: 0.9, opacity: 0, filter: "blur(10px)" },
          {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "expo.out",
          },
        );
      }
    },
    { scope: container, dependencies: [status] },
  );

  return (
    <div
      ref={container}
      className="w-full h-full glass-panel rounded-[2.5rem] flex flex-col overflow-hidden relative border-white bg-white/40 shadow-2xl shadow-blue-500/5 min-h-160"
    >
      <div
        ref={particlesContainer}
        className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
      />

      {/* Header */}
      <div className="h-16 border-b border-white/60 flex items-center justify-between px-8 bg-white/20 backdrop-blur-sm z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-500",
                isGenerating &&
                  "bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.6)]",
                status === "completed" &&
                  "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]",
                status === "failed" &&
                  "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]",
                !isGenerating && status === "idle" && "bg-gray-300",
              )}
            />
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">
              {isGenerating
                ? statusLabels[status] || "Processing..."
                : status === "completed"
                  ? "Live Preview"
                  : "Standby"}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300/50" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 leading-none">
              FORMAT
            </span>
            <span className="text-[11px] font-black text-gray-900 uppercase">
              PNG(A)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === "completed" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
              >
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
              >
                <Share2 className="w-4 h-4 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
              >
                <Download className="w-4 h-4 text-gray-400" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      {isGenerating && (
        <div className="h-1 bg-gray-100/50 z-20">
          <div
            ref={progressBar}
            className="h-full bg-linear-to-r from-[#0EA5E9] via-purple-500 to-pink-500 rounded-r-full"
            style={{ width: "0%" }}
          />
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        {/* Idle */}
        {!isGenerating && status === "idle" && !lastResult && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-400">等待创作</h3>
              <p className="text-xs text-gray-300 mt-1">
                输入描述后点击生成按钮
              </p>
            </div>
          </div>
        )}

        {/* Generating */}
        {isGenerating && (
          <div
            className="flex flex-col items-center gap-8"
            ref={imageContainer}
          >
            <div className="relative w-72 h-72">
              <div
                className="absolute inset-0 rounded-3xl bg-linear-to-r from-[#0EA5E9] via-purple-500 to-pink-500 animate-spin opacity-20 blur-xl"
                style={{ animationDuration: "3s" }}
              />
              <div className="absolute inset-4 rounded-2xl bg-linear-to-br from-white/80 to-gray-50/50 border border-white/60 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                <div className="relative">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="url(#grad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(progress / 100) * 176} 176`}
                      className="transition-all duration-700"
                    />
                    <defs>
                      <linearGradient
                        id="grad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#0EA5E9" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-[#0EA5E9]">
                    {progress}%
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-700">
                    {status === "queued" && "正在调度渲染引擎..."}
                    {status === "processing" && "AI 模型正在构思..."}
                    {status === "uploading" && "正在保存至云端..."}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {status === "queued" && "预计等待 2-5 秒"}
                    {status === "processing" &&
                      "请耐心等待，这可能需要 10-30 秒"}
                    {status === "uploading" && "正在上传至 Supabase Storage"}
                  </p>
                </div>
              </div>
            </div>

            {/* Step dots */}
            <div className="flex items-center gap-6">
              {["queued", "processing", "uploading", "completed"].map(
                (step, i) => {
                  const stepIdx = [
                    "queued",
                    "processing",
                    "uploading",
                    "completed",
                  ].indexOf(status);
                  const isDone = i < stepIdx;
                  const isCurrent = i === stepIdx;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-500",
                          isDone && "bg-green-400",
                          isCurrent && "bg-[#0EA5E9] animate-pulse scale-125",
                          !isDone && !isCurrent && "bg-gray-200",
                        )}
                      />
                      {i < 3 && (
                        <div
                          className={cn(
                            "w-8 h-px transition-all duration-500",
                            isDone ? "bg-green-400" : "bg-gray-200",
                          )}
                        />
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* Completed */}
        {status === "completed" && lastResult && (
          <div
            ref={imageContainer}
            className="relative w-full max-w-md aspect-square"
          >
            <div className="absolute -inset-4 bg-linear-to-r from-[#0EA5E9]/10 via-purple-500/10 to-pink-500/10 blur-2xl rounded-3xl" />
            <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/50 shadow-2xl">
              {lastResult.url ? (
                <Image
                  src={lastResult.url}
                  alt={lastResult.prompt}
                  fill
                  className="object-contain bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDIwIEwgMjAgMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIxIiAvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz48L3N2Zz4=')]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              透明背景 · 可直接导入引擎
            </div>
          </div>
        )}

        {/* Failed */}
        {status === "failed" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <RotateCw className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-sm font-bold text-gray-500">生成失败，请重试</p>
          </div>
        )}
      </div>
    </div>
  );
}
