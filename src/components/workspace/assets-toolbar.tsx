"use client";

import { Search, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type AssetStyle = "pixel" | "flat" | "anime" | "all";
type AssetType =
  | "character"
  | "monster"
  | "scene"
  | "tile"
  | "item"
  | "ui"
  | "effect"
  | "all";
type DateRange = "today" | "week" | "all";

interface AssetsToolbarProps {
  style: AssetStyle;
  type: AssetType;
  dateRange: DateRange;
  search: string;
  selectedCount: number;
  onStyleChange: (value: AssetStyle) => void;
  onTypeChange: (value: AssetType) => void;
  onDateRangeChange: (value: DateRange) => void;
  onSearchChange: (value: string) => void;
  onDeleteSelected: () => void;
  onExportSelected: () => void;
}

const styleOptions: Array<{ value: AssetStyle; label: string }> = [
  { value: "all", label: "全部风格" },
  { value: "pixel", label: "pixel" },
  { value: "flat", label: "flat" },
  { value: "anime", label: "anime" },
];

const typeOptions: Array<{ value: AssetType; label: string }> = [
  { value: "all", label: "全部类型" },
  { value: "character", label: "character" },
  { value: "monster", label: "monster" },
  { value: "scene", label: "scene" },
  { value: "tile", label: "tile" },
  { value: "item", label: "item" },
  { value: "ui", label: "ui" },
  { value: "effect", label: "effect" },
];

const dateOptions: Array<{ value: DateRange; label: string }> = [
  { value: "today", label: "今天" },
  { value: "week", label: "本周" },
  { value: "all", label: "全部" },
];

export default function AssetsToolbar({
  style,
  type,
  dateRange,
  search,
  selectedCount,
  onStyleChange,
  onTypeChange,
  onDateRangeChange,
  onSearchChange,
  onDeleteSelected,
  onExportSelected,
}: AssetsToolbarProps) {
  return (
    <div className="glass-panel rounded-2xl bg-white/60 border border-white p-3 md:p-4 flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          {styleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onStyleChange(option.value)}
              className={`h-8 px-3 rounded-xl text-xs font-bold border ${
                style === option.value
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-border/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索 prompt"
              className="h-8 w-40 rounded-xl border border-border/50 bg-white pl-8 pr-3 text-xs outline-none"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDeleteSelected}
            disabled={selectedCount === 0}
            className="h-8 px-3 rounded-xl text-xs font-bold text-red-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
            删除选中
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onExportSelected}
            disabled={selectedCount === 0}
            className="h-8 px-3 rounded-xl text-xs font-bold text-[#0EA5E9]"
          >
            <Download className="w-3.5 h-3.5" />
            导出选中
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onTypeChange(option.value)}
              className={`h-8 px-3 rounded-xl text-xs font-bold border ${
                type === option.value
                  ? "bg-[#0EA5E9] text-white border-[#0EA5E9]"
                  : "bg-white text-gray-600 border-border/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {dateOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onDateRangeChange(option.value)}
              className={`h-8 px-3 rounded-xl text-xs font-bold border ${
                dateRange === option.value
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-border/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
