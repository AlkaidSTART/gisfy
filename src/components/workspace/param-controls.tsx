"use client";

import { Settings2, Layers, Monitor, Info, Dices, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

interface ParamControlsProps {
  value: {
    transparent: boolean;
    resolution: number;
    enhancement: boolean;
    seed: string;
    lockSeed: boolean;
    negativePrompt: string;
  };
  onChange: (val: {
    transparent: boolean;
    resolution: number;
    enhancement: boolean;
    seed: string;
    lockSeed: boolean;
    negativePrompt: string;
  }) => void;
}

export default function ParamControls({ value, onChange }: ParamControlsProps) {
  const randomizeSeed = () => {
    onChange({
      ...value,
      seed: String(Math.floor(Math.random() * 2_147_483_647)),
    });
  };

  return (
    <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-6 shadow-sm border border-white/80 bg-white/60 backdrop-blur-xl">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
            输出配置
          </h2>
          <span className="text-sm font-bold text-slate-900 mt-1">
            Render Engine
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <Settings2 className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Background Mode */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#0EA5E9]" />
              通道处理
            </label>
            <span className="text-[10px] font-medium text-[#0EA5E9] bg-blue-50 px-1.5 py-0.5 rounded">
              Alpha Mask
            </span>
          </div>
          <div className="p-1.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl grid grid-cols-2 gap-1">
            <button
              onClick={() => onChange({ ...value, transparent: true })}
              className={cn(
                "py-2.5 rounded-xl text-[11px] font-bold transition-all",
                value.transparent
                  ? "bg-white shadow-sm border border-slate-200/50 text-slate-900"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              透明背景 (PNG)
            </button>
            <button
              onClick={() => onChange({ ...value, transparent: false })}
              className={cn(
                "py-2.5 rounded-xl text-[11px] font-bold transition-all",
                !value.transparent
                  ? "bg-white shadow-sm border border-slate-200/50 text-slate-900"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              保留背景 (JPG)
            </button>
          </div>
        </div>

        {/* Dimension Control */}
        <div className="space-y-5 pt-2 border-t border-slate-200/50">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
              <Monitor className="w-3 h-3 text-[#0EA5E9]" />
              解析度
            </label>
            <span className="text-[11px] font-mono font-bold text-slate-900">
              {value.resolution}
              <span className="text-slate-300 mx-1">x</span>
              {value.resolution}
            </span>
          </div>

          <div className="px-1">
            <div
              className="relative w-full h-1.5 bg-slate-200 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const ratio = x / rect.width;
                let res = 1024;
                if (ratio < 0.33) res = 512;
                else if (ratio < 0.66) res = 1024;
                else res = 2048;
                onChange({ ...value, resolution: res });
              }}
            >
              <div
                className="absolute left-0 top-0 h-full bg-black rounded-full"
                style={{
                  width:
                    value.resolution === 512
                      ? "10%"
                      : value.resolution === 1024
                        ? "50%"
                        : "100%",
                }}
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-[3px] border-black rounded-full shadow-lg transition-all"
                style={{
                  left:
                    value.resolution === 512
                      ? "10%"
                      : value.resolution === 1024
                        ? "50%"
                        : "100%",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] font-bold text-gray-300 mt-3 uppercase tracking-tighter">
              <span className={cn(value.resolution === 512 && "text-gray-900")}>
                Standard
              </span>
              <span
                className={cn(value.resolution === 1024 && "text-gray-900")}
              >
                HD+
              </span>
              <span
                className={cn(value.resolution === 2048 && "text-gray-900")}
              >
                4K Ultra
              </span>
            </div>
          </div>
        </div>

        {/* Extra Params */}
        <div
          className="flex items-center justify-between pt-4 border-t border-border/40 cursor-pointer"
          onClick={() =>
            onChange({ ...value, enhancement: !value.enhancement })
          }
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-900">
              高级细节增强
            </span>
            <span className="text-[9px] text-gray-400 font-medium">
              Auto Enhancement v2
            </span>
          </div>
          <div
            className={cn(
              "w-9 h-5 rounded-full relative p-0.5 shadow-inner transition-colors",
              value.enhancement ? "bg-[#0EA5E9]" : "bg-gray-200",
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 bottom-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                value.enhancement ? "right-0.5" : "left-0.5",
              )}
            ></div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#0EA5E9]" />
              Seed
            </label>
            <button
              type="button"
              onClick={randomizeSeed}
              className="h-7 px-2 rounded-lg border border-border/50 bg-white text-[10px] font-bold text-gray-700 flex items-center gap-1 hover:bg-gray-50"
            >
              <Dices className="w-3 h-3" />
              随机
            </button>
          </div>
          <input
            value={value.seed}
            onChange={(e) =>
              onChange({
                ...value,
                seed: e.target.value.replace(/[^\d]/g, "").slice(0, 10),
              })
            }
            placeholder="留空=自动"
            className="w-full h-9 rounded-xl border border-border/50 bg-white px-3 text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#0EA5E9]/20"
          />
          <button
            type="button"
            onClick={() => onChange({ ...value, lockSeed: !value.lockSeed })}
            className={cn(
              "h-9 w-full rounded-xl text-xs font-bold transition-colors border",
              value.lockSeed
                ? "bg-[#0EA5E9] text-white border-[#0EA5E9]"
                : "bg-white text-gray-600 border-border/50 hover:bg-gray-50",
            )}
          >
            {value.lockSeed ? "已锁定 Seed" : "锁定 Seed"}
          </button>
        </div>

        <div className="space-y-3 pt-4 border-t border-border/40">
          <label className="text-[11px] font-bold text-gray-900">
            负面提示词
          </label>
          <textarea
            value={value.negativePrompt}
            onChange={(e) =>
              onChange({
                ...value,
                negativePrompt: e.target.value.slice(0, 300),
              })
            }
            placeholder="例如：模糊, 畸形手指, 多余肢体, 低质量, 水印"
            className="w-full min-h-16 rounded-xl border border-border/50 bg-white px-3 py-2 text-xs font-medium text-gray-900 outline-none resize-none focus:ring-2 focus:ring-[#0EA5E9]/20"
          />
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
