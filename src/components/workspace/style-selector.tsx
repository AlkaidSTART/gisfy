"use client";

import { Grid, Palette, Box, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STYLES = [
  {
    id: "pixel",
    name: "像素艺术",
    icon: Grid,
    desc: "Retro Pixel",
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
  },
  {
    id: "flat",
    name: "平面插画",
    icon: Box,
    desc: "Minimalist",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
  {
    id: "anime",
    name: "二次元",
    icon: Palette,
    desc: "Cel Shaded",
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50",
  },
] as const;

interface StyleSelectorProps {
  value: "pixel" | "flat" | "anime";
  onChange: (id: "pixel" | "flat" | "anime") => void;
}

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-6 shadow-sm border border-white/80 bg-white/60 backdrop-blur-xl">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
            视觉预设
          </h2>
          <span className="text-sm font-bold text-slate-900 mt-1">
            Render Styles
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#0EA5E9]" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {STYLES.map((style) => {
          const isActive = style.id === value;
          const Icon = style.icon;

          return (
            <button
              key={style.id}
              onClick={() => onChange(style.id)}
              className={cn(
                "group relative w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 overflow-hidden",
                isActive
                  ? "bg-white border-white shadow-lg shadow-blue-500/5 ring-1 ring-slate-200/50"
                  : "bg-transparent border-transparent hover:bg-white/50 hover:border-slate-200",
              )}
            >
              {/* Highlight bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0EA5E9]"></div>
              )}

              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  isActive
                    ? style.bg
                    : "bg-white/80 border border-slate-200 shadow-sm group-hover:scale-105",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-[#0EA5E9]" : "text-slate-400",
                  )}
                />
              </div>

              <div className="flex flex-col items-start flex-1 text-left">
                <span
                  className={cn(
                    "text-sm font-bold tracking-tight transition-colors",
                    isActive
                      ? "text-slate-900"
                      : "text-slate-500 group-hover:text-slate-900",
                  )}
                >
                  {style.name}
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                  {style.desc}
                </span>
              </div>

              {isActive && (
                <div className="w-5 h-5 rounded-full bg-[#0EA5E9] flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 text-white stroke-[4px]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
