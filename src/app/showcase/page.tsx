"use client";

import { useRef, useState } from "react";
import {
  ArrowUpRight,
  Download,
  Filter,
  Star,
  Zap,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const CATEGORIES = ["全部", "环境", "武器", "生物", "道具", "UI组件"];

const MOCK_ASSETS = [
  {
    id: 1,
    name: "古老遗迹石柱",
    type: "Pixel Art",
    category: "环境",
    author: "GisFy_Bot",
    color: "from-slate-50 to-stone-100",
    size: "v-large",
  },
  {
    id: 2,
    name: "苍穹之剑",
    type: "Flat Design",
    category: "武器",
    author: "User_882",
    color: "from-blue-50 to-indigo-100",
    size: "normal",
  },
  {
    id: 3,
    name: "机械能量核",
    type: "VFX",
    category: "道具",
    author: "Spark",
    color: "from-purple-50 to-fuchsia-100",
    size: "normal",
  },
  {
    id: 4,
    name: "翠绿史莱姆",
    type: "Anime Style",
    category: "生物",
    author: "SlimeBox",
    color: "from-green-50 to-emerald-100",
    size: "v-large",
  },
  {
    id: 5,
    name: "暗金宝箱",
    type: "Classic RPG",
    category: "道具",
    author: "LootMaster",
    color: "from-amber-50 to-orange-100",
    size: "normal",
  },
  {
    id: 6,
    name: "悬浮晶体岛",
    type: "Surreal",
    category: "环境",
    author: "Dreamer",
    color: "from-indigo-50 to-cyan-100",
    size: "normal",
  },
];

export default function ShowcasePage() {
  const container = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = MOCK_ASSETS.filter((asset) => {
    const matchesCategory =
      activeCategory === "全部" || asset.category === activeCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useGSAP(
    () => {
      // Re-animate grid items when filter changes
      gsap.fromTo(
        ".asset-card",
        { scale: 0.95, opacity: 0, y: 10 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
          clearProps: "all",
        },
      );
    },
    { scope: container, dependencies: [activeCategory, searchQuery] },
  );

  return (
    <div ref={container} className="w-full min-h-screen pb-32">
      {/* 1. Immersive Hero Stats / Header */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <div className="showcase-title inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-[10px] font-bold tracking-widest uppercase mb-6 shadow-xl shadow-black/10">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                Featured Gallery
              </div>
              <h1 className="showcase-title text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[0.9] mb-8">
                极简材质
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0EA5E9] to-indigo-500">
                  灵感画廊
                </span>
              </h1>
              <p className="showcase-title text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">
                这是 GisFy
                社区最引以为傲的生成杰作。从复古像素到现代扁平化，每一件资产都经过
                AI 指令和渲染管线的精密修剪。
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="showcase-title grid grid-cols-2 gap-4 lg:w-80">
              <div className="glass-panel p-5 rounded-2xl border-none bg-white/60 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">12.5k</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Total Generates
                </div>
              </div>
              <div className="glass-panel p-5 rounded-2xl border-none bg-white/60 shadow-sm">
                <div className="text-2xl font-bold text-[#0EA5E9]">99%</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Engine Accuracy
                </div>
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
                className={cn(
                  "category-pill whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300",
                  activeCategory === cat
                    ? "bg-black text-white shadow-lg shadow-black/10 scale-105"
                    : "bg-gray-100/50 text-gray-400 hover:bg-gray-100 hover:text-gray-900",
                )}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-gray-100/50 border-white rounded-2xl text-xs font-medium w-full md:w-64 focus:ring-2 focus:ring-[#0EA5E9]/20 focus:bg-white outline-none transition-all shadow-inner"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-2xl bg-gray-100/50 hover:bg-white hover:shadow-sm"
            >
              <Filter className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </div>
      </section>

      {/* 3. The Masonry Hub */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={cn(
                "asset-card break-inside-avoid relative flex flex-col glass-panel rounded-[2rem] overflow-hidden group border border-white/60 bg-white/40 shadow-sm hover:shadow-2xl hover:shadow-[#0EA5E9]/10 transition-all duration-700 cursor-pointer",
              )}
            >
              {/* Image Box */}
              <div
                className={cn(
                  "relative w-full overflow-hidden bg-gradient-to-br",
                  asset.color,
                  asset.size === "v-large" ? "h-[440px]" : "h-[280px]",
                  "flex items-center justify-center transition-all duration-700",
                )}
              >
                {/* Visual Decorative Background - Abstract Shapes */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
                  <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#0EA5E9] blur-3xl"></div>
                </div>

                {/* Center Visual Mock */}
                <div className="relative w-32 h-32 rounded-3xl bg-white/60 backdrop-blur-xl border border-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                  <span className="text-4xl filter drop-shadow-md">💎</span>
                </div>

                {/* Quick Actions Hover UI */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                  <Button className="rounded-2xl bg-white text-black font-black hover:bg-black hover:text-white px-6 py-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75 shadow-xl">
                    <Download className="w-4 h-4 mr-2" />
                    下载资源
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-black transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-150"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    查看详情
                  </Button>
                </div>
              </div>

              {/* Asset Info Card */}
              <div className="p-8 space-y-4 relative bg-white/60 backdrop-blur-md group-hover:bg-white transition-colors duration-500">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-widest pl-0.5">
                      {asset.type}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                      {asset.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#0EA5E9]/10 transition-colors">
                    <Zap className="w-5 h-5 text-gray-300 group-hover:text-[#0EA5E9] transition-colors" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                      AI
                    </div>
                    <span className="text-[11px] font-bold text-gray-500">
                      By {asset.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                    <Filter className="w-3 h-3" />
                    {asset.category}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAssets.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                未找到相关素材
              </h3>
              <p className="text-gray-400 max-w-sm">
                尝试更换搜索词或选择其他分类，寻找你的灵感。
              </p>
            </div>
            <Button
              onClick={() => {
                setActiveCategory("全部");
                setSearchQuery("");
              }}
              variant="outline"
              className="rounded-full px-8 py-6 border-2 font-bold hover:bg-black hover:text-white transition-all"
            >
              清除所有筛选
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
