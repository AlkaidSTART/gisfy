"use client";
import {
  Download,
  Maximize2,
  Share2,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PreviewCard() {
  // Showing a ready state for visual design purposes.
  // We simulate a checkered background indicating transparency.
  return (
    <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative">
      {/* Toolbar / Header */}
      <div className="h-12 border-b border-(--color-border) flex items-center justify-between px-4 bg-white/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-xs font-medium text-gray-700">生成就绪</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-gray-600"
          >
            <Layers className="w-3.5 h-3.5" />
            生成精灵图
          </Button>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-600"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-600"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs ml-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            导出
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 w-full flex items-center justify-center p-8 relative overflow-hidden bg-(--color-background)">
        {/* Transparent Checkerboard Pattern */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-multiply"
          style={{
            backgroundImage:
              "conic-gradient(#E4E4E7 25%, transparent 25%, transparent 50%, #E4E4E7 50%, #E4E4E7 75%, transparent 75%, transparent 100%)",
            backgroundSize: "16px 16px",
          }}
        ></div>

        {/* Mock Asset Image */}
        <div className="z-10 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-4 transition-transform hover:scale-105 duration-300 border border-white">
          <div className="w-64 h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-3 bg-(--color-card) relative overflow-hidden">
            {/* Simple subtle highlight effect in empty state */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0EA5E9]/5 rounded-full blur-2xl font-light translate-x-1/2 -translate-y-1/2" />

            <CheckCircle2 className="w-10 h-10 text-gray-300" />
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-medium text-gray-500">预览区为空</p>
              <p className="text-xs text-gray-400">点击“立即生成”创建资产</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
