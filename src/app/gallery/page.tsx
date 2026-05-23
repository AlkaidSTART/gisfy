import { PenBox } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GalleryPage() {
  return (
    <div className="w-full flex-col flex flex-1 items-center justify-center animate-fade-in pb-20">
      <div className="glass-panel p-10 rounded-3xl flex flex-col items-center justify-center max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mb-6">
          <PenBox className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">公共资产画廊</h2>
        <p className="text-sm text-gray-500 mb-8">
          模块维护中...这里将展示优质的生成资产（如
          Tilemap，环境精灵图等），如同小型的资源商店。
        </p>
        <Link href="/generate">
          <Button>前往生成</Button>
        </Link>
      </div>
    </div>
  );
}
