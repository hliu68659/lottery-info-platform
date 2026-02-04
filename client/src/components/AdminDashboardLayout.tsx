import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [, navigate] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    // 清除token
    localStorage.removeItem("adminToken");
    toast.success("已登出");
    // 重定向到登入页面
    navigate("/admin/login");
  };

  const menuItems = [
    { label: "后台首页", path: "/admin" },
    { label: "快捷开奖", path: "/admin/quick-draw" },
    { label: "开奖历史", path: "/admin/draw-history" },
    { label: "资料管理", path: "/admin/materials" },
  ];

  const [currentPath] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* 顶部导航栏 */}
      <header className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
            <h1 className="text-2xl font-bold text-white">后台管理系统</h1>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4" />
            登出
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        {isSidebarOpen && (
          <aside className="w-64 bg-white border-r border-border">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    currentPath === item.path
                      ? "bg-amber-100 text-amber-900 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* 主内容区域 */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
