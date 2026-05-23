import StyleSelector from "@/components/workspace/style-selector";
import PromptEditor from "@/components/workspace/prompt-editor";
import ParamControls from "@/components/workspace/param-controls";
import PreviewCard from "@/components/workspace/preview-card";
import HistoryBar from "@/components/workspace/history-bar";
import { PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GeneratePage() {
  return (
    <div className="w-full flex-col flex gap-6 pb-20">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">创作工作台</h1>
          <p className="text-sm text-gray-500 mt-1">
            设置参数并生成高质量的 2D 游戏资产
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Input & Controls */}
        <div
          className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 w-full animate-slide-up"
          style={{ animationDelay: "50ms" }}
        >
          <StyleSelector />
          <PromptEditor />
          <ParamControls />

          <div className="pt-2">
            <Button
              size="lg"
              className="w-full gap-2 shadow-lg h-14 text-md font-semibold"
            >
              <PenTool className="w-5 h-5" />
              渲染输出
            </Button>
            <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
              预计耗时 3-5 秒 · 消耗 1 点额度
            </p>
          </div>
        </div>

        {/* Right Column: Preview & Editor */}
        <div
          className="lg:col-span-8 xl:col-span-9 w-full h-full min-h-125 flex flex-col animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <PreviewCard />
        </div>
      </section>

      {/* Bottom Section: Recent History */}
      <section
        className="w-full mt-6 animate-slide-up"
        style={{ animationDelay: "150ms" }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-4 px-1">
          当前会话图库
        </h3>
        <HistoryBar />
      </section>
    </div>
  );
}
