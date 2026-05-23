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

export default function PreviewCard() {
  return (
    <div className="w-full h-full glass-panel rounded-[2.5rem] flex flex-col overflow-hidden relative border-white bg-white/40 shadow-2xl shadow-blue-500/5 min-h-[640px]">
      {/* 1. Header Toolbar */}
      <div className="h-16 border-b border-white/60 flex items-center justify-between px-8 bg-white/20 backdrop-blur-sm z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse"></div>
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">
              Live Preview
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
            className="h-10 w-10 rounded-xl bg-white border border-border/40 shadow-sm text-gray-600 hover:text-black hover:shadow-md transition-all"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-white border border-border/40 shadow-sm text-gray-600 hover:text-black hover:shadow-md transition-all"
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
