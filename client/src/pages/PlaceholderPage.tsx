import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen elegant-gradient">
      {/* 头部 */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold golden-shine bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Card className="card-elegant">
          <CardContent className="py-24 text-center space-y-4">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold">功能开发中</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {description}
            </p>
            <Button onClick={() => navigate("/")} className="mt-6">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* 页脚 */}
      <footer className="bg-card/80 backdrop-blur-sm border-t border-border mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>© 2026 彩票资讯平台 - 仅供娱乐参考</p>
        </div>
      </footer>
    </div>
  );
}
