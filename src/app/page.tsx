"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Layers, LayoutTemplate, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      ".hero-badge",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 }
    )
      .fromTo(
        ".hero-title-line",
        { y: 30, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.15 },
        "-=0.4"
      )
      .fromTo(
        ".hero-desc",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.5"
      )
      .fromTo(
        ".hero-actions",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.4"
      )
      .fromTo(
        ".visual-card",
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1 },
        "-=0.4"
      );
  }, { scope: container });

  return (
    <div ref={container} className="w-full flex-col flex items-center justify-center min-h-[80vh]">
      
      {/* Hero Section */}
      <section className="text-center w-full max-w-4xl mx-auto flex flex-col items-center pt-10 pb-20">
        <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-border/50 bg-white shadow-sm text-xs font-medium text-gray-600">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          生成引擎 V2.0 现已上线
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
          <div className="hero-title-line overflow-hidden">生成生产级别的</div>
          <div className="hero-title-line overflow-hidden">
            <span className="text-[#0EA5E9]">2D 游戏资产</span> 的新方式
          </div>
        </h1>
        
        <p className="hero-desc text-gray-500 text-lg md:text-xl max-w-2xl text-center mb-10">
          专为独立开发者与关卡设计师打造的材质生成管线。提供精准的形态控制、自动背景抠除以及与主流引擎无缝集成的打包流程。
        </p>
        
        <div className="hero-actions flex items-center justify-center gap-4">
          <Link href="/generate">
            <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-[#0EA5E9]/20 gap-2">
              进入工作台 <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Visuals / Bento Grid */}
      <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        
        <div className="visual-card glass-panel p-8 rounded-3xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[#0EA5E9]/10 text-[#0EA5E9] rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">极速参数生成</h3>
          <p className="text-sm text-gray-500">毫秒级响应框架，告别传统渲染流的冗长等待；原生支持批量材质构建与导出。</p>
        </div>

        <div className="visual-card glass-panel p-8 rounded-3xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-2xl flex items-center justify-center mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">即插即用格式</h3>
          <p className="text-sm text-gray-500">自动处理深度并滤除背景，提供多分辨率缩放，为您的引擎铺好每一片图层。</p>
        </div>

        <div className="visual-card glass-panel p-8 rounded-3xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-2xl flex items-center justify-center mb-4">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">无缝引擎整合</h3>
          <p className="text-sm text-gray-500">提供详细的接入文档，生成的资源严格符合 Unity、Godot 等现代底层渲染管线规范。</p>
        </div>

      </section>
    </div>
  );
}
