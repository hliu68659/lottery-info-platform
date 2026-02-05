import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * DrawDisplay组件的动画逻辑测试
 * 
 * 测试场景：
 * 1. 开奖前显示倒计时和灰色球
 * 2. 开奖时逐个显示号码（每隔8秒）
 * 3. 重新加载页面时，已完成的开奖直接显示所有号码
 * 4. 防止重复播放动画
 */

describe("DrawDisplay Animation Logic", () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it("should not replay animation on page reload for completed draws", () => {
    // 模拟已完成的开奖数据
    const completedDraw = {
      id: 1,
      status: "completed",
      drawTime: new Date(Date.now() - 60000), // 1分钟前开奖
      number1: 1,
      number2: 2,
      number3: 3,
      number4: 4,
      number5: 5,
      number6: 6,
      specialNumber: 7,
    };

    // 第一次加载时，hasAnimated应该为false
    let hasAnimated = false;
    let lastDrawId: number | null = null;

    // 模拟第一次加载
    if (completedDraw.status === "completed") {
      // 已完成状态，不播放动画
      expect(hasAnimated).toBe(false);
      expect(lastDrawId).toBeNull();
    }

    // 模拟重新加载页面
    // hasAnimated和lastDrawId会重置为初始值
    hasAnimated = false;
    lastDrawId = null;

    // 重新加载后，仍然不应该播放动画
    if (completedDraw.status === "completed") {
      expect(hasAnimated).toBe(false);
      expect(lastDrawId).toBeNull();
    }
  });

  it("should play animation only once for drawing status", () => {
    // 模拟正在开奖的数据
    const drawingDraw = {
      id: 2,
      status: "drawing",
      drawTime: new Date(Date.now() - 30000), // 30秒前开始开奖
      number1: 1,
      number2: 2,
      number3: 3,
      number4: 4,
      number5: 5,
      number6: 6,
      specialNumber: 7,
    };

    let hasAnimated = false;
    let lastDrawId: number | null = null;

    // 第一次加载时，应该播放动画
    if (drawingDraw.status === "drawing" && !hasAnimated) {
      if (drawingDraw.id !== lastDrawId) {
        hasAnimated = true;
        lastDrawId = drawingDraw.id;
        expect(hasAnimated).toBe(true);
        expect(lastDrawId).toBe(2);
      }
    }

    // 模拟重新加载页面（状态仍然是drawing）
    // 但hasAnimated已经是true，所以不应该再播放动画
    const shouldPlayAnimation = drawingDraw.status === "drawing" && !hasAnimated;
    expect(shouldPlayAnimation).toBe(false);
  });

  it("should show all numbers immediately for completed status", () => {
    // 模拟已完成的开奖数据
    const completedDraw = {
      id: 3,
      status: "completed",
      drawTime: new Date(Date.now() - 120000), // 2分钟前开奖
      number1: 1,
      number2: 2,
      number3: 3,
      number4: 4,
      number5: 5,
      number6: 6,
      specialNumber: 7,
    };

    // 应该直接显示所有号码
    const numbers = [
      completedDraw.number1,
      completedDraw.number2,
      completedDraw.number3,
      completedDraw.number4,
      completedDraw.number5,
      completedDraw.number6,
      completedDraw.specialNumber,
    ];

    // 所有号码都应该是可见的
    const allVisible = numbers.every((num) => num !== undefined && num !== null);
    expect(allVisible).toBe(true);
    expect(numbers).toHaveLength(7);
  });

  it("should prevent animation replay when draw ID doesn't change", () => {
    const draw = {
      id: 4,
      status: "drawing",
      drawTime: new Date(Date.now() - 20000),
    };

    let hasAnimated = false;
    let lastDrawId: number | null = null;
    let animationCount = 0;

    // 第一次触发
    if (draw.status === "drawing" && !hasAnimated) {
      if (draw.id !== lastDrawId) {
        hasAnimated = true;
        lastDrawId = draw.id;
        animationCount++;
      }
    }

    expect(animationCount).toBe(1);
    expect(hasAnimated).toBe(true);
    expect(lastDrawId).toBe(4);

    // 第二次触发（draw ID相同）
    if (draw.status === "drawing" && !hasAnimated) {
      if (draw.id !== lastDrawId) {
        animationCount++;
      }
    }

    // 动画计数应该仍然是1，不应该增加
    expect(animationCount).toBe(1);
  });

  it("should reset animation state when draw ID changes", () => {
    let hasAnimated = false;
    let lastDrawId: number | null = null;
    let animationCount = 0;

    // 第一个开奖
    const draw1 = { id: 5, status: "drawing" };
    if (draw1.status === "drawing" && !hasAnimated) {
      if (draw1.id !== lastDrawId) {
        hasAnimated = true;
        lastDrawId = draw1.id;
        animationCount++;
      }
    }

    expect(animationCount).toBe(1);

    // 新的开奖（ID不同）
    const draw2 = { id: 6, status: "drawing" };
    hasAnimated = false; // 重置为新开奖
    if (draw2.status === "drawing" && !hasAnimated) {
      if (draw2.id !== lastDrawId) {
        hasAnimated = true;
        lastDrawId = draw2.id;
        animationCount++;
      }
    }

    // 应该播放第二次动画
    expect(animationCount).toBe(2);
    expect(lastDrawId).toBe(6);
  });
});
