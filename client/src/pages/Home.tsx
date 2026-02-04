import { useState, useEffect, useCallback } from "react";
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
  const [lastDrawIds, setLastDrawIds] = useState<Record<string, number>>({});

  const { data: textBlocks, isLoading: loadingText } = trpc.textBlocks.list.useQuery({ 
    location: "home", 
    visibleOnly: true 
  });
  
  const { data: imageBlocks, isLoading: loadingImages } = trpc.imageBlocks.list.useQuery({ 
    location: "home", 
    visibleOnly: true 
  });

  const { data: lotteryTypes } = trpc.lotteryTypes.list.useQuery({ enabledOnly: true });
  
  // 获取各个彩票的最新开奖记录
  const xinaoMidnight = lotteryTypes?.find(t => t.code === "xinao_midnight");
  const xinao = lotteryTypes?.find(t => t.code === "xinao");
  const hongkong = lotteryTypes?.find(t => t.code === "hongkong");
  const laoao = lotteryTypes?.find(t => t.code === "laoao");

  // 使用 staleTime 缓存数据，只在明确需要时才重新获取
  const { data: xinaoMidnightDraw, refetch: refetchXinaoMidnight } = trpc.lotteryDraws.getLatest.useQuery(
    { lotteryTypeId: xinaoMidnight?.id || 0 },
    { enabled: !!xinaoMidnight, staleTime: 60000 } // 缓存60秒
  );
  const { data: xinaoDraw, refetch: refetchXinao } = trpc.lotteryDraws.getLatest.useQuery(
    { lotteryTypeId: xinao?.id || 0 },
    { enabled: !!xinao, staleTime: 60000 }
  );
  const { data: hongkongDraw, refetch: refetchHongkong } = trpc.lotteryDraws.getLatest.useQuery(
    { lotteryTypeId: hongkong?.id || 0 },
    { enabled: !!hongkong, staleTime: 60000 }
  );
  const { data: laoaoDraw, refetch: refetchLaoao } = trpc.lotteryDraws.getLatest.useQuery(
    { lotteryTypeId: laoao?.id || 0 },
    { enabled: !!laoao, staleTime: 60000 }
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
    { code: "xinao_midnight", name: "新澳午夜彩", draw: xinaoMidnightDraw, type: xinaoMidnight, refetch: refetchXinaoMidnight },
    { code: "xinao", name: "新奥彩", draw: xinaoDraw, type: xinao, refetch: refetchXinao },
    { code: "hongkong", name: "香港彩", draw: hongkongDraw, type: hongkong, refetch: refetchHongkong },
    { code: "laoao", name: "老澳彩", draw: laoaoDraw, type: laoao, refetch: refetchLaoao },
  ];

  // 检查是否有新的开奖数据
  const checkForNewDraws = useCallback(() => {
    const draws = [
      { code: "xinao_midnight", draw: xinaoMidnightDraw, refetch: refetchXinaoMidnight },
      { code: "xinao", draw: xinaoDraw, refetch: refetchXinao },
      { code: "hongkong", draw: hongkongDraw, refetch: refetchHongkong },
      { code: "laoao", draw: laoaoDraw, refetch: refetchLaoao },
    ];

    draws.forEach(({ code, draw, refetch }) => {
      if (draw && draw.id !== lastDrawIds[code]) {
        // 新的开奖数据
        setLastDrawIds(prev => ({ ...prev, [code]: draw.id }));
      }
    });
  }, [xinaoMidnightDraw, xinaoDraw, hongkongDraw, laoaoDraw, lastDrawIds]);

  // 定期检查新数据（每2分钟检查一次）
  useEffect(() => {
    checkForNewDraws();
    
    const timer = setInterval(() => {
      // 只在需要时主动刷新数据
      refetchXinaoMidnight();
      refetchXinao();
      refetchHongkong();
      refetchLaoao();
    }, 120000); // 2分钟

    return () => clearInterval(timer);
  }, [checkForNewDraws, refetchXinaoMidnight, refetchXinao, refetchHongkong, refetchLaoao]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* 顶部装饰 */}
      <div className="h-16 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 shadow-lg"></div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 最新开奖部分 */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center golden-shine">最新开奖</h2>
          <Card className="card-elegant">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  {lotteryTabs.map((tab) => (
                    <TabsTrigger key={tab.code} value={tab.code}>
                      {tab.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {lotteryTabs.map((tab) => (
                  <TabsContent key={tab.code} value={tab.code}>
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
                  <Card className="card-elegant hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <Icon className={`w-10 h-10 mb-3 ${item.color}`} />
                      <span className="text-sm font-medium text-center">{item.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 文字资料区域 */}
        {textBlocks && textBlocks.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-center">资讯动态</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {textBlocks.map((block) => (
                <Card key={block.id} className="card-elegant hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{block.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-sm text-muted-foreground line-clamp-3"
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
            <h2 className="text-2xl font-bold mb-6 text-center">精选图片</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {imageBlocks.map((block) => (
                <Card key={block.id} className="card-elegant overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={block.imageUrl} 
                    alt={block.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{block.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{block.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
