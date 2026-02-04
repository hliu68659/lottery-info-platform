import { useEffect, useState, useCallback } from "react";
import { LotteryBall } from "./LotteryBall";
import { DrawCountdown } from "./DrawCountdown";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Clock, CheckCircle2, Zap } from "lucide-react";
import { getWaveColorInfo } from "@/lib/waveColorMatcher";
import type { LotteryDraw } from "../../../drizzle/schema";

interface DrawDisplayProps {
  lotteryName: string;
  draw: LotteryDraw | null;
  isCustom?: boolean;
}

interface DisplayNumber {
  number?: number;
  color?: "red" | "blue" | "green" | "gray";
  text?: string;
  zodiac?: string;
  waveColor?: string;
  visible: boolean;
}

export function DrawDisplay({ lotteryName, draw, isCustom = false }: DrawDisplayProps) {
  const [displayNumbers, setDisplayNumbers] = useState<DisplayNumber[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeUntilDraw, setTimeUntilDraw] = useState<number | null>(null);
  const [isSyncingPhase, setIsSyncingPhase] = useState(false);

  // 计算距离开奖的时间
  const updateTimeUntilDraw = useCallback(() => {
    if (!draw) {
      setTimeUntilDraw(null);
      setIsSyncingPhase(false);
      return;
    }

    const now = new Date().getTime();
    const drawTime = new Date(draw.drawTime).getTime();
    const threeMinutesBefore = drawTime - 3 * 60 * 1000;

    if (draw.status === "pending") {
      const timeLeft = drawTime - now;
      setTimeUntilDraw(Math.max(0, timeLeft));
      
      // 检查是否在同步阶段（开奖前3分钟）
      setIsSyncingPhase(now >= threeMinutesBefore && now < drawTime);
    } else {
      setTimeUntilDraw(null);
      setIsSyncingPhase(false);
    }
  }, [draw]);

  useEffect(() => {
    if (!draw) {
      // 没有开奖数据时显示等待状态
      setDisplayNumbers(Array(7).fill({ visible: true, color: "gray" as const, text: "?" }));
      return;
    }

    const now = new Date().getTime();
    const drawTime = new Date(draw.drawTime).getTime();
    const threeMinutesBefore = drawTime - 3 * 60 * 1000;

    // 如果是待开奖状态且在开奖前3分钟内
    if (draw.status === "pending" && now >= threeMinutesBefore && now < drawTime) {
      // 显示"官方开奖同步中" - 灰色球体
      const syncText = ["官", "方", "开", "奖", "同", "步", "中"];
      setDisplayNumbers(syncText.map((text) => ({
        text,
        color: "gray" as const,
        visible: true,
      })));
      setIsDrawing(false);
    } else if (draw.status === "drawing" || (draw.status === "pending" && now >= drawTime)) {
      // 开奖中或已到开奖时间 - 逐个显示号码
      setIsDrawing(true);
      const numbers = [
        { number: draw.number1, color: draw.number1Color },
        { number: draw.number2, color: draw.number2Color },
        { number: draw.number3, color: draw.number3Color },
        { number: draw.number4, color: draw.number4Color },
        { number: draw.number5, color: draw.number5Color },
        { number: draw.number6, color: draw.number6Color },
        { number: draw.specialNumber, color: draw.specialNumberColor },
      ];

      // 初始化所有号码为不可见
      setDisplayNumbers(numbers.map((num) => {
        const waveInfo = num.number ? getWaveColorInfo(num.number) : null;
        return {
          number: num.number || undefined,
          color: num.color || "gray",
          zodiac: waveInfo?.zodiac,
          waveColor: waveInfo?.waveColor,
          visible: false,
        };
      }));

      // 每隔8秒显示一个号码
      numbers.forEach((num, index) => {
        setTimeout(() => {
          setDisplayNumbers(prev => {
            const waveInfo = num.number ? getWaveColorInfo(num.number) : null;
            const newNumbers = [...prev];
            newNumbers[index] = {
              number: num.number || undefined,
              color: num.color || "gray",
              zodiac: waveInfo?.zodiac,
              waveColor: waveInfo?.waveColor,
              visible: true,
            };
            return newNumbers;
          });
        }, index * 8000);
      });
    } else if (draw.status === "completed") {
      // 已完成 - 显示所有号码
      const numbers = [
        { number: draw.number1, color: draw.number1Color },
        { number: draw.number2, color: draw.number2Color },
        { number: draw.number3, color: draw.number3Color },
        { number: draw.number4, color: draw.number4Color },
        { number: draw.number5, color: draw.number5Color },
        { number: draw.number6, color: draw.number6Color },
        { number: draw.specialNumber, color: draw.specialNumberColor },
      ];

      setDisplayNumbers(numbers.map(num => {
        const waveInfo = num.number ? getWaveColorInfo(num.number) : null;
        return {
          number: num.number || undefined,
          color: num.color || "gray",
          zodiac: waveInfo?.zodiac,
          waveColor: waveInfo?.waveColor,
          visible: true,
        };
      }));
      setIsDrawing(false);
    } else {
      // 其他情况显示问号
      setDisplayNumbers(Array(7).fill({ visible: true, color: "gray" as const, text: "?" }));
      setIsDrawing(false);
    }

    updateTimeUntilDraw();
  }, [draw, updateTimeUntilDraw]);

  // 每秒更新倒计时
  useEffect(() => {
    const timer = setInterval(updateTimeUntilDraw, 1000);
    return () => clearInterval(timer);
  }, [updateTimeUntilDraw]);

  const formatTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}小时${minutes}分钟${seconds}秒`;
  };

  return (
    <Card className="card-elegant">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center golden-shine bg-clip-text text-transparent">
          {lotteryName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 期号和开奖时间 */}
        {draw && (
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold">
              第 <span className="text-primary">{draw.issueNumber}</span> 期
            </div>
            <div className="text-sm text-muted-foreground">
              开奖时间: {new Date(draw.drawTime).toLocaleString('zh-CN')}
            </div>
            
            {/* 倒计时显示 */}
            {draw.status === "pending" && timeUntilDraw !== null && (
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary mt-3">
                <Clock className="w-4 h-4" />
                <span>{formatTimeLeft(timeUntilDraw)}后开奖</span>
              </div>
            )}
            
            {/* 同步阶段提示 */}
            {isSyncingPhase && (
              <div className="flex items-center justify-center gap-2 text-xs text-yellow-600 font-medium animate-pulse">
                <Zap className="w-3 h-3" />
                官方开奖数据同步中...
              </div>
            )}
            
            {/* 已完成提示 */}
            {draw.status === "completed" && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>开奖已完成</span>
              </div>
            )}
          </div>
        )}

        {/* 开奖号码 */}
        <div className="flex justify-center items-center gap-3 flex-wrap">
          {displayNumbers.slice(0, 6).map((ball, index) => (
            <div key={index} className={ball.visible ? "block" : "invisible"}>
              <LotteryBall
                number={ball.number}
                color={ball.color}
                text={ball.text}
                zodiac={ball.zodiac}
                waveColor={ball.waveColor}
                animate={isDrawing && ball.visible}
              />
            </div>
          ))}
          {displayNumbers[6] && (
            <>
              <div className="text-3xl text-primary font-bold mx-2">+</div>
              <div className={displayNumbers[6].visible ? "block" : "invisible"}>
                <LotteryBall
                  number={displayNumbers[6].number}
                  color={displayNumbers[6].color}
                  text={displayNumbers[6].text}
                  zodiac={displayNumbers[6].zodiac}
                  waveColor={displayNumbers[6].waveColor}
                  animate={isDrawing && displayNumbers[6].visible}
                  className="w-16 h-16 text-xl ring-4 ring-primary/30"
                />
              </div>
            </>
          )}
        </div>

        {/* 下期倒计时 */}
        {draw && draw.nextDrawTime && draw.status === "completed" && (
          <div className="text-center space-y-3 pt-4 border-t border-border">
            <div className="text-sm font-medium text-muted-foreground">距离下期开奖</div>
            <DrawCountdown targetTime={draw.nextDrawTime} />
          </div>
        )}

        {/* 状态提示 */}
        {draw && draw.status === "pending" && !isSyncingPhase && (
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              等待开奖
            </span>
          </div>
        )}
        {draw && draw.status === "drawing" && (
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium animate-pulse">
              开奖中...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
