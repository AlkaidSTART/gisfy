"use client";

import {
  Image as ImageIcon,
  Plus,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";

import Image from "next/image";

interface HistoryBarProps {
  items: Array<{
    id: string;
    url: string;
    style: string;
    prompt: string;
  }>;
}

export default function HistoryBar({ items }: HistoryBarProps) {
  return (
    <div className="relative group">
      {/* Ambient glow behind history */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 bg-[#0EA5E9]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

      <div className="flex items-center gap-5 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x px-2">
        {/* Slot 0: Empty/CTA */}
        <div className="snap-start shrink-0 w-32 h-32 rounded-[2rem] glass-panel bg-white/60 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#0EA5E9] hover:bg-white transition-all cursor-pointer group/card">
          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover/card:scale-110 group-hover/card:bg-blue-50 transition-all">
            <Plus className="w-5 h-5 text-gray-300 group-hover/card:text-[#0EA5E9]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            New Canvas
          </span>
        </div>

        {/* History Slots */}
        {items.map((item) => (
          <div
            key={item.id}
            className="snap-start shrink-0 w-32 h-32 rounded-[2rem] glass-panel bg-white border-white/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer relative group/item overflow-hidden"
          >
            {/* Thumbnail placeholder */}
            <div className="absolute inset-0 bg-[#F1F5F9] flex items-center justify-center">
              {item.url ? (
                <Image
                  src={item.url}
                  alt={item.prompt}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-blue-200/60" />
                </div>
              )}
            </div>

            {/* Hover Toolbar */}
            <div className="absolute inset-x-0 bottom-0 p-2 bg-black/80 backdrop-blur-md translate-y-full group-hover/item:translate-y-0 transition-transform duration-300 flex items-center justify-between">
              <span className="text-[8px] font-bold text-white uppercase ml-1 block max-w-[80px] truncate">
                {item.prompt || "无名素材"}
              </span>
              <button className="p-1 rounded-md bg-white/10 text-white hover:bg-white/20">
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </div>

            {/* Style Badge */}
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-black/5 text-[8px] font-black tracking-tighter uppercase">
              {item.style}
            </div>
          </div>
        ))}

        {/* Placeholder slots to keep the visual balance if history is short */}
        {items.length < 5 &&
          Array.from({ length: 5 - items.length }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="snap-start shrink-0 w-32 h-32 rounded-[2rem] border border-dashed border-gray-100/50 bg-gray-50/10 flex items-center justify-center opacity-50"
            >
              <ImageIcon className="w-6 h-6 text-gray-100" />
            </div>
          ))}

        {/* View All Button */}
        <div className="snap-start shrink-0 h-32 flex flex-col items-center justify-center px-8 border-l border-border/40 ml-4 h-full">
          <button className="w-12 h-12 rounded-full border border-border/40 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all group/all">
            <ArrowRight className="w-5 h-5 group-hover/all:translate-x-1 transition-transform" />
          </button>
          <span className="text-[9px] font-black uppercase tracking-widest mt-4 text-gray-400">
            View History
          </span>
        </div>
      </div>
    </div>
  );
}
