import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/header";

export const metadata: Metadata = {
  title: "GisFy — AI 2D 游戏素材生成器",
  description: "输入文字描述，AI 秒级生成 2D 游戏素材",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center py-6 px-4 md:px-8 w-full max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </body>
    </html>
  );
}
