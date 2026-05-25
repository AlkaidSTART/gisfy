"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Wand2,
  Eraser,
  Info,
  Check,
  X,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import gsap from "gsap";

interface PromptEditorProps {
  value: string;
  onChange: (v: string) => void;
  style?: "pixel" | "flat" | "anime";
  onGenerate?: () => void;
}

export default function PromptEditor({
  value,
  onChange,
  style,
  onGenerate,
}: PromptEditorProps) {
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedText, setPolishedText] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionResult, setVisionResult] = useState<string | null>(null);
  const polishRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showDiff && polishRef.current) {
      gsap.fromTo(
        polishRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" },
      );
    }
  }, [showDiff]);

  const handleApplyPolish = async () => {
    if (!value || isPolishing) return;
    setIsPolishing(true);
    setPolishedText(null);
    setShowDiff(false);

    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: value, style, mode: "text" }),
      });
      const json = await res.json();
      if (json?.success && json.data?.polished) {
        setPolishedText(json.data.polished);
        setShowDiff(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  const acceptPolish = () => {
    if (polishedText) {
      onChange(polishedText);
      setPolishedText(null);
      setShowDiff(false);
    }
  };

  const rejectPolish = () => {
    setPolishedText(null);
    setShowDiff(false);
  };

  // Image upload + vision analysis
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        setReferenceImage(dataUri);
        setIsAnalyzing(true);
        setVisionResult(null);
        try {
          const formData = new FormData();
          formData.append("image", file);
          formData.append("prompt", value);
          const res = await fetch("/api/vision", {
            method: "POST",
            body: formData,
          });
          const json = await res.json();
          if (json?.success) {
            setVisionResult(json.data.analysis);
            onChange(json.data.contextPrompt);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [value, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleImageUpload(file);
    },
    [handleImageUpload],
  );

  const removeReference = () => {
    setReferenceImage(null);
    setVisionResult(null);
  };

  // Enter to generate, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value && onGenerate) onGenerate();
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative glass-panel rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm transition-all duration-500 group focus-within:shadow-md focus-within:bg-white/80 focus-within:ring-2 focus-within:ring-[#0EA5E9]/20">
        <div className="p-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述想生成的素材：如 穿蓝盔甲的像素骑士"
            className="w-full h-32 p-7 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium leading-relaxed resize-none scrollbar-hide text-md"
          />
        </div>

        {/* Reference Image Preview */}
        {referenceImage && (
          <div className="px-7 pb-3 flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
              <img
                src={referenceImage}
                alt="参考图"
                className="w-full h-full object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0EA5E9] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#0EA5E9]">
                    AI 正在分析参考图...
                  </span>
                </div>
              ) : visionResult ? (
                <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
                  {visionResult}
                </p>
              ) : null}
            </div>
            <button
              onClick={removeReference}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="h-14 px-5 border-t border-slate-200/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Upload reference image */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-xl hover:bg-[#0EA5E9]/5 text-slate-400 hover:text-[#0EA5E9] transition-all flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span className="text-[10px] font-bold hidden sm:inline">
                参考图
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload(f);
              }}
            />
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/50 text-[9px] font-bold text-slate-500 border border-slate-200/50 hidden sm:flex">
              <Info className="w-3 h-3" />
              Enter 发送
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                setPolishedText(null);
                setShowDiff(false);
                setReferenceImage(null);
                setVisionResult(null);
              }}
              className="h-8 px-2 gap-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-xs"
            >
              <Eraser className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={!value || isPolishing}
              onClick={handleApplyPolish}
              className={cn(
                "h-8 px-3 gap-2 rounded-lg border-dashed border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 font-bold text-xs transition-all shadow-sm bg-white/50",
                isPolishing && "animate-pulse",
              )}
            >
              <Sparkles
                className={cn(
                  "w-3 h-3 fill-[#0EA5E9]",
                  isPolishing && "animate-spin",
                )}
              />
              {isPolishing ? "润色中" : "智能润色"}
            </Button>
          </div>
        </div>
      </div>

      {/* Polish Result Panel */}
      {showDiff && polishedText && (
        <div ref={polishRef} className="overflow-hidden mt-1">
          <div className="glass-panel rounded-[1.25rem] bg-gradient-to-r from-[#0EA5E9]/5 to-purple-500/5 border border-[#0EA5E9]/20 p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center">
                <RefreshCw className="w-3 h-3 text-[#0EA5E9]" />
              </div>
              <span className="text-[11px] font-black text-[#0EA5E9] uppercase tracking-wider">
                AI 润色建议
              </span>
            </div>

            <div className="bg-white/80 rounded-xl p-3 border border-[#0EA5E9]/20 shadow-sm mb-3 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#0EA5E9] rounded-l-xl opacity-50"></div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium pl-1">
                {polishedText}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={rejectPolish}
                className="h-8 px-3 gap-1.5 rounded-lg text-slate-400 hover:text-red-500 font-bold text-[11px]"
              >
                <X className="w-3.5 h-3.5" />
                拒绝
              </Button>
              <Button
                size="sm"
                onClick={acceptPolish}
                className="h-8 px-4 gap-1.5 rounded-lg bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-bold text-[11px] shadow-sm"
              >
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                采用建议
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Suggestions */}
      <div className="flex items-center gap-3 px-4">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
          Suggestions:
        </span>
        {["赛博朋克", "地牢Boss", "魔法道具", "UI图标"].map((tag) => (
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
