import { cn } from "@/lib/utils";

interface LotteryBallProps {
  number?: number;
  color?: "red" | "blue" | "green" | "gray";
  text?: string;
  className?: string;
  animate?: boolean;
}

export function LotteryBall({ number, color = "gray", text, className, animate = false }: LotteryBallProps) {
  const colorClass = {
    red: "lottery-ball-red",
    blue: "lottery-ball-blue",
    green: "lottery-ball-green",
    gray: "lottery-ball-gray",
  }[color];

  return (
    <div
      className={cn(
        "lottery-ball",
        colorClass,
        animate && "ball-appear",
        className
      )}
    >
      {text || number}
    </div>
  );
}
