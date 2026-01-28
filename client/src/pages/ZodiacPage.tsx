import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { ArrowLeft, ZoomIn } from "lucide-react";

export default function ZodiacPage() {
  const [, navigate] = useLocation();
  const { data: zodiacCard, isLoading } = trpc.zodiacCards.getActive.useQuery();

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
              号码属性
            </h1>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Card className="card-elegant">
          <CardContent className="p-8">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-12">加载中...</div>
            ) : zodiacCard ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6">
                  {zodiacCard.year}年生肖对照表
                </h2>
                
                <div className="relative">
                  <img 
                    src={zodiacCard.imageUrl} 
                    alt={`${zodiacCard.year}年生肖卡`}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  
                  {/* 放大查看按钮 */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="absolute bottom-4 right-4"
                        size="lg"
                      >
                        <ZoomIn className="w-5 h-5 mr-2" />
                        放大查看
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
                      <div className="w-full h-full overflow-auto p-4">
                        <img 
                          src={zodiacCard.imageUrl} 
                          alt={`${zodiacCard.year}年生肖卡`}
                          className="w-full h-auto"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-lg">使用说明</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 生肖卡展示了每个号码对应的生肖属性</li>
                    <li>• 点击"放大查看"按钮可以查看高清大图</li>
                    <li>• 每个号码都有对应的波色(红/蓝/绿)和生肖属性</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                暂无生肖卡数据
              </div>
            )}
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
