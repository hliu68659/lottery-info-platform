import { useEffect, useState } from "react";

interface DrawCountdownProps {
  targetTime: Date;
  onComplete?: () => void;
}

export function DrawCountdown({ targetTime, onComplete }: DrawCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        onComplete?.();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onComplete]);

  if (!timeLeft) {
    return <div className="text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="flex items-center gap-2 text-2xl font-bold">
      <div className="flex flex-col items-center bg-card px-3 py-2 rounded-lg card-elegant">
        <span className="text-3xl text-primary">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-xs text-muted-foreground">时</span>
      </div>
      <span className="text-primary">:</span>
      <div className="flex flex-col items-center bg-card px-3 py-2 rounded-lg card-elegant">
        <span className="text-3xl text-primary">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-xs text-muted-foreground">分</span>
      </div>
      <span className="text-primary">:</span>
      <div className="flex flex-col items-center bg-card px-3 py-2 rounded-lg card-elegant">
        <span className="text-3xl text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-xs text-muted-foreground">秒</span>
      </div>
    </div>
  );
}
