import { PieChart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="w-full flex-col flex flex-1 items-center justify-center animate-fade-in pb-20">
      <div className="glass-panel p-10 rounded-3xl flex flex-col items-center justify-center max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mb-6">
          <PieChart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">配额管理仪表盘</h2>
        <p className="text-sm text-gray-500 mb-8">
          管理您的 API Key (通义万相等)，查看月度账单和生成渲染点数消耗趋势。
        </p>
        <Link href="/generate">
          <Button variant="outline">返回工作台</Button>
        </Link>
      </div>
    </div>
  );
}
