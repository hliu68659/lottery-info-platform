import { useEffect, useState } from "react";
import { LotteryBall } from "./LotteryBall";
import { DrawCountdown } from "./DrawCountdown";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { LotteryDraw } from "../../../drizzle/schema";

interface DrawDisplayProps {
  lotteryName: string;
  draw: LotteryDraw | null;
  isCustom?: boolean;
}

export function DrawDisplay({ lotteryName, draw, isCustom = false }: DrawDisplayProps) {
  const [displayNumbers, setDisplayNumbers] = useState<Array<{
    number?: number;
    color?: "red" | "blue" | "green" | "gray";
    text?: string;
    visible: boolean;
  }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);

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
      // 显示"官方开奖同步中"
      const syncText = ["官", "方", "开", "奖", "同", "步", "中"];
      setDisplayNumbers(syncText.map((text, index) => ({
        text: index < 7 ? text : "中",
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
      setDisplayNumbers(numbers.map((num, index) => ({
        number: num.number || undefined,
        color: num.color || "gray",
        visible: false,
      })));

      // 每隔8秒显示一个号码
      numbers.forEach((num, index) => {
        setTimeout(() => {
          setDisplayNumbers(prev => {
            const newNumbers = [...prev];
            newNumbers[index] = {
              number: num.number || undefined,
              color: num.color || "gray",
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

      setDisplayNumbers(numbers.map(num => ({
        number: num.number || undefined,
        color: num.color || "gray",
        visible: true,
      })));
      setIsDrawing(false);
    } else {
      // 其他情况显示问号
      setDisplayNumbers(Array(7).fill({ visible: true, color: "gray" as const, text: "?" }));
      setIsDrawing(false);
    }
  }, [draw]);

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
                  animate={isDrawing && displayNumbers[6].visible}
                  className="w-16 h-16 text-xl ring-4 ring-primary/30"
                />
              </div>
            </>
          )}
        </div>

        {/* 倒计时 */}
        {draw && draw.nextDrawTime && draw.status === "completed" && (
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">距离下期开奖</div>
            <DrawCountdown targetTime={draw.nextDrawTime} />
          </div>
        )}

        {/* 状态提示 */}
        {draw && draw.status === "pending" && (
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
