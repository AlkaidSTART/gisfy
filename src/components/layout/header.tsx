import { Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-panel rounded-none">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 md:px-8">
        
        {/* LOGO area */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg shadow-sm">
            <Layers className="w-5 h-5 text-[#0EA5E9]" />
          </div>
          <Link href="/" className="font-semibold text-lg tracking-tight">
            GisFy
          </Link>
          <span className="px-2 py-0.5 ml-2 text-xs bg-secondary border border-border/50 text-muted-foreground rounded-full hidden sm:inline-block">
            Beta
          </span>
        </div>
        
        {/* Central Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/gallery" className="text-sm text-gray-500 hover:text-black font-medium transition-colors">
            资产画廊
          </Link>
          <Link href="/docs" className="text-sm text-gray-500 hover:text-black font-medium transition-colors">
            接入文档
          </Link>
          <Link href="/generate" className="text-sm text-gray-500 hover:text-black font-medium transition-colors">
            工作台
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black font-medium transition-colors hidden sm:inline-block">
            控制台
          </Link>
          <div className="w-px h-4 bg-gray-200 mx-1 hidden sm:block"></div>
          <Link href="/generate">
            <Button size="sm" className="hidden sm:inline-flex">开始创作</Button>
          </Link>
        </div>

      </div>
    </header>
  );
}
