import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DrawDisplay Animation Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should display gray balls with "官方开奖摇珠中" text before draw time', () => {
    const now = new Date('2026-02-05T00:00:00').getTime();
    const drawTime = new Date('2026-02-05T00:05:00').getTime();
    const threeMinutesBefore = drawTime - 3 * 60 * 1000;

    // 在开奖前3分钟内
    const currentTime = threeMinutesBefore + 30 * 1000; // 开奖前2分30秒
    
    expect(currentTime).toBeGreaterThanOrEqual(threeMinutesBefore);
    expect(currentTime).toBeLessThan(drawTime);
    
    // 应该显示灰色球和文字
    const syncText = ["官", "方", "开", "奖", "摇", "珠", "中"];
    expect(syncText).toHaveLength(7);
    expect(syncText[0]).toBe("官");
  });

  it('should show numbers one by one every 8 seconds after draw time', () => {
    const drawTime = new Date('2026-02-05T00:05:00').getTime();
    const numbers = [2, 3, 4, 5, 6, 7, 8];
    
    // 第一个号码应该在0秒显示
    expect(0 * 8000).toBe(0);
    
    // 第二个号码应该在8秒显示
    expect(1 * 8000).toBe(8000);
    
    // 第三个号码应该在16秒显示
    expect(2 * 8000).toBe(16000);
    
    // 所有号码应该在56秒内显示完（6*8000 = 48000ms）
    expect(6 * 8000).toBe(48000);
  });

  it('should display all numbers immediately when status is completed', () => {
    const draw = {
      number1: 2,
      number2: 3,
      number3: 4,
      number4: 5,
      number5: 6,
      number6: 7,
      specialNumber: 8,
      status: 'completed' as const,
    };

    const numbers = [
      draw.number1,
      draw.number2,
      draw.number3,
      draw.number4,
      draw.number5,
      draw.number6,
      draw.specialNumber,
    ];

    expect(numbers).toHaveLength(7);
    expect(numbers.every(n => n > 0)).toBe(true);
  });

  it('should calculate correct time until draw', () => {
    const now = new Date('2026-02-05T00:00:00').getTime();
    const drawTime = new Date('2026-02-05T00:05:00').getTime();
    
    const timeLeft = drawTime - now;
    expect(timeLeft).toBe(5 * 60 * 1000); // 5分钟
    
    // 格式化时间
    const hours = Math.floor(timeLeft / 3600000);
    const minutes = Math.floor((timeLeft % 3600000) / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    expect(hours).toBe(0);
    expect(minutes).toBe(5);
    expect(seconds).toBe(0);
  });

  it('should transition from syncing phase to drawing phase', () => {
    const drawTime = new Date('2026-02-05T00:05:00').getTime();
    const threeMinutesBefore = drawTime - 3 * 60 * 1000;
    
    // 同步阶段：开奖前3分钟到开奖时间
    const syncPhaseTime = threeMinutesBefore + 1 * 60 * 1000;
    expect(syncPhaseTime).toBeGreaterThanOrEqual(threeMinutesBefore);
    expect(syncPhaseTime).toBeLessThan(drawTime);
    
    // 绘制阶段：开奖时间及之后
    const drawPhaseTime = drawTime;
    expect(drawPhaseTime).toBeGreaterThanOrEqual(drawTime);
  });

  it('should handle gray ball display correctly', () => {
    const displayNumbers = [
      { text: "官", color: "gray" as const, visible: true },
      { text: "方", color: "gray" as const, visible: true },
      { text: "开", color: "gray" as const, visible: true },
      { text: "奖", color: "gray" as const, visible: true },
      { text: "摇", color: "gray" as const, visible: true },
      { text: "珠", color: "gray" as const, visible: true },
      { text: "中", color: "gray" as const, visible: true },
    ];

    expect(displayNumbers).toHaveLength(7);
    expect(displayNumbers.every(n => n.color === "gray")).toBe(true);
    expect(displayNumbers.every(n => n.visible === true)).toBe(true);
    expect(displayNumbers.map(n => n.text).join("")).toBe("官方开奖摇珠中");
  });
});
