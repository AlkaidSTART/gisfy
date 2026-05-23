import StyleSelector from "@/components/workspace/style-selector";
import PromptEditor from "@/components/workspace/prompt-editor";
import ParamControls from "@/components/workspace/param-controls";
import PreviewCard from "@/components/workspace/preview-card";
import HistoryBar from "@/components/workspace/history-bar";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="w-full flex-col flex gap-8 pb-20">
      {/* Hero Section */}
      <section className="text-center py-6 animate-slide-up">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-3">
          设计专业的 <span className="text-[#0EA5E9]">2D 游戏资产</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
          只需输入你的想法，选择适当的风格，几秒钟即可获取透明背景、可平铺的专业素材。专为独立开发者与关卡设计师打造。
        </p>
      </section>

      {/* Main Workspace: 2 columns on desktop, stacked on mobile */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Input & Controls */}
        <div
          className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 w-full animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <StyleSelector />

          <PromptEditor />

          <ParamControls />

          <div className="pt-2">
            <Button
              size="lg"
              className="w-full gap-2 shadow-lg h-14 text-md font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              立即生成
            </Button>
            <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
              将消耗 1 点额度
            </p>
          </div>
        </div>

        {/* Right Column: Preview & Editor */}
        <div
          className="lg:col-span-8 xl:col-span-9 w-full h-full min-h-[500px] flex flex-col animate-slide-up"
          style={{ animationDelay: "150ms" }}
        >
          <PreviewCard />
        </div>
      </section>

      {/* Bottom Section: Recent History */}
      <section
        className="w-full mt-10 animate-slide-up"
        style={{ animationDelay: "200ms" }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-4 px-1">
          最近生成
        </h3>
        <HistoryBar />
      </section>
    </div>
  );
}
