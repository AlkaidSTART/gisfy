"use client";

import { Settings2, Layers, Monitor, Info } from "lucide-react";

export default function ParamControls() {
  return (
    <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-6 shadow-sm border-white bg-white/60">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">
            输出配置
          </h2>
          <span className="text-sm font-bold text-gray-900 mt-1">
            Render Engine
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white border border-border/40 flex items-center justify-center shadow-sm">
          <Settings2 className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Background Mode */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#0EA5E9]" />
              通道处理
            </label>
            <span className="text-[10px] font-medium text-[#0EA5E9] bg-blue-50 px-1.5 py-0.5 rounded">
              Alpha Mask
            </span>
          </div>
          <div className="p-1.5 bg-gray-50/50 border border-border/40 rounded-2xl grid grid-cols-2 gap-1">
            <button className="py-2.5 rounded-xl bg-white shadow-sm border border-border/20 text-[11px] font-bold text-gray-900">
              透明背景 (PNG)
            </button>
            <button className="py-2.5 rounded-xl text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors">
              保留北京 (JPG)
            </button>
          </div>
        </div>

        {/* Dimension Control */}
        <div className="space-y-5 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
              <Monitor className="w-3 h-3 text-[#0EA5E9]" />
              解析度
            </label>
            <span className="text-[11px] font-mono font-bold text-gray-900">
              1024<span className="text-gray-300 mx-1">x</span>1024
            </span>
          </div>

          <div className="px-1">
            <div className="relative w-full h-1.5 bg-gray-100 rounded-full">
              <div className="absolute left-0 top-0 h-full bg-black w-[40%] rounded-full"></div>
              <div className="absolute left-[40%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-[3px] border-black rounded-full shadow-lg cursor-pointer"></div>
            </div>
            <div className="flex justify-between text-[9px] font-bold text-gray-300 mt-3 uppercase tracking-tighter">
              <span>Standard</span>
              <span>HD+</span>
              <span>4K Ultra</span>
            </div>
          </div>
        </div>

        {/* Extra Params */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-900">
              高级细节增强
            </span>
            <span className="text-[9px] text-gray-400 font-medium">
              Auto Enhancement v2
            </span>
          </div>
          <div className="w-9 h-5 bg-[#0EA5E9] rounded-full relative p-0.5 shadow-inner">
            <div className="absolute right-0.5 top-0.5 bottom-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>

      <div className="mt-2 p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[10px] leading-relaxed text-blue-700 font-medium">
          当前分辨率将影响渲染耗时。导出高清格式建议在预览满意后再执行。
        </p>
      </div>
    </div>
  );
}
