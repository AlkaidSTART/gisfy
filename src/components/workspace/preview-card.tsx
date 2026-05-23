"use client";

import {
  Download,
  Maximize2,
  Share2,
  Layers,
  Sparkles,
  Command,
  Move,
  RotateCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface PreviewCardProps {
  isGenerating: boolean;
  lastResult?: {
    url: string;
    prompt: string;
    style: string;
  };
}

export default function PreviewCard({
  isGenerating,
  lastResult,
}: PreviewCardProps) {
  return (
    <div className="w-full h-full glass-panel rounded-[2.5rem] flex flex-col overflow-hidden relative border-white bg-white/40 shadow-2xl shadow-blue-500/5 min-h-[640px]">
      {/* 1. Header Toolbar */}
      <div className="h-16 border-b border-white/60 flex items-center justify-between px-8 bg-white/20 backdrop-blur-sm z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)] transition-colors duration-500",
                isGenerating
                  ? "bg-amber-500 animate-spin"
                  : lastResult
                    ? "bg-green-500 animate-pulse"
                    : "bg-gray-300",
              )}
            ></div>
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">
              {isGenerating
                ? "Processing..."
                : lastResult
                  ? "Live Preview"
                  : "Standby"}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300/50"></div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 leading-none">
                DIMENSIONS
              </span>
              <span className="text-[11px] font-black text-gray-900">
                1024 x 1024 PX
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 leading-none">
                FORMAT
              </span>
              <span className="text-[11px] font-black text-gray-900 uppercase">
                PNG-32 (Alpha)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50/50 border border-border/40 rounded-xl p-1 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
            >
              <Move className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-gray-900 bg-white shadow-sm transition-colors"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-4 w-px bg-gray-300/50 mx-1"></div>
          <Button
            variant="ghost"
            size="icon"
            disabled={!lastResult}
            className="h-10 w-10 rounded-xl bg-white border border-border/40 shadow-sm text-gray-600 hover:text-black hover:shadow-md transition-all disabled:opacity-30"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!lastResult}
            className="h-10 w-10 rounded-xl bg-white border border-border/40 shadow-sm text-gray-600 hover:text-black hover:shadow-md transition-all disabled:opacity-30"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 2. Main Canvas */}
      <div className="flex-1 w-full flex items-center justify-center p-12 relative overflow-hidden bg-[#F8FAFC]">
        {/* Transparent Checkerboard Pattern - Professional Style */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "conic-gradient(#000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent 100%)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-8">
            <div className="relative">
              {/* Spinning Ring */}
              <div className="w-32 h-32 rounded-full border-[3px] border-blue-100 animate-[spin_3s_linear_infinite]"></div>
              <div className="absolute inset-0 w-32 h-32 rounded-full border-[3px] border-transparent border-t-[#0EA5E9] animate-spin"></div>

              {/* Inner Sparkle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#0EA5E9] animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-black text-gray-900 tracking-tight">
                AI 正在注入灵魂
              </span>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Progress Tip */}
            <div className="px-6 py-2 rounded-full bg-white/80 border border-white shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                DashScope Engine v2.1
              </span>
            </div>
          </div>
        )}

        {/* Content Area */}
        {lastResult ? (
          <div className="relative z-0 group/img">
            <div className="absolute -inset-10 bg-[#0EA5E9]/5 blur-[100px] opacity-0 group-hover/img:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative z-10 w-full max-w-[1024px] aspect-square">
              <Image
                src={lastResult.url}
                alt={lastResult.prompt}
                fill
                className="max-w-full max-h-[500px] rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-700 object-contain"
                unoptimized
              />
            </div>

            {/* Download Button Overlay */}
            <div className="absolute bottom-6 right-6 z-20 opacity-0 group-hover/img:opacity-100 translate-y-2 group-hover/img:translate-y-0 transition-all duration-300">
              <Button className="rounded-2xl bg-black text-white px-6 py-6 shadow-2xl gap-3">
                <Download className="w-5 h-5" />
                下载 Alpha PNG
              </Button>
            </div>
          </div>
        ) : (
          !isGenerating && (
            <div className="flex flex-col items-center gap-6 opacity-20">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                <Layers className="w-12 h-12 text-gray-400" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Wait for input...
              </span>
            </div>
          )
        )}

        {/* Floating Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
        ></div>

        {/* Center Canvas Area */}
        <div className="relative z-10 w-full max-w-[512px] aspect-square flex items-center justify-center">
          {/* Border Glow for Canvas */}
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/80 to-white/20 border border-white shadow-2xl"></div>

          <div className="relative w-full h-full flex flex-col items-center justify-center gap-6 p-8">
            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center border border-dashed border-gray-200 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-8 h-8 text-gray-200" />
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-lg font-black text-gray-900 tracking-tight italic">
                READY TO RENDER
              </h3>
              <p className="text-xs font-medium text-gray-400 max-w-[200px] leading-relaxed">
                输入您的创意描述，点击
                <span className="text-black font-bold">“立即渲染”</span>{" "}
                开始构建您的梦幻素材。
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Asset Metadata Badge */}
        <div className="absolute bottom-8 right-8 z-30 p-4 rounded-2xl bg-black/90 text-white backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-2 min-w-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase text-gray-500">
              Export Ready
            </span>
            <div className="px-1.5 py-0.5 rounded-md bg-[#0EA5E9]/20 text-[#0EA5E9] text-[8px] font-black uppercase tracking-widest">
              PRO
            </div>
          </div>
          <Button className="h-9 w-full rounded-lg bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-bold text-[11px] gap-2 shadow-sm">
            <Download className="w-3.5 h-3.5" />
            下载 1024px PNG
          </Button>
          <Button
            variant="outline"
            className="h-9 w-full rounded-lg bg-transparent border-white/10 text-white hover:bg-white/5 font-bold text-[11px] gap-2"
          >
            <Layers className="w-3.5 h-3.5" />
            Spritesheets
          </Button>
        </div>

        {/* Floating Controls Tooltip */}
        <div className="absolute top-8 left-8 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-white shadow-sm backdrop-blur-md">
          <Command className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-900 tracking-tight">
            快捷键已启用: SPACE 预览 / R 重置
          </span>
        </div>
      </div>
    </div>
  );
}
