"use client";

import { useRef } from "react";
import StyleSelector from "@/components/workspace/style-selector";
import PromptEditor from "@/components/workspace/prompt-editor";
import ParamControls from "@/components/workspace/param-controls";
import PreviewCard from "@/components/workspace/preview-card";
import HistoryBar from "@/components/workspace/history-bar";
import { LayoutGrid, Zap, Sparkles, Box, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function GeneratePage() {
  const container = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={container}
      className="w-full flex flex-col gap-8 pb-32 max-w-[1600px] mx-auto min-h-screen"
    >
      {/* 1. Header with Breadcrumbs & Breadcrumbs */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 pb-2">
        <div className="sidebar-item">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 rounded-md bg-[#0EA5E9]/10 text-[#0EA5E9] text-[10px] font-bold uppercase tracking-wider">
              Editor v2.4
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
            <span className="text-xs text-gray-400 font-medium tracking-tight">
              Cloud Render Active
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-gray-900">
            创作实验室
          </h1>
        </div>

        <div className="sidebar-item flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white bg-gray-100"
              ></div>
            ))}
            <div className="w-7 h-7 rounded-full border-2 border-white bg-black text-[8px] flex items-center justify-center text-white font-bold">
              +2k
            </div>
          </div>
          <Link href="/showcase">
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-xl bg-white border-border/60 text-xs font-bold shadow-sm hover:shadow-md transition-all"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              探索图库库
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

      {/* 2. Three Column Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-start">
        {/* Left Bar - Controls */}
        <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6 sticky top-24">
          <div className="sidebar-item">
            <StyleSelector />
          </div>
          <div className="sidebar-item">
            <ParamControls />
          </div>

          <div className="sidebar-item glass-panel p-6 rounded-3xl bg-black border-none text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0EA5E9] blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
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

        {/* Center - Main Editor */}
        <div className="lg:col-span-3 xl:col-span-4 flex flex-col gap-8">
          {/* Top Prompt Area */}
          <div className="main-preview">
            <PromptEditor />
          </div>

          {/* Main Visualizer */}
          <div className="main-preview min-h-[640px] flex flex-col group">
            <div className="flex-1 relative">
              <PreviewCard />

              {/* Floating Render Button - Luxury UX */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                <Button
                  size="lg"
                  className="h-16 px-10 rounded-2xl bg-black hover:bg-black/90 text-white font-bold text-lg shadow-2xl shadow-black/20 gap-4 group/btn overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <Sparkles className="w-5 h-5 text-[#0EA5E9] fill-[#0EA5E9]" />
                    立即执行生成
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black tracking-tighter relative z-10 border border-white/10">
                    ⌘ + ENTER
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom History - Visual Strip */}
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
                    Session ID: 49-X0D2
                  </p>
                </div>
              </div>
              <button className="text-xs font-bold text-[#0EA5E9] hover:underline transition-all ring-offset-4 rounded">
                查看全部记录
              </button>
            </div>
            <HistoryBar />
          </div>
        </div>
      </section>
    </div>
  );
}
