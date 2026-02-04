import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DrawDisplay } from "@/components/DrawDisplay";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [activeTab, setActiveTab] = useState("xinao_midnight");

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

  // 开奖系统配置
  const lotteryTabs = [
    { code: "xinao_midnight", name: "新澳午夜彩", draw: xinaoMidnightDraw, type: xinaoMidnight },
    { code: "xinao", name: "新奥彩", draw: xinaoDraw, type: xinao },
    { code: "hongkong", name: "香港彩", draw: hongkongDraw, type: hongkong },
    { code: "laoao", name: "老澳彩", draw: laoaoDraw, type: laoao },
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
        {/* 开奖展示区域 - 使用选项卡 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">最新开奖</h2>
          
          <Card className="card-elegant">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* 选项卡按钮 */}
                <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted p-1">
                  {lotteryTabs.map(tab => (
                    <TabsTrigger 
                      key={tab.code} 
                      value={tab.code}
                      className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {tab.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* 选项卡内容 */}
                {lotteryTabs.map(tab => (
                  <TabsContent key={tab.code} value={tab.code} className="mt-0">
                    {tab.type && (
                      <DrawDisplay 
                        lotteryName={tab.type.name} 
                        draw={tab.draw || null}
                        isCustom={tab.type.isCustom}
                      />
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* 功能导航区域 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">功能导航</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {functionIcons.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link key={index} href={item.path}>
                  <a className="block">
                    <Card className="card-elegant hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardContent className="flex flex-col items-center justify-center py-6">
                        <Icon className={`w-10 h-10 mb-3 ${item.color}`} />
                        <span className="text-sm font-medium text-center">{item.label}</span>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 文字资料区域 */}
        {textBlocks && textBlocks.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-center">资料信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {textBlocks.map(block => (
                <Card key={block.id} className="card-elegant">
                  <CardHeader>
                    <CardTitle className="text-lg">{block.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: block.content }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 图片资料区域 */}
        {imageBlocks && imageBlocks.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-center">图片资料</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imageBlocks.map(block => (
                <Card key={block.id} className="card-elegant overflow-hidden">
                  <div className="relative w-full h-48 bg-muted">
                    <img 
                      src={block.imageUrl} 
                      alt={block.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{block.title}</CardTitle>
                  </CardHeader>
                  {block.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{block.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
