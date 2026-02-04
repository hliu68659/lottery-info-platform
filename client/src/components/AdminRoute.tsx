import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home } from "lucide-react";
import { Link } from "wouter";
import { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * 管理员路由保护组件
 * 检查localStorage中的adminToken，如果没有则重定向到登入页面
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查localStorage中是否存在adminToken
    const adminToken = localStorage.getItem("adminToken");
    
    if (!adminToken) {
      // 没有token，重定向到登入页面
      navigate("/admin/login");
      setIsLoading(false);
      return;
    }

    // 有token，标记为已认证
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [navigate]);

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-96">
          <CardContent className="py-12 px-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">正在验证权限...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 未认证
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-[480px] shadow-lg">
          <CardContent className="py-12 px-8">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-red-100 p-4 mb-6">
                <ShieldAlert className="h-12 w-12 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-3 text-gray-900">
                访问受限
              </h2>
              
              <p className="text-muted-foreground mb-6">
                您需要登入才能访问后台管理系统
              </p>
              
              <div className="flex gap-3 mt-4">
                <Link href="/">
                  <Button variant="outline" className="gap-2">
                    <Home className="h-4 w-4" />
                    返回首页
                  </Button>
                </Link>
                
                <Button 
                  onClick={() => navigate("/admin/login")}
                  className="gap-2"
                >
                  前往登入
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 已认证，渲染子组件
  return <>{children}</>;
}
