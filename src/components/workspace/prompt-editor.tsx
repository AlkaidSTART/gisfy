"use client";
import { AlignLeft, ImagePlus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PromptEditor() {
  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-gray-500" />
          画面描述
        </h2>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-gray-500">
          <RefreshCcw className="w-3 h-3" />
          示例
        </Button>
      </div>
      
      <div className="relative group">
        <textarea 
          placeholder="例如：一个生锈的铁剑，带有蓝色的魔法光芒，适合放在 RPG 游戏的装备栏中..."
          className="w-full h-32 p-3 text-sm bg-white/50 border border-[var(--color-border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[#0EA5E9]/50 transition-all resize-none placeholder:text-gray-400 text-gray-800"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button className="p-1.5 text-gray-400 hover:text-gray-700 bg-white rounded-md shadow-sm border border-gray-100 transition-colors">
            <ImagePlus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}