import { Layers, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-(--color-border) glass-panel rounded-none">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg shadow-sm">
            <Layers className="w-5 h-5 text-[#0EA5E9]" />
          </div>
          <Link href="/" className="font-semibold text-lg tracking-tight">
            GisFy
          </Link>
          <span className="px-2 py-0.5 ml-2 text-xs bg-(--color-secondary) border border-(--color-border) text-muted-foreground rounded-full">
            Beta
          </span>
        </div>

        <nav className="flex items-center gap-4">
          <Link
            href="/history"
            className="text-sm text-gray-500 hover:text-black font-medium transition-colors"
          >
            历史记录
          </Link>
          <button className="glass-button w-8 h-8 flex items-center justify-center rounded-full text-gray-500">
            <HelpCircle className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
