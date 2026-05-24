"use client";

import { useEffect, useMemo, useRef } from "react";
import { Layers, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import HistoryBar from "@/components/workspace/history-bar";

type AssetItem = {
  id: string;
  url: string;
  prompt: string;
  style: string;
};

interface SpritesheetBuilderProps {
  items: AssetItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  format: "texturepacker-array" | "aseprite" | "phaser" | "strip" | "grid";
  onFormatChange: (format: "texturepacker-array" | "aseprite" | "phaser" | "strip" | "grid") => void;
  isBuilding: boolean;
  onBuild: () => void;
  result: {
    pngUrl: string;
    jsonUrl: string;
    frameCount: number;
    sheetSize: { w: number; h: number };
  } | null;
  onExportZip: () => void;
}

export default function SpritesheetBuilder({
  items,
  selectedIds,
  onToggleSelect,
  format,
  onFormatChange,
  isBuilding,
  onBuild,
  result,
  onExportZip,
}: SpritesheetBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cell = 96;
    const padding = 12;
    const cols = Math.max(1, Math.min(4, selectedItems.length || 1));
    const rows = Math.max(1, Math.ceil((selectedItems.length || 1) / cols));
    const width = cols * cell + (cols + 1) * padding;
    const height = rows * cell + (rows + 1) * padding;
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = "100%";
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const draw = async () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      if (selectedItems.length === 0) {
        ctx.strokeStyle = "#e5e7eb";
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(1, 1, width - 2, height - 2);
        ctx.setLineDash([]);
        ctx.fillStyle = "#9ca3af";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("选择历史素材以预览 Spritesheet", width / 2, height / 2);
        return;
      }

      const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

      const images = await Promise.all(
        selectedItems.map(async (item) => {
          try {
            return { item, image: await loadImage(item.url) };
          } catch {
            return { item, image: null };
          }
        }),
      );

      images.forEach(({ item, image }, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = padding + col * (cell + padding);
        const y = padding + row * (cell + padding);

        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(x, y, cell, cell);

        ctx.strokeStyle = "#cbd5e1";
        ctx.strokeRect(x, y, cell, cell);

        if (image) {
          const scale = Math.min(cell / image.width, cell / image.height);
          const drawW = image.width * scale;
          const drawH = image.height * scale;
          const dx = x + (cell - drawW) / 2;
          const dy = y + (cell - drawH) / 2;
          ctx.drawImage(image, dx, dy, drawW, drawH);
        } else {
          ctx.fillStyle = "#dbeafe";
          ctx.fillRect(x + 8, y + 8, cell - 16, cell - 16);
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(x, y + cell - 20, cell, 20);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(item.id.slice(0, 8), x + cell / 2, y + cell - 7);
      });
    };

    void draw();
  }, [selectedItems]);

  return (
    <div className="px-2 mb-4">
      <div className="glass-panel rounded-2xl bg-white/60 border border-white p-3 md:p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#0EA5E9]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-700">
                Spritesheet Builder
              </p>
              <p className="text-[10px] text-gray-400">
                从历史素材多选并预览排列
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => selectedIds.forEach((id) => onToggleSelect(id))}
              className="h-8 px-3 rounded-xl text-xs font-bold text-gray-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </Button>
            <span className="text-[11px] text-gray-500 font-medium">
              已选 {selectedIds.length} 项
            </span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl border border-border/50 bg-white shadow-inner"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={format}
            onChange={(e) =>
              onFormatChange(
                e.target.value as
                  | "texturepacker-array"
                  | "aseprite"
                  | "phaser"
                  | "strip"
                  | "grid",
              )
            }
            className="h-9 rounded-xl border border-border/50 bg-white px-3 text-xs font-medium"
          >
            <option value="texturepacker-array">texturepacker-array</option>
            <option value="aseprite">aseprite</option>
            <option value="phaser">phaser</option>
            <option value="strip">strip</option>
            <option value="grid">grid</option>
          </select>
          <Button
            type="button"
            onClick={onBuild}
            disabled={isBuilding || selectedIds.length === 0}
            className="h-9 rounded-xl text-xs font-bold"
          >
            {isBuilding ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                生成中...
              </>
            ) : (
              "生成 Spritesheet"
            )}
          </Button>
          {result && (
            <>
              <span className="text-[11px] text-gray-600 font-medium">
                帧数 {result.frameCount} · {result.sheetSize.w}x
                {result.sheetSize.h}
              </span>
              <a
                href={result.pngUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-[#0EA5E9] hover:underline"
              >
                PNG
              </a>
              <a
                href={result.jsonUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-[#0EA5E9] hover:underline"
              >
                JSON
              </a>
              <button
                type="button"
                onClick={onExportZip}
                className="text-[11px] font-bold text-[#0EA5E9] hover:underline"
              >
                导出 ZIP
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <HistoryBar
          items={items}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
        />
      </div>
    </div>
  );
}
