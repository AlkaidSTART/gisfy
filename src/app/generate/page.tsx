"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import StyleSelector from "@/components/workspace/style-selector";
import PromptEditor from "@/components/workspace/prompt-editor";
import ParamControls from "@/components/workspace/param-controls";
import PreviewCard from "@/components/workspace/preview-card";
import HistoryBar from "@/components/workspace/history-bar";
import { LayoutGrid, Zap, Sparkles, Box, Info, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { TaskStatus } from "@/types";

gsap.registerPlugin(useGSAP);

interface Asset {
  id: string;
  url: string;
  prompt: string;
  style: "pixel" | "flat" | "anime";
  type: "character" | "monster" | "scene" | "tile" | "item" | "ui" | "effect";
  size: number;
  timestamp: string;
}

export default function GeneratePage() {
  const container = useRef<HTMLDivElement>(null);

  const [activeStyle, setActiveStyle] = useState<"pixel" | "flat" | "anime">(
    "pixel",
  );
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState<TaskStatus | "idle">("idle");
  const [genProgress, setGenProgress] = useState(0);
  const [config, setConfig] = useState({
    transparent: true,
    resolution: 256,
    enhancement: true,
    seed: "",
    lockSeed: false,
    negativePrompt: "",
  });
  const [history, setHistory] = useState<Asset[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockedSeedRef = useRef<number | undefined>(undefined);

  const loadAssets = useCallback(async () => {
    try {
      const res = await fetch(
        "/api/assets?page=1&limit=20&sort=newest&userId=default",
        {
          cache: "no-store",
        },
      );
      const json = await res.json();
      if (!json?.success) return;
      const items: Asset[] = json.data.assets.map(
        (a: {
          id: string;
          cdnUrl: string;
          prompt: string;
          style: "pixel" | "flat" | "anime";
          type:
            | "character"
            | "monster"
            | "scene"
            | "tile"
            | "item"
            | "ui"
            | "effect";
          size: number;
          createdAt: string;
        }) => ({
          id: a.id,
          url: a.cdnUrl,
          prompt: a.prompt,
          style: a.style,
          type: a.type,
          size: a.size,
          timestamp: a.createdAt,
        }),
      );
      setHistory(items);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollTask = useCallback(
    (taskId: string) => {
      stopPolling();
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/generate/status?taskId=${taskId}`);
          const json = await res.json();
          if (!json?.success) return;

          const { status, progress, images } = json.data;
          setGenStatus(status);
          setGenProgress(progress);

          if (status === "completed" && images?.length) {
            stopPolling();
            setIsGenerating(false);
            await loadAssets();
          } else if (status === "failed") {
            stopPolling();
            setIsGenerating(false);
          }
        } catch {
          /* poll error, keep trying */
        }
      }, 1000);
    },
    [stopPolling, loadAssets],
  );

  const handleGenerate = useCallback(async () => {
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    setGenStatus("queued");
    setGenProgress(5);

    try {
      const currentSeed = config.lockSeed
        ? (lockedSeedRef.current ??
          (config.seed ? Number(config.seed) : Math.floor(Math.random() * 2_147_483_647)))
        : config.seed
          ? Number(config.seed)
          : undefined;
      if (config.lockSeed) {
        lockedSeedRef.current = currentSeed;
      } else {
        lockedSeedRef.current = undefined;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style: activeStyle,
          type: "character",
          size: config.resolution,
          count: 1,
          seed: currentSeed,
          negativePrompt: config.negativePrompt.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success)
        throw new Error(json?.error?.message || "生成失败");

      pollTask(json.data.taskId);
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      setGenStatus("failed");
    }
  }, [
    prompt,
    isGenerating,
    activeStyle,
    config.resolution,
    config.seed,
    config.lockSeed,
    config.negativePrompt,
    pollTask,
  ]);

  useEffect(() => {
    return stopPolling;
  }, [stopPolling]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadAssets();
    });
  }, [loadAssets]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(
        ".sidebar-item",
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
      )
        .fromTo(
          ".main-preview",
          { scale: 0.98, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 1 },
          "-=0.6",
        )
        .fromTo(
          ".history-section",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.4",
        );
    },
    { scope: container },
  );

  const lastResult = history[0];

  return (
    <div
      ref={container}
      className="w-full flex flex-col gap-8 pb-32 max-w-400 mx-auto min-h-screen px-4 md:px-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 pb-2">
        <div className="sidebar-item">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 rounded-md bg-[#0EA5E9]/10 text-[#0EA5E9] text-[10px] font-bold uppercase tracking-wider">
              Editor v3.0
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-xs text-gray-400 font-medium tracking-tight">
              Supabase Cloud
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-gray-900">
            创作实验室
          </h1>
        </div>
        <div className="sidebar-item flex items-center gap-3">
          <Link href="/showcase">
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-xl bg-white border-border/60 text-xs font-bold shadow-sm hover:shadow-md transition-all"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              探索图库
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-xl bg-white border border-border/60 h-10 w-10"
          >
            <Info className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="sidebar-item">
            <StyleSelector value={activeStyle} onChange={setActiveStyle} />
          </div>
          <div className="sidebar-item">
            <ParamControls value={config} onChange={setConfig} />
          </div>
          <div className="sidebar-item glass-panel p-6 rounded-3xl bg-black border-none text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0EA5E9] blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#0EA5E9] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#0EA5E9]">
                  Render Engine
                </span>
              </div>
              <h3 className="text-sm font-bold mb-1">升级专业计划</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                获取 4K 无损输出与 10x 渲染加速
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 xl:col-span-4 flex flex-col gap-8">
          <div className="main-preview">
            <PromptEditor
              value={prompt}
              onChange={setPrompt}
              style={activeStyle}
              onGenerate={handleGenerate}
            />
          </div>

          <div className="main-preview min-h-160 flex flex-col group">
            <div className="flex-1 relative">
              <PreviewCard
                isGenerating={isGenerating}
                status={genStatus}
                progress={genProgress}
                lastResult={
                  lastResult
                    ? {
                        url: lastResult.url,
                        prompt: lastResult.prompt,
                        style: lastResult.style,
                      }
                    : undefined
                }
              />

              {/* Generate Button */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                <div className="relative">
                  <div className="render-btn-glow absolute inset-0 bg-[#0EA5E9] blur-3xl rounded-full opacity-0 pointer-events-none" />
                  <Button
                    size="lg"
                    onClick={handleGenerate}
                    disabled={!prompt || isGenerating}
                    className="h-16 px-10 rounded-2xl bg-black hover:bg-black/90 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-lg shadow-2xl shadow-black/20 gap-4 group/btn overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <div className="flex items-center gap-3 relative z-10">
                      {isGenerating ? (
                        <RotateCw className="w-5 h-5 text-[#0EA5E9] animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-[#0EA5E9] fill-[#0EA5E9]" />
                      )}
                      {isGenerating ? "生成中..." : "立即生成素材"}
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black tracking-tighter relative z-10 border border-white/10">
                      ENTER
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="history-section pt-4">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-border/50 flex items-center justify-center shadow-sm">
                  <Box className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    会话资产集
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium">
                    最近生成 · {history.length} 项
                  </p>
                </div>
              </div>
              <Link
                href="/showcase"
                className="text-xs font-bold text-[#0EA5E9] hover:underline"
              >
                查看全部记录
              </Link>
            </div>
            <HistoryBar items={history} />
          </div>
        </div>
      </section>
    </div>
  );
}
