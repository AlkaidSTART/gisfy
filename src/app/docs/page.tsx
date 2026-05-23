import { BookType } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <div className="w-full flex-col flex flex-1 items-center justify-center animate-fade-in pb-20">
      <div className="glass-panel p-10 rounded-3xl flex flex-col items-center justify-center max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mb-6">
          <BookType className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">开发者集成文档</h2>
        <p className="text-sm text-gray-500 mb-8">
          如何将导出的精灵图与序列帧直接对齐 Unity 的 Tilemap 系统或 Godot 的
          AtlasTexture。文档编撰中。
        </p>
        <Link href="/">
          <Button variant="outline">返回首页</Button>
        </Link>
      </div>
    </div>
  );
}
