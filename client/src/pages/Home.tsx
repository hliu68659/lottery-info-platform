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
  const { data: xinaoMidnightDraws, refetch: refetchXinaoMidnight } = trpc.lotteryDraws.list.useQuery(
    { lotteryTypeCode: "xinao_midnight", limit: 1 },
    { staleTime: 60000 }
  );
  const xinaoMidnightDraw = xinaoMidnightDraws?.[0];
  
  const { data: xinaoDraws, refetch: refetchXinao } = trpc.lotteryDraws.list.useQuery(
    { lotteryTypeCode: "xinao", limit: 1 },
    { staleTime: 60000 }
  );
  const xinaoDraw = xinaoDraws?.[0];
  
  const { data: hongkongDraws, refetch: refetchHongkong } = trpc.lotteryDraws.list.useQuery(
    { lotteryTypeCode: "hongkong", limit: 1 },
    { staleTime: 60000 }
  );
  const hongkongDraw = hongkongDraws?.[0];
  
  const { data: laoaoDraws, refetch: refetchLaoao } = trpc.lotteryDraws.list.useQuery(
    { lotteryTypeCode: "laoao", limit: 1 },
    { staleTime: 60000 }
  );
  const laoaoDraw = laoaoDraws?.[0];

  const functionIcons = [
    { icon: Sparkles, label: "号码属性", path: "/zodiac", bgColor: "bg-green-500", borderColor: "border-green-400" },
    { icon: Calculator, label: "条码助手", path: "/barcode", bgColor: "bg-blue-500", borderColor: "border-blue-400" },
    { icon: History, label: "开奖记录", path: "/history", bgColor: "bg-purple-500", borderColor: "border-purple-400" },
    { icon: BookOpen, label: "六合公式", path: "/formula", bgColor: "bg-red-500", borderColor: "border-red-400" },
    { icon: Brain, label: "神算子", path: "/shensuan", bgColor: "bg-orange-500", borderColor: "border-orange-400" },
    { icon: Crown, label: "管家婆", path: "/guanjiapo", bgColor: "bg-pink-500", borderColor: "border-pink-400" },
    { icon: Star, label: "黄大仙", path: "/huangdaxian", bgColor: "bg-blue-600", borderColor: "border-blue-500" },
    { icon: Smile, label: "幽默猜测", path: "/humor", bgColor: "bg-yellow-500", borderColor: "border-yellow-400" },
  ];

  // 开奖系统配置
  const lotteryTabs = [
    { code: "xinao_midnight", name: "新澳午夜彩", draw: xinaoMidnightDraw, type: xinaoMidnight, refetch: refetchXinaoMidnight },
    { code: "xinao", name: "新澳六合彩", draw: xinaoDraw, type: xinao, refetch: refetchXinao },
    { code: "hongkong", name: "香港彩", draw: hongkongDraw, type: hongkong, refetch: refetchHongkong },
    { code: "laoao", name: "老澳六合彩", draw: laoaoDraw, type: laoao, refetch: refetchLaoao },
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
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #FF9500 0%, #FFD700 100%)" }}>
      {/* 顶部标题区域 */}
      <div className="bg-amber-900 text-white py-4 text-center">
        <h1 className="text-2xl font-bold">最新开奖</h1>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 最新开奖部分 */}
        <section className="bg-white rounded-lg p-6 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-yellow-100">
              {lotteryTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.code} 
                  value={tab.code}
                  className="data-[state=active]:bg-white data-[state=active]:text-amber-900"
                >
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
        </section>

        {/* 功能导航区域 */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-lg">功能导航</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {functionIcons.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link key={index} href={item.path}>
                  <div className="h-full cursor-pointer transform transition-transform hover:scale-105">
                    <div 
                      className="flex flex-col items-center justify-center py-8 rounded-lg border-4 dashed"
                      style={{ 
                        borderColor: "rgba(0, 255, 0, 0.3)",
                        borderStyle: "dashed"
                      }}
                    >
                      <div 
                        className={`${item.bgColor} rounded-full p-6 mb-4 flex items-center justify-center`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-sm font-bold text-center text-white drop-shadow-md">{item.label}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 资讯动态区域 */}
        {textBlocks && textBlocks.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-lg">资讯动态</h2>
            <div className="grid grid-cols-1 gap-4">
              {textBlocks.map((block, index) => (
                <div key={block.id} className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-900 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{block.title}</h3>
                      <div 
                        className="text-sm text-gray-700 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: block.content }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 图片资料区域 */}
        {imageBlocks && imageBlocks.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-lg">精选图片</h2>
            <div className="grid grid-cols-1 gap-4">
              {imageBlocks.map((block) => (
                <div key={block.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={block.imageUrl} 
                    alt={block.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{block.title}</h3>
                    <p className="text-sm text-gray-700 line-clamp-2">{block.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
