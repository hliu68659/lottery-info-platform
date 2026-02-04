import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LotteryBall } from "@/components/LotteryBall";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function HistoryPage() {
  const [, navigate] = useLocation();
  const [selectedLotteryId, setSelectedLotteryId] = useState<number | null>(null);

  const { data: lotteryTypes } = trpc.lotteryTypes.list.useQuery({ enabledOnly: true });
  const selectedLottery = lotteryTypes?.find(t => t.id === selectedLotteryId);
  const { data: draws, isLoading } = trpc.lotteryDraws.list.useQuery(
    { lotteryTypeCode: selectedLottery?.code, limit: 50 },
    { enabled: !!selectedLottery?.code }
  );

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
              开奖记录
            </h1>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* 彩票类型选择 */}
        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <label className="font-semibold whitespace-nowrap">选择彩票:</label>
              <Select
                value={selectedLotteryId?.toString() || ""}
                onValueChange={(value) => setSelectedLotteryId(Number(value))}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="请选择彩票类型" />
                </SelectTrigger>
                <SelectContent>
                  {lotteryTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 开奖记录列表 */}
        {selectedLotteryId ? (
          isLoading ? (
            <div className="text-center text-muted-foreground py-12">加载中...</div>
          ) : draws && draws.length > 0 ? (
            <div className="space-y-4">
              {draws.map((draw) => (
                <Card key={draw.id} className="card-elegant">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        第 {draw.issueNumber} 期
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {new Date(draw.drawTime).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 flex-wrap">
                      {[
                        { num: draw.number1, color: draw.number1Color },
                        { num: draw.number2, color: draw.number2Color },
                        { num: draw.number3, color: draw.number3Color },
                        { num: draw.number4, color: draw.number4Color },
                        { num: draw.number5, color: draw.number5Color },
                        { num: draw.number6, color: draw.number6Color },
                      ].map((ball, index) => (
                        <LotteryBall
                          key={index}
                          number={ball.num || undefined}
                          color={ball.color || "gray"}
                        />
                      ))}
                      <div className="text-2xl text-primary font-bold mx-2">+</div>
                      <LotteryBall
                        number={draw.specialNumber || undefined}
                        color={draw.specialNumberColor || "gray"}
                        className="w-14 h-14 text-lg ring-4 ring-primary/30"
                      />
                      <div className="ml-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          draw.status === "completed" 
                            ? "bg-green-100 text-green-800" 
                            : draw.status === "drawing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {draw.status === "completed" ? "已开奖" : draw.status === "drawing" ? "开奖中" : "未开奖"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-elegant">
              <CardContent className="py-12 text-center text-muted-foreground">
                暂无开奖记录
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="card-elegant">
            <CardContent className="py-12 text-center text-muted-foreground">
              请先选择彩票类型
            </CardContent>
          </Card>
        )}
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
