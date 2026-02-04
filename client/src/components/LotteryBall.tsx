import { cn } from "@/lib/utils";

interface LotteryBallProps {
  number?: number;
  color?: "red" | "blue" | "green" | "gray";
  zodiac?: string; // 生肖
  waveColor?: string; // 波色
  text?: string;
  className?: string;
  animate?: boolean;
}

export function LotteryBall({ number, color = "gray", zodiac, waveColor, text, className, animate = false }: LotteryBallProps) {
  const colorClass = {
    red: "bg-red-500 hover:bg-red-600",
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    gray: "bg-gray-400 hover:bg-gray-500",
  }[color];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-20 h-20 rounded-full font-bold text-white shadow-lg transition-all duration-300",
        colorClass,
        animate && "ball-appear scale-110",
        className
      )}
    >
      <div className="text-xl font-bold">
        {text || (number ? String(number).padStart(2, '0') : '?')}
      </div>
      {(zodiac || waveColor) && (
        <div className="text-xs font-semibold mt-0.5 leading-none">
          {zodiac && <div>{zodiac}</div>}
          {waveColor && <div>{waveColor}</div>}
        </div>
      )}
    </div>
  );
}
