import { useAuth } from "@/_core/hooks/useAuth";
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
 * 确保只有管理员用户才能访问后台页面
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();

  // 加载中状态
  if (loading) {
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

  // 未登录或非管理员
  if (!user || user.role !== 'admin') {
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
              
              <p className="text-muted-foreground mb-2">
                {!user 
                  ? "您需要登录才能访问后台管理系统" 
                  : "您没有权限访问后台管理系统"}
              </p>
              
              {user && (
                <p className="text-sm text-muted-foreground mb-6">
                  当前账号：<span className="font-medium">{user.name || user.email}</span>
                  <br />
                  权限级别：<span className="font-medium">{user.role === 'user' ? '普通用户' : user.role}</span>
                </p>
              )}
              
              <div className="flex gap-3 mt-4">
                <Link href="/">
                  <Button variant="outline" className="gap-2">
                    <Home className="h-4 w-4" />
                    返回首页
                  </Button>
                </Link>
                
                {!user && (
                  <Button 
                    onClick={() => {
                      // 触发登录流程
                      window.location.href = "/api/auth/login";
                    }}
                    className="gap-2"
                  >
                    立即登录
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 管理员用户，渲染子组件
  return <>{children}</>;
}
