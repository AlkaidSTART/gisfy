"use client";
import { Image as ImageIcon } from "lucide-react";

export default function HistoryBar() {
  // Empty history slots
  const slots = Array.from({ length: 6 });

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 snap-x px-1">
      {slots.map((_, i) => (
        <div 
          key={i} 
          className="snap-start shrink-0 w-24 h-24 rounded-xl glass-panel flex items-center justify-center text-gray-300 border-dashed hover:border-solid hover:border-gray-300 transition-all cursor-pointer group"
        >
          {i === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-[#0EA5E9] transition-colors" />
              <span className="text-[10px] text-gray-400">历史一</span>
            </div>
          ) : (
            <span className="w-2 h-2 rounded-full border border-gray-200"></span>
          )}
        </div>
      ))}
    </div>
  );
}