"use client";

import { useState } from "react";
import { Sparkles, Wand2, Eraser, Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PromptEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [isPolishing, setIsPolishing] = useState(false);

  const handleApplyPolish = async () => {
    if (!value || isPolishing) return;
    setIsPolishing(true);
    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        body: JSON.stringify({ prompt: value, mode: "text" }),
      });
      const { data } = await res.json();
      if (data) onChange(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Container with focus-within shadow effect */}
      <div className="relative glass-panel rounded-[2rem] bg-white border-white shadow-xl shadow-blue-500/5 transition-all duration-500 group focus-within:shadow-2xl focus-within:shadow-blue-500/10 focus-within:ring-2 focus-within:ring-[#0EA5E9]/10">
        {/* Floating Tooltips or Badges */}
        <div className="absolute -top-3 left-8 flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-black text-white text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border border-white/20">
            <Wand2 className="w-3 h-3 text-[#0EA5E9]" />
            AI Studio Mode
          </div>
        </div>

        {/* Input Area */}
        <div className="p-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="描述您想生成的素材，例如：一个穿着蓝色盔甲的像素风骑士..."
            className="w-full h-32 p-7 bg-transparent border-none focus:ring-0 text-gray-800 placeholder:text-gray-300 font-medium leading-relaxed resize-none scrollbar-hide text-md"
          />
        </div>

        {/* Footer Actions */}
        <div className="h-16 px-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all">
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-gray-100"></div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-[10px] font-bold text-gray-500 border border-gray-100/50">
              <Info className="w-3 h-3" />
              支持中英文输入
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="h-9 px-3 gap-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-xs"
            >
              <Eraser className="w-3.5 h-3.5" />
              清空
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={!value || isPolishing}
              onClick={handleApplyPolish}
              className={cn(
                "h-10 px-5 gap-2.5 rounded-xl border-dashed border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/5 font-black text-xs transition-all shadow-sm",
                isPolishing && "animate-pulse",
              )}
            >
              <Sparkles
                className={cn(
                  "w-3.5 h-3.5 fill-[#0EA5E9]",
                  isPolishing && "animate-spin",
                )}
              />
              {isPolishing ? "AI 正在润色..." : "AI 智能润色"}
            </Button>
          </div>
        </div>
      </div>

      {/* Suggestions / Tags */}
      <div className="flex items-center gap-3 px-4">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
          Suggestions:
        </span>
        {["Cyberpunk", "Dungeon Boss", "Magical Item", "UI Icon"].map((tag) => (
          <button
            key={tag}
            onClick={() => onChange(value ? `${value}, ${tag}` : tag)}
            className="text-[10px] font-bold text-gray-500 hover:text-[#0EA5E9] transition-colors"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}
