"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  LayoutTemplate,
  Zap,
  Sparkles,
  Package,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store/auth-store";
import LoginModal from "@/components/auth/login-modal";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // 首页加载后，未登录用户延迟弹出登录弹窗
  useEffect(() => {
    if (loading) return;
    if (!user) {
      const t = setTimeout(() => setShowLogin(true), 1500);
      return () => clearTimeout(t);
    }
  }, [user, loading]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-badge",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
      )
        .fromTo(
          ".hero-title-line",
          { y: 30, opacity: 0, filter: "blur(8px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: 0.15,
          },
          "-=0.4",
        )
        .fromTo(
          ".hero-desc",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.5",
        )
        .fromTo(
          ".hero-actions",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.4",
        )
        .fromTo(
          ".visual-card",
          { y: 40, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1 },
          "-=0.4",
        );
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="relative w-full flex-col flex items-center justify-center min-h-[80vh] px-4 md:px-8 overflow-hidden bg-slate-50 text-slate-900 selection:bg-[#0EA5E9] selection:text-white"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0EA5E9]/10 via-slate-50 to-slate-50 opacity-100"></div>
        <div className="absolute w-[100vw] h-[100vh] bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 text-center w-full max-w-5xl mx-auto flex flex-col items-center pt-20 pb-24">
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-black/5 bg-white/60 backdrop-blur-md shadow-sm text-xs font-semibold text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0EA5E9] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0EA5E9]"></span>
          </span>
          生成引擎 V2.0 现已上线
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[1.1]">
          <div className="hero-title-line overflow-hidden">生成生产级别的</div>
          <div className="hero-title-line overflow-hidden pb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#6366F1] drop-shadow-[0_0_40px_rgba(14,165,233,0.2)]">
              2D 游戏资产
            </span>{" "}
            的新方式
          </div>
        </h1>

        <p className="hero-desc text-slate-600 text-lg md:text-xl max-w-2xl text-center mb-12 font-medium leading-relaxed">
          专为独立开发者与关卡设计师打造的材质生成管线。提供精准的形态控制、自动背景抠除以及与主流引擎无缝集成的打包流程。
        </p>

        <div className="hero-actions flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link href="/generate">
            <Button
              size="lg"
              className="h-14 px-8 rounded-2xl bg-black text-white hover:bg-slate-800 hover:scale-105 transition-all text-base font-bold shadow-[0_0_40px_rgba(0,0,0,0.1)] gap-2 group"
            >
              <Zap className="w-5 h-5 group-hover:text-[#0EA5E9] transition-colors" />
              进入工作台
            </Button>
          </Link>
          <Link href="/showcase">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 rounded-2xl border-black/10 bg-white/40 hover:bg-white/60 text-slate-900 backdrop-blur-md shadow-sm transition-all text-base font-bold gap-2"
            >
              浏览素材库 <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Visuals / Bento Grid */}
      <section className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="visual-card bg-white/60 border border-white/80 backdrop-blur-xl p-8 rounded-[32px] flex flex-col items-start hover:bg-white/80 shadow-xl shadow-slate-200/50 transition-colors group relative overflow-hidden">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0EA5E9] to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#0EA5E9]/20 group-hover:scale-110 transition-transform">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-wide">
            极速参数生成
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            毫秒级响应框架，告别传统渲染流的冗长等待；原生支持批量材质构建与导出。
          </p>
        </div>

        <div className="visual-card bg-white/60 border border-white/80 backdrop-blur-xl p-8 rounded-[32px] flex flex-col items-start hover:bg-white/80 shadow-xl shadow-slate-200/50 transition-colors group relative overflow-hidden">
          <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
            <Layers className="w-7 h-7 text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-wide">
            动画序列生成
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            支持 idle / walk / attack
            等核心动作模板，保持角色外观一致与动态自然。
          </p>
        </div>

        <div className="visual-card bg-white/60 border border-white/80 backdrop-blur-xl p-8 rounded-[32px] flex flex-col items-start hover:bg-white/80 shadow-xl shadow-slate-200/50 transition-colors group relative overflow-hidden">
          <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
            <LayoutTemplate className="w-7 h-7 text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-wide">
            无缝引擎整合
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            自动构建 TexturePacker 兼容的 Spritesheet，一键导入 Unity、Godot 与
            Web 引擎。
          </p>
        </div>
      </section>

      {/* Extended Features */}
      <section className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pb-12">
        <div className="visual-card bg-gradient-to-br from-white/60 to-white/40 border border-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[32px] flex flex-col justify-center relative overflow-hidden group shadow-xl shadow-slate-200/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0EA5E9] opacity-5 blur-[80px] group-hover:opacity-10 transition-opacity"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <Sparkles className="w-6 h-6 text-[#0EA5E9]" />
            <h3 className="text-2xl font-bold text-slate-900 tracking-wide">
              全方位功能支持
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <div className="flex items-center gap-3 text-sm text-slate-600 font-bold bg-white/80 p-3 rounded-xl border border-black/5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#0EA5E9]"></div>{" "}
              多种预设风格
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 font-bold bg-white/80 p-3 rounded-xl border border-black/5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#0EA5E9]"></div>{" "}
              负面提示词控制
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 font-bold bg-white/80 p-3 rounded-xl border border-black/5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#0EA5E9]"></div>{" "}
              智能背景抠除
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 font-bold bg-white/80 p-3 rounded-xl border border-black/5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#0EA5E9]"></div>{" "}
              批量素材管理
            </div>
          </div>
        </div>

        <div className="visual-card bg-gradient-to-bl from-[#0EA5E9]/5 to-white/60 border border-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[32px] relative overflow-hidden group hover:border-[#0EA5E9]/20 shadow-xl shadow-slate-200/50 transition-colors">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#0EA5E9]/20 blur-[60px]"></div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2 bg-[#0EA5E9]/10 rounded-lg">
              <Package className="w-6 h-6 text-[#0EA5E9]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-wide">
              极简导出工程化
            </h3>
          </div>
          <p className="text-base text-slate-600 leading-relaxed max-w-md relative z-10 mt-2 font-medium">
            一键打包导出 ZIP 文件，内置标准图集 (`spritesheet.png`)
            与多引擎格式配置 (`spritesheet.json`)，真正实现
            <strong className="text-slate-900 font-bold"> 零门槛</strong>{" "}
            资产闭环。
          </p>
        </div>
      </section>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
