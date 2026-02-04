import { useEffect, useState } from "react";

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

  const timeString = `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;

  return (
    <div className="w-full">
      {/* 紫色背景横条倒计时 */}
      <div className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 px-4 rounded-lg font-bold text-center text-lg shadow-lg">
        距离下期开奖: {timeString}
      </div>
    </div>
  );
}
