"use client";

import { useRef, useState } from "react";
import { LayoutGrid, ArrowUpRight, Download, Filter, Star, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const CATEGORIES = ["全部", "环境", "武器", "生物", "道具", "UI组件"];

const MOCK_ASSETS = [
  { id: 1, name: "古老遗迹石柱", type: "Pixel Art", category: "环境", color: "from-slate-50 to-stone-100", size: "v-large" },
  { id: 2, name: "苍穹之剑", type: "Flat Design", category: "武器", color: "from-blue-50 to-indigo-100", size: "normal" },
  { id: 3, name: "机械能量核", type: "VFX", category: "道具", color: "from-purple-50 to-fuchsia-100", size: "normal" },
  { id: 4, name: "翠绿史莱姆", type: "Anime Style", category: "生物", color: "from-green-50 to-emerald-100", size: "v-large" },
  { id: 5, name: "暗金宝箱", type: "Classic RPG", category: "道具", color: "from-amber-50 to-orange-100", size: "normal" },
  { id: 6, name: "悬浮晶体岛", type: "Surreal", category: "环境", color: "from-indigo-50 to-cyan-100", size: "normal" },
];

export default function ShowcasePage() {
  const container = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("全部");

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    tl.fromTo(".showcase-title", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      .fromTo(".category-pill", { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.05 }, "-=0.6")
      .fromTo(".asset-card", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, stagger: 0.08 }, "-=0.4");
  }, { scope: container });

  return (
    <div ref={container} className="w-full min-h-screen pb-32">
      
      {/* 1. Immersive Hero Stats / Header */}
      <section className="relative pt-16 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <div className="showcase-title inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-[10px] font-bold tracking-widest uppercase mb-6 shadow-xl shadow-black/10">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                Featured Gallery
              </div>
              <h1 className="showcase-title text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[0.9] mb-8">
                极简材质<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-indigo-500">灵感画廊</span>
              </h1>
              <p className="showcase-title text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">
                这是 GisFy 社区最引以为傲的生成杰作。从复古像素到现代扁平化，每一件资产都经过 AI 指令和渲染管线的精密修剪。
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="showcase-title grid grid-cols-2 gap-4 lg:w-80">
              <div className="glass-panel p-5 rounded-2xl border-none bg-white/40">
                <div className="text-2xl font-bold text-gray-900">12.5k</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Generates</div>
              </div>
              <div className="glass-panel p-5 rounded-2xl border-none bg-white/40">
                <div className="text-2xl font-bold text-[#0EA5E9]">99%</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Engine Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Navigation */}
      <section className="sticky top-14 z-40 py-6 mb-12 border-y border-border/40 backdrop-blur-md bg-white/60">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-pill whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeCategory === cat 
                    ? "bg-black text-white shadow-lg shadow-black/10 scale-105" 
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#0EA5E9] transition-colors" />
                <input 
                  type="text" 
                  placeholder="搜索资产关键词..." 
                  className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-2xl text-xs font-medium w-full md:w-64 focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none transition-all"
                />
             </div>
             <Button size="icon" variant="ghost" className="rounded-2xl bg-gray-100">
               <Filter className="w-4 h-4" />
             </Button>
          </div>
        </div>
      </section>

      {/* 3. The Masonry Hub */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
          {MOCK_ASSETS.map((asset) => (
            <div 
              key={asset.id} 
              className={`asset-card break-inside-avoid relative flex flex-col glass-panel rounded-[2rem] overflow-hidden group border border-border/40 bg-white shadow-sm hover:shadow-2xl hover:shadow-[#0EA5E9]/10 transition-all duration-700`}
            >
              {/* Image Box */}
              <div className={`relative w-full overflow-hidden bg-gradient-to-br ${asset.color} ${asset.size === 'v-large' ? 'h-[440px]' : 'h-[280px]'} flex items-center justify-center transition-all duration-700`}>
                
                {/* Visual Decorative Background - Abstract Shapes */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                   <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
                   <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#0EA5E9] blur-3xl"></div>
                </div>

                <div className="relative z-10 w-3/4 h-3/4 border border-white/40 rounded-3xl flex items-center justify-center backdrop-blur-[2px] shadow-2xl group-hover:scale-105 group-hover:rotate-1 transition-all duration-700">
                    <div className="text-gray-400/30 font-black text-2xl uppercase tracking-tighter transform -rotate-12 select-none group-hover:text-[#0EA5E9]/20">
                      GI-SFY
                    </div>
                </div>

                {/* Floating Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="glass-panel backdrop-blur-xl bg-white/60 p-4 rounded-2xl border-white/50 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Dimensions</div>
                        <div className="text-xs font-bold text-gray-900">1024 × 1024 px</div>
                    </div>
                    <Button size="icon" className="w-10 h-10 rounded-xl bg-black hover:bg-[#0EA5E9] text-white transition-all shadow-xl shadow-black/10">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="absolute top-6 left-6">
                  <span className="px-3 py-1 rounded-full bg-white/80 backdrop-blur text-[10px] font-bold text-gray-800 shadow-sm">
                    {asset.type}
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]"></div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{asset.category}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-4 group-hover:text-[#0EA5E9] transition-colors">
                  {asset.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></div>
                    ))}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-gray-100 text-[8px] font-bold text-gray-400">+12</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                    <Zap className="w-3 h-3 text-orange-400 fill-orange-400" />
                    PRO ASSET
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CTA / Footer Branding */}
      <section className="mt-32 max-w-5xl mx-auto px-6">
        <div className="glass-panel p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-gray-900 to-black text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0EA5E9] blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600 blur-[120px] rounded-full opacity-50"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">准备好创造你自己的传奇了吗？</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              加入 500+ 独立开发者，使用 GisFy 自动化产出你的首套游戏精灵图集。
            </p>
            <Button size="lg" className="h-14 px-10 rounded-2xl bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-bold text-lg shadow-2xl shadow-[#0EA5E9]/20 gap-3">
              立即开始生成 <ArrowUpRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
