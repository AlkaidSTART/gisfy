"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import StyleSelector from "@/components/workspace/style-selector";
import PromptEditor from "@/components/workspace/prompt-editor";
import ParamControls from "@/components/workspace/param-controls";
import PreviewCard from "@/components/workspace/preview-card";
import SpritesheetBuilder from "@/components/workspace/spritesheet-builder";
import AnimationBuilder from "@/components/workspace/animation-builder";
import AssetsToolbar from "@/components/workspace/assets-toolbar";
import {
  LayoutGrid,
  Zap,
  Sparkles,
  Box,
  Info,
  RotateCw,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { saveAs } from "file-saver";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { TaskStatus } from "@/types";
import { createExportPackage } from "@/lib/export";
import { useAuth } from "@/lib/store/auth-store";

gsap.registerPlugin(useGSAP);
const FILTER_NOW_TS = Date.now();

interface Asset {
  id: string;
  url: string;
  prompt: string;
  style: "pixel" | "flat" | "anime";
  type: "character" | "monster" | "scene" | "tile" | "item" | "ui" | "effect";
  size: number;
  timestamp: string;
}

type FilterStyle = "all" | "pixel" | "flat" | "anime";
type FilterType =
  | "all"
  | "character"
  | "monster"
  | "scene"
  | "tile"
  | "item"
  | "ui"
  | "effect";
type FilterDate = "today" | "week" | "all";

export default function GeneratePage() {
  const container = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const userId = user?.id ?? "default";

  const [activeTab, setActiveTab] = useState<"assets" | "animation">("assets");
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
  const [filterStyle, setFilterStyle] = useState<FilterStyle>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterDate, setFilterDate] = useState<FilterDate>("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [sheetFormat, setSheetFormat] = useState<
    "texturepacker-array" | "aseprite" | "phaser" | "strip" | "grid"
  >("texturepacker-array");
  const [isBuildingSheet, setIsBuildingSheet] = useState(false);
  const [sheetResult, setSheetResult] = useState<{
    pngUrl: string;
    jsonUrl: string;
    frameCount: number;
    sheetSize: { w: number; h: number };
  } | null>(null);
  const [latestPreview, setLatestPreview] = useState<{
    url: string;
    prompt: string;
    style: "pixel" | "flat" | "anime";
  } | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockedSeedRef = useRef<number | undefined>(undefined);

  const loadAssets = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/assets?page=1&limit=20&sort=newest&userId=${encodeURIComponent(userId)}`,
        { cache: "no-store" },
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
  }, [userId]);

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
            const first = images[0];
            if (first?.url) {
              setLatestPreview({
                url: first.url,
                prompt: first.prompt,
                style: first.style,
              });
            }
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
          (config.seed
            ? Number(config.seed)
            : Math.floor(Math.random() * 2_147_483_647)))
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
          userId,
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
    userId,
    pollTask,
  ]);

  const handleBuildSpritesheet = useCallback(async () => {
    const assetIds = selectedAssetIds;
    if (assetIds.length === 0 || isBuildingSheet) return;
    setIsBuildingSheet(true);
    try {
      const res = await fetch("/api/spritesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          assetIds,
          format: sheetFormat,
          name: "spritesheet",
          padding: 1,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || "生成 spritesheet 失败");
      }
      setSheetResult(json.data);
    } catch (error) {
      console.error(error);
      setSheetResult(null);
    } finally {
      setIsBuildingSheet(false);
    }
  }, [selectedAssetIds, sheetFormat, isBuildingSheet, userId]);

  const toggleSelectAsset = useCallback((id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const handleExportPackage = useCallback(async () => {
    if (!sheetResult || selectedAssetIds.length === 0) return;
    const manifest = {
      name: "spritesheet",
      style: activeStyle,
      size: config.resolution,
      frameCount: sheetResult.frameCount,
      selectedAssetIds,
      generatedAt: new Date().toISOString(),
    };
    const spriteItems = history
      .filter((item) => selectedAssetIds.includes(item.id))
      .map((item, index) => ({
        filename: `sprite_${String(index + 1).padStart(2, "0")}_${item.id}.png`,
        url: item.url,
      }));

    try {
      const zipBlob = await createExportPackage({
        name: "spritesheet",
        spriteItems,
        spritesheet: {
          pngUrl: sheetResult.pngUrl,
          jsonUrl: sheetResult.jsonUrl,
        },
        manifest,
      });
      saveAs(zipBlob, "spritesheet.zip");
    } catch (error) {
      console.error(error);
    }
  }, [sheetResult, selectedAssetIds, activeStyle, config.resolution, history]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (filterStyle !== "all" && item.style !== filterStyle) return false;
      if (filterType !== "all" && item.type !== filterType) return false;
      if (
        filterSearch.trim() &&
        !item.prompt.toLowerCase().includes(filterSearch.trim().toLowerCase())
      ) {
        return false;
      }
      if (filterDate === "today") {
        return (
          FILTER_NOW_TS - new Date(item.timestamp).getTime() <=
          24 * 60 * 60 * 1000
        );
      }
      if (filterDate === "week") {
        return (
          FILTER_NOW_TS - new Date(item.timestamp).getTime() <=
          7 * 24 * 60 * 60 * 1000
        );
      }
      return true;
    });
  }, [history, filterStyle, filterType, filterSearch, filterDate]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedAssetIds.length === 0) return;
    await Promise.all(
      selectedAssetIds.map((id) =>
        fetch("/api/assets", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, userId }),
        }),
      ),
    );
    setSelectedAssetIds([]);
    await loadAssets();
  }, [selectedAssetIds, loadAssets, userId]);

  const handleExportSelected = useCallback(async () => {
    if (selectedAssetIds.length === 0) return;
    const selected = history.filter((item) =>
      selectedAssetIds.includes(item.id),
    );
    const zipBlob = await createExportPackage({
      name: "selected-assets",
      spriteItems: selected.map((item, index) => ({
        filename: `sprite_${String(index + 1).padStart(2, "0")}_${item.id}.png`,
        url: item.url,
      })),
      spritesheet: {
        pngUrl:
          sheetResult?.pngUrl ??
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2Z8VkAAAAASUVORK5CYII=",
        jsonUrl:
          sheetResult?.jsonUrl ??
          "data:application/json;base64,eyJmcmFtZXMiOltdLCJtZXRhIjp7fX0=",
      },
      manifest: {
        name: "selected-assets",
        count: selected.length,
        generatedAt: new Date().toISOString(),
      },
    });
    saveAs(zipBlob, "selected-assets.zip");
  }, [selectedAssetIds, history, sheetResult]);

  const handleSequenceFrameGenerated = useCallback(
    (frame: {
      id: string;
      url: string;
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
    }) => {
      setHistory((prev) => {
        if (prev.some((item) => item.id === frame.id)) return prev;
        return [
          {
            id: frame.id,
            url: frame.url,
            prompt: frame.prompt,
            style: frame.style,
            type: frame.type,
            size: frame.size,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ];
      });
      setLatestPreview({
        url: frame.url,
        prompt: frame.prompt,
        style: frame.style,
      });
    },
    [],
  );

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

  const lastResult =
    latestPreview ??
    (history[0]
      ? {
          url: history[0].url,
          prompt: history[0].prompt,
          style: history[0].style,
        }
      : undefined);

  return (
    <div
      ref={container}
      className="w-full flex flex-col pb-32 max-w-[1600px] mx-auto min-h-screen px-4 md:px-8 overflow-hidden bg-slate-50 text-slate-900 selection:bg-[#0EA5E9] selection:text-white"
    >
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0EA5E9]/10 via-slate-50 to-slate-50 opacity-100"></div>
        <div className="absolute w-[100vw] h-[100vh] bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <header className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-10 pb-6 border-b border-black/5 mb-8">
        <div className="sidebar-item">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2.5 py-0.5 rounded-lg bg-white/80 border border-black/5 text-[#0EA5E9] text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Editor v3.0
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-xs text-slate-500 font-medium tracking-tight">
              Supabase Cloud
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            创作实验室
          </h1>
        </div>
        <div className="sidebar-item flex items-center gap-3">
          <Link href="/showcase">
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-xl bg-white/60 border-white/80 text-sm font-bold shadow-sm hover:bg-white/80 transition-all text-slate-700"
            >
              <LayoutGrid className="w-4 h-4" />
              探索图库
            </Button>
          </Link>
        </div>
      </header>

      <section className="relative z-10 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Creation Control Hub */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="sidebar-item">
            <PromptEditor
              value={prompt}
              onChange={setPrompt}
              style={activeStyle}
              onGenerate={handleGenerate}
            />
          </div>
          <div className="sidebar-item w-full">
            <StyleSelector value={activeStyle} onChange={setActiveStyle} />
          </div>
          <div className="sidebar-item w-full">
            <ParamControls value={config} onChange={setConfig} />
          </div>

          <div className="sidebar-item bg-white/60 border border-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0EA5E9] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                  <Zap className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-900">
                  Render Engine
                </span>
              </div>
              <h3 className="text-sm font-bold mb-1 text-slate-800">
                升级专业计划
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                获取 4K 无损输出与 10x 渲染加速体验
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Main Canvas & Outputs */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          <div className="main-preview relative w-full min-h-[500px] flex flex-col bg-white/60 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-6 lg:p-8">
            <div className="flex-1 relative flex items-center justify-center">
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

              {/* Generate Button centrally positioned at the bottom of the canvas */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4">
                <div className="relative w-full">
                  <div className="render-btn-glow absolute inset-0 bg-[#0EA5E9] blur-2xl rounded-full opacity-5 pointer-events-none" />
                  <Button
                    size="lg"
                    onClick={handleGenerate}
                    disabled={!prompt || isGenerating}
                    className="w-full h-16 rounded-2xl bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-lg shadow-xl shadow-slate-500/20 gap-4 group/btn overflow-hidden relative transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      {isGenerating ? (
                        <RotateCw className="w-5 h-5 text-[#0EA5E9] animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-[#0EA5E9] fill-[#0EA5E9]" />
                      )}
                      {isGenerating ? "生成中..." : "立即生成素材"}
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation for Extended Features */}
          <div className="history-section mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl w-fit mx-auto md:mx-0 border border-border/50 shadow-sm">
              <button
                onClick={() => setActiveTab("assets")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === "assets"
                    ? "bg-white text-gray-900 shadow-sm border border-black/5"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Box className="w-4 h-4" /> 资产管理与图集
              </button>
              <button
                onClick={() => setActiveTab("animation")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === "animation"
                    ? "bg-white text-purple-600 shadow-sm border border-purple-500/10"
                    : "text-gray-500 hover:text-purple-600"
                }`}
              >
                <Layers className="w-4 h-4" /> 动效序列预设
              </button>
            </div>

            {/* Tab Contents */}
            <div className="w-full relative">
              {activeTab === "assets" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 glass-panel p-6 rounded-3xl border border-border/50 bg-white/50 backdrop-blur-xl shadow-sm">
                  <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center">
                        <Box className="w-5 h-5 text-[#0EA5E9]" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          会话资产总览
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          最近生成 · {history.length} 项资产
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/showcase"
                      className="text-xs font-bold text-gray-500 hover:text-[#0EA5E9] underline underline-offset-4 decoration-border/50 hover:decoration-[#0EA5E9]/50 transition-colors"
                    >
                      查看所有历史
                    </Link>
                  </div>

                  <div className="mb-6">
                    <AssetsToolbar
                      style={filterStyle}
                      type={filterType}
                      dateRange={filterDate}
                      search={filterSearch}
                      selectedCount={selectedAssetIds.length}
                      onStyleChange={setFilterStyle}
                      onTypeChange={setFilterType}
                      onDateRangeChange={setFilterDate}
                      onSearchChange={setFilterSearch}
                      onDeleteSelected={handleDeleteSelected}
                      onExportSelected={handleExportSelected}
                    />
                  </div>

                  <SpritesheetBuilder
                    items={filteredHistory}
                    selectedIds={selectedAssetIds}
                    onToggleSelect={toggleSelectAsset}
                    format={sheetFormat}
                    onFormatChange={setSheetFormat}
                    isBuilding={isBuildingSheet}
                    onBuild={handleBuildSpritesheet}
                    result={sheetResult}
                    onExportZip={handleExportPackage}
                  />
                </div>
              )}

              {activeTab === "animation" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 glass-panel p-6 rounded-3xl border border-border/50 bg-white/50 backdrop-blur-xl shadow-sm">
                  <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        动作序列预设
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        基于当前配置与提示词，批量生成多方向的关键帧动画
                      </p>
                    </div>
                  </div>

                  <AnimationBuilder
                    userId={userId}
                    prompt={prompt}
                    style={activeStyle}
                    seed={config.seed ? Number(config.seed) : undefined}
                    negativePrompt={config.negativePrompt}
                    onFrameGenerated={handleSequenceFrameGenerated}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
