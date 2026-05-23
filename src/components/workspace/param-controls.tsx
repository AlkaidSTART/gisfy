"use client";
import { Settings2 } from "lucide-react";

export default function ParamControls() {
  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-gray-500" />
          生成参数
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {/* Output Setting */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">背景处理</span>
            <span className="text-gray-400">自动抠图</span>
          </div>
          <div className="p-1 bg-(--color-secondary) border border-(--color-border) rounded-lg grid grid-cols-2 text-xs">
            <button className="py-1.5 rounded-md bg-white shadow-sm font-medium text-gray-900">
              透明背景 (PNG)
            </button>
            <button className="py-1.5 rounded-md text-gray-500 hover:text-gray-700 font-medium transition-colors">
              保留背景
            </button>
          </div>
        </div>

        {/* Size Setting */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600 font-medium">输出尺寸 (像素)</span>
            <span className="text-[#0EA5E9] font-mono">1024 x 1024</span>
          </div>
          <div className="relative w-full h-1.5 bg-gray-200 rounded-full mt-2">
            <div className="absolute left-0 top-0 h-full bg-[#0EA5E9] w-1/2 rounded-full"></div>
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-[#0EA5E9] rounded-full shadow-sm cursor-pointer"></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>512</span>
            <span>1024</span>
            <span>2048</span>
          </div>
        </div>
      </div>
    </div>
  );
}
