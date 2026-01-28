import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface DrawCountdownProps {
  targetTime: Date;
  onComplete?: () => void;
  showWarning?: boolean;
}

export function DrawCountdown({ targetTime, onComplete, showWarning = true }: DrawCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isWarning: boolean;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isWarning: false });
        onComplete?.();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      // 如果剩余时间少于1小时，显示警告状态
      const isWarning = showWarning && difference < 3600000;

      setTimeLeft({ hours, minutes, seconds, isWarning });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onComplete, showWarning]);

  if (!timeLeft) {
    return <div className="text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 text-2xl font-bold transition-all ${
        timeLeft.isWarning ? "text-orange-500 animate-pulse" : "text-primary"
      }`}>
        <div className="flex flex-col items-center bg-card px-3 py-2 rounded-lg card-elegant border-2 border-current">
          <span className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">时</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center bg-card px-3 py-2 rounded-lg card-elegant border-2 border-current">
          <span className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">分</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center bg-card px-3 py-2 rounded-lg card-elegant border-2 border-current">
          <span className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">秒</span>
        </div>
      </div>
      
      {/* 警告提示 */}
      {timeLeft.isWarning && (
        <div className="flex items-center justify-center gap-2 text-sm text-orange-600 font-medium animate-pulse">
          <Zap className="w-4 h-4" />
          <span>即将开奖，请准备好！</span>
        </div>
      )}
    </div>
  );
}
