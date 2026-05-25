"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  Grid3X3,
  Layers,
  RefreshCw,
  Trash2,
} from "lucide-react";
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
  onSelectAll: () => void;
  onClearSelection: () => void;
  onMoveSelected: (id: string, direction: -1 | 1) => void;
  format: "texturepacker-array" | "aseprite" | "phaser" | "strip" | "grid";
  onFormatChange: (format: "texturepacker-array" | "aseprite" | "phaser" | "strip" | "grid") => void;
  columns?: number;
  onColumnsChange: (columns?: number) => void;
  padding: number;
  onPaddingChange: (padding: number) => void;
  isBuilding: boolean;
  onBuild: () => void;
  result: {
    pngUrl: string;
    jsonUrl: string;
    json?: unknown;
    frameCount: number;
    sheetSize: { w: number; h: number };
  } | null;
  onExportZip: () => void;
}

export default function SpritesheetBuilder({
  items,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onMoveSelected,
  format,
  onFormatChange,
  columns,
  onColumnsChange,
  padding,
  onPaddingChange,
  isBuilding,
  onBuild,
  result,
  onExportZip,
}: SpritesheetBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedItems = useMemo(
    () =>
      selectedIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is AssetItem => Boolean(item)),
    [items, selectedIds],
  );
  const resultJson = useMemo(
    () => (result?.json ? JSON.stringify(result.json, null, 2) : ""),
    [result],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cell = 96;
    const padding = 12;
    const cols = Math.max(
      1,
      Math.min(columns ?? 4, selectedItems.length || 1),
    );
    const rows = Math.max(1, Math.ceil((selectedItems.length || 1) / cols));
    const width = cols * cell + (cols + 1) * padding;
    const height = rows * cell + (rows + 1) * padding;
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${width}px`;
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
  }, [columns, selectedItems]);

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
              onClick={onSelectAll}
              className="h-8 px-3 rounded-xl text-xs font-bold text-gray-500"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              全选
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
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

        {selectedItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {selectedItems.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/50 bg-white p-2 flex items-center gap-2"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-gray-700 truncate">
                    {String(index + 1).padStart(2, "0")} · {item.id.slice(0, 8)}
                  </p>
                  <p className="text-[9px] text-gray-400 truncate">
                    {item.prompt}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveSelected(item.id, -1)}
                    disabled={index === 0}
                    className="w-6 h-5 rounded-md border border-border/50 text-gray-500 disabled:opacity-30 flex items-center justify-center"
                    title="前移"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSelected(item.id, 1)}
                    disabled={index === selectedItems.length - 1}
                    className="w-6 h-5 rounded-md border border-border/50 text-gray-500 disabled:opacity-30 flex items-center justify-center"
                    title="后移"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <canvas
            ref={canvasRef}
            className="block rounded-2xl border border-border/50 bg-white shadow-inner"
          />
        </div>

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
          <label className="h-9 rounded-xl border border-border/50 bg-white px-3 text-xs font-medium flex items-center gap-2">
            列
            <input
              type="number"
              min={1}
              max={16}
              value={columns ?? ""}
              placeholder="auto"
              onChange={(e) =>
                onColumnsChange(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-14 outline-none bg-transparent text-xs"
            />
          </label>
          <label className="h-9 rounded-xl border border-border/50 bg-white px-3 text-xs font-medium flex items-center gap-2">
            间距
            <input
              type="number"
              min={0}
              max={8}
              value={padding}
              onChange={(e) =>
                onPaddingChange(
                  Math.min(8, Math.max(0, Number(e.target.value) || 0)),
                )
              }
              className="w-10 outline-none bg-transparent text-xs"
            />
          </label>
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
                download="spritesheet.png"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-[#0EA5E9] hover:underline inline-flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                PNG
              </a>
              <a
                href={result.jsonUrl}
                download="spritesheet.json"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-[#0EA5E9] hover:underline inline-flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                JSON
              </a>
              <button
                type="button"
                onClick={onExportZip}
                className="text-[11px] font-bold text-[#0EA5E9] hover:underline inline-flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                导出 ZIP
              </button>
            </>
          )}
        </div>

        {resultJson && (
          <details className="rounded-xl border border-border/50 bg-slate-950 text-slate-100 overflow-hidden">
            <summary className="cursor-pointer px-3 py-2 text-[11px] font-bold text-slate-200">
              预览 spritesheet.json
            </summary>
            <pre className="max-h-64 overflow-auto p-3 text-[10px] leading-relaxed">
              {resultJson}
            </pre>
          </details>
        )}
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
