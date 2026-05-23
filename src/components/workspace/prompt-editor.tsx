"use client";
import { useState } from "react";
import { AlignLeft, Sparkles, Wand2, Type, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PromptEditor() {
  const [activeTab, setActiveTab] = useState<"text" | "form">("text");
  const [textPrompt, setTextPrompt] = useState("");
  const [formPrompt, setFormPrompt] = useState({ subject: "", details: "" });
  const [isPolishing, setIsPolishing] = useState(false);

  const handlePolish = async () => {
    setIsPolishing(true);
    let originalPrompt = "";
    if (activeTab === "text") {
      originalPrompt = textPrompt;
    } else {
      originalPrompt = `${formPrompt.subject}, ${formPrompt.details}`;
    }

    if (!originalPrompt.trim()) {
      setIsPolishing(false);
      return;
    }

    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: originalPrompt, mode: activeTab })
      });
      const data = await res.json();
      if (data.success && data.polishedPrompt) {
        // Switch to text view to show polished result
        setActiveTab("text");
        setTextPrompt(data.polishedPrompt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-gray-500" />
          画面描述
        </h2>

        {/* Tab switcher */}
        <div className="flex bg-gray-100/50 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("text")}
            className={`px-3 py-1 flex items-center gap-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === "text" ? "bg-white shadow-sm text-gray-900 border border-border/50" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Type className="w-3 h-3" />
            文本模式
          </button>
          <button 
            onClick={() => setActiveTab("form")}
            className={`px-3 py-1 flex items-center gap-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === "form" ? "bg-white shadow-sm text-gray-900 border border-border/50" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutList className="w-3 h-3" />
            表单模式
          </button>
        </div>
      </div>
      
      <div className="relative group min-h-[140px] flex flex-col">
        {activeTab === "text" ? (
          <textarea 
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            placeholder="例如：一个生锈的铁剑，带有蓝色的魔法光芒，适合放在 RPG 游戏的装备栏中..."
            className="w-full flex-1 p-3 pb-12 text-sm bg-white/50 border border-border/50 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[#0EA5E9]/50 transition-all resize-none placeholder:text-gray-400 text-gray-800"
          />
        ) : (
          <div className="flex-1 flex flex-col gap-3 p-3 bg-white/50 border border-border/50 rounded-xl transition-all pb-12">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">生成主体</label>
              <input 
                type="text" 
                value={formPrompt.subject}
                onChange={(e) => setFormPrompt(p => ({ ...p, subject: e.target.value }))}
                placeholder="如：木质宝箱" 
                className="w-full p-2 text-sm bg-transparent border-b border-border/50 outline-none focus:border-[#0EA5E9]/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">材质与细节细节</label>
              <input 
                type="text" 
                value={formPrompt.details}
                onChange={(e) => setFormPrompt(p => ({ ...p, details: e.target.value }))}
                placeholder="如：长满青苔，黄金镶边" 
                className="w-full p-2 text-sm bg-transparent border-b border-border/50 outline-none focus:border-[#0EA5E9]/50"
              />
            </div>
          </div>
        )}
        
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <Button 
            disabled={isPolishing}
            onClick={handlePolish}
            size="sm" 
            variant="outline" 
            className="h-8 gap-1.5 text-xs text-[#0EA5E9] border-[#0EA5E9]/20 hover:bg-[#0EA5E9]/10 rounded-lg shadow-sm"
          >
            {isPolishing ? (
              <span className="w-3 h-3 rounded-full border-2 border-[#0EA5E9]/30 border-t-[#0EA5E9] animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            AI 润色
          </Button>
        </div>
      </div>
    </div>
  );
}
