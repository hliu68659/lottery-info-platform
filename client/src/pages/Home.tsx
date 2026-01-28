import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DrawDisplay } from "@/components/DrawDisplay";
import { Link } from "wouter";
import { 
  Sparkles, 
  Calculator, 
  History, 
  BookOpen, 
  Brain, 
  Crown, 
  Star,
  Smile
} from "lucide-react";

export default function Home() {
  const { data: textBlocks, isLoading: loadingText } = trpc.textBlocks.list.useQuery({ 
    location: "home", 
    visibleOnly: true 
  });
  
  const { data: imageBlocks, isLoading: loadingImages } = trpc.imageBlocks.list.useQuery({ 
    location: "home", 
    visibleOnly: true 
  });

  const { data: lotteryTypes } = trpc.lotteryTypes.list.useQuery({ enabledOnly: true });
  
  // 每30秒自动刷新一次开奖数据
  useEffect(() => {
    const timer = setInterval(() => {
      // 重新获取所有查询数据
      window.location.reload();
    }, 30000);

    return () => clearInterval(timer);
  }, []);
  
  // 获取各个彩票的最新开奖记录
  const xinaoMidnight = lotteryTypes?.find(t => t.code === "xinao_midnight");
  const xinao = lotteryTypes?.find(t => t.code === "xinao");
  const hongkong = lotteryTypes?.find(t => t.code === "hongkong");
  const laoao = lotteryTypes?.find(t => t.code === "laoao");

  const { data: xinaoMidnightDraw } = trpc.lotteryDraws.getLatest.useQuery(
    { lotteryTypeId: xinaoMidnight?.id || 0 },
    { enabled: !!xinaoMidnight }
  );
  const { data: xinaoDraw } = trpc.lotteryDraws.getLatest.useQuery(
    { lotteryTypeId: xinao?.id || 0 },
    { enabled: !!xinao }
  );
  const { data: hongkongDraw } = trpc.lotteryDraws.getLatest.useQuery(
    { lotteryTypeId: hongkong?.id || 0 },
    { enabled: !!hongkong }
  );
  const { data: laoaoDraw } = trpc.lotteryDraws.getLatest.useQuery(
    { lotteryTypeId: laoao?.id || 0 },
    { enabled: !!laoao }
  );

  const functionIcons = [
    { icon: Sparkles, label: "号码属性", path: "/zodiac", color: "text-yellow-600" },
    { icon: Calculator, label: "条码助手", path: "/barcode", color: "text-blue-600" },
    { icon: History, label: "开奖记录", path: "/history", color: "text-green-600" },
    { icon: BookOpen, label: "六合公式", path: "/formula", color: "text-purple-600" },
    { icon: Brain, label: "神算子", path: "/shensuan", color: "text-red-600" },
    { icon: Crown, label: "管家婆", path: "/guanjiapo", color: "text-orange-600" },
    { icon: Star, label: "黄大仙", path: "/huangdaxian", color: "text-indigo-600" },
    { icon: Smile, label: "幽默猜测", path: "/humor", color: "text-pink-600" },
  ];

  return (
    <div className="min-h-screen elegant-gradient">
      {/* 头部 */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container py-4">
          <h1 className="text-3xl font-bold text-center golden-shine bg-clip-text text-transparent">
            彩票资讯平台
          </h1>
        </div>
      </header>

      <main className="container py-8 space-y-12">
        {/* 开奖展示区域 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">最新开奖</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {xinaoMidnight && (
              <DrawDisplay 
                lotteryName={xinaoMidnight.name} 
                draw={xinaoMidnightDraw || null}
                isCustom={xinaoMidnight.isCustom}
              />
            )}
            {xinao && (
              <DrawDisplay 
                lotteryName={xinao.name} 
                draw={xinaoDraw || null}
                isCustom={xinao.isCustom}
              />
            )}
            {hongkong && (
              <DrawDisplay 
                lotteryName={hongkong.name} 
                draw={hongkongDraw || null}
                isCustom={hongkong.isCustom}
              />
            )}
            {laoao && (
              <DrawDisplay 
                lotteryName={laoao.name} 
                draw={laoaoDraw || null}
                isCustom={laoao.isCustom}
              />
            )}
          </div>
        </section>

        {/* 功能图标区域 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">功能导航</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {functionIcons.map((item, index) => (
              <Link key={index} href={item.path}>
                <Card className="card-elegant hover:scale-105 transition-transform cursor-pointer h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                    <item.icon className={`w-12 h-12 ${item.color}`} />
                    <span className="font-semibold text-center">{item.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 文字资料板块 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">资料中心</h2>
          {loadingText ? (
            <div className="text-center text-muted-foreground">加载中...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {textBlocks?.map((block) => (
                <Card key={block.id} className="card-elegant">
                  <CardHeader>
                    <CardTitle className="text-lg">{block.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {block.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 图片资料板块 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">精选图集</h2>
          {loadingImages ? (
            <div className="text-center text-muted-foreground">加载中...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {imageBlocks?.map((block) => (
                <Card key={block.id} className="card-elegant overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={block.imageUrl} 
                      alt={block.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{block.title}</h3>
                    {block.description && (
                      <p className="text-sm text-muted-foreground">{block.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
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
