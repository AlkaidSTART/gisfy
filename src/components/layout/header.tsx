"use client";

import { useState } from "react";
import { Layers, User as UserIcon, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store/auth-store";
import LoginModal from "@/components/auth/login-modal";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
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
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-black font-medium transition-colors"
            >
              首页
            </Link>
            <Link
              href="/generate"
              className="text-sm text-gray-500 hover:text-black font-medium transition-colors"
            >
              工作台
            </Link>
            <Link
              href="/showcase"
              className="text-sm text-gray-500 hover:text-black font-medium transition-colors"
            >
              成品展示
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:inline-flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  {user.name ?? user.email}
                </span>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">退出</span>
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowLogin(true)}
                className="rounded-xl px-4"
              >
                登录
              </Button>
            )}
            <Link href="/generate">
              <Button
                size="sm"
                className="hidden sm:inline-flex rounded-xl px-5"
              >
                开始创作
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
