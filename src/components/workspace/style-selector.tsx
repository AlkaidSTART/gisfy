"use client";
import { Grid, Palette, Box } from "lucide-react";
import { cn } from "@/components/ui/button";

const STYLES = [
  { id: "pixel", name: "像素复古", icon: Grid, desc: "16bit/32bit" },
  { id: "flat", name: "扁平极简", icon: Box, desc: "矢量插画" },
  { id: "anime", name: "赛璐璐", icon: Palette, desc: "动漫日写" }
];

export default function StyleSelector() {
  // Hardcoded active state for display purposes
  const activeId = "pixel";

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">视觉风格</h2>
        <span className="text-xs text-[#0EA5E9] font-medium bg-[#0EA5E9]/10 px-2 py-0.5 rounded-full">主色调提取</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {STYLES.map((style) => {
          const isActive = style.id === activeId;
          const Icon = style.icon;
          
          return (
            <button
              key={style.id}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200",
                isActive 
                  ? "bg-white border-[#0EA5E9] shadow-sm ring-1 ring-[#0EA5E9]/20" 
                  : "bg-[var(--color-background)] border-[var(--color-border)] hover:border-gray-300 hover:bg-white"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-2",
                isActive ? "bg-[#0EA5E9]/10" : "bg-gray-100"
              )}>
                <Icon className={cn("w-4 h-4", isActive ? "text-[#0EA5E9]" : "text-gray-500")} />
              </div>
              <span className={cn("text-xs font-medium", isActive ? "text-gray-900" : "text-gray-600")}>
                {style.name}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 transform scale-90">{style.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}