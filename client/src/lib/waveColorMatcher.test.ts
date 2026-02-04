import { describe, it, expect } from "vitest";
import {
  getWaveColorInfo,
  getAllWaveColors,
  getNumbersByWaveColor,
  getNumbersByColorCode,
} from "./waveColorMatcher";

describe("Wave Color Matcher", () => {
  describe("getWaveColorInfo", () => {
    it("should return correct wave color info for number 1", () => {
      const info = getWaveColorInfo(1);
      expect(info).toBeDefined();
      expect(info?.waveColor).toBe("蛇/火");
      expect(info?.colorCode).toBe("red");
      expect(info?.zodiac).toBe("蛇");
    });

    it("should return correct wave color info for number 5", () => {
      const info = getWaveColorInfo(5);
      expect(info).toBeDefined();
      expect(info?.waveColor).toBe("牛/土");
      expect(info?.colorCode).toBe("green");
      expect(info?.zodiac).toBe("牛");
    });

    it("should return correct wave color info for number 3", () => {
      const info = getWaveColorInfo(3);
      expect(info).toBeDefined();
      expect(info?.waveColor).toBe("兔/金");
      expect(info?.colorCode).toBe("blue");
      expect(info?.zodiac).toBe("兔");
    });

    it("should return null for invalid number", () => {
      const info = getWaveColorInfo(50);
      expect(info).toBeNull();
    });

    it("should return null for negative number", () => {
      const info = getWaveColorInfo(-1);
      expect(info).toBeNull();
    });

    it("should return null for zero", () => {
      const info = getWaveColorInfo(0);
      expect(info).toBeNull();
    });
  });

  describe("getAllWaveColors", () => {
    it("should return all wave color mappings", () => {
      const allColors = getAllWaveColors();
      expect(Object.keys(allColors).length).toBe(49);
    });

    it("should contain entries for numbers 1-49", () => {
      const allColors = getAllWaveColors();
      for (let i = 1; i <= 49; i++) {
        expect(allColors[i]).toBeDefined();
      }
    });
  });

  describe("getNumbersByWaveColor", () => {
    it("should return numbers for red wave color", () => {
      const numbers = getNumbersByWaveColor("蛇/火");
      expect(numbers).toContain(1);
      expect(numbers.length).toBeGreaterThan(0);
    });

    it("should return empty array for non-existent wave color", () => {
      const numbers = getNumbersByWaveColor("非存在的波色");
      expect(numbers).toEqual([]);
    });
  });

  describe("getNumbersByColorCode", () => {
    it("should return numbers for red color code", () => {
      const numbers = getNumbersByColorCode("red");
      expect(numbers.length).toBeGreaterThan(0);
      expect(numbers).toContain(1);
    });

    it("should return numbers for blue color code", () => {
      const numbers = getNumbersByColorCode("blue");
      expect(numbers.length).toBeGreaterThan(0);
      expect(numbers).toContain(3);
    });

    it("should return numbers for green color code", () => {
      const numbers = getNumbersByColorCode("green");
      expect(numbers.length).toBeGreaterThan(0);
      expect(numbers).toContain(5);
    });

    it("should have different numbers for different color codes", () => {
      const redNumbers = getNumbersByColorCode("red");
      const blueNumbers = getNumbersByColorCode("blue");
      const greenNumbers = getNumbersByColorCode("green");

      // 确保不同颜色的号码集合不重叠
      const redSet = new Set(redNumbers);
      const blueSet = new Set(blueNumbers);
      const greenSet = new Set(greenNumbers);

      for (const num of redNumbers) {
        expect(blueSet.has(num) || greenSet.has(num)).toBe(false);
      }
    });
  });

  describe("Color distribution", () => {
    it("should have balanced color distribution", () => {
      const allColors = getAllWaveColors();
      const redCount = Object.values(allColors).filter(c => c.colorCode === "red").length;
      const blueCount = Object.values(allColors).filter(c => c.colorCode === "blue").length;
      const greenCount = Object.values(allColors).filter(c => c.colorCode === "green").length;

      // 三种颜色应该大致均匀分布
      expect(redCount + blueCount + greenCount).toBe(49);
      expect(Math.abs(redCount - blueCount)).toBeLessThanOrEqual(2);
      expect(Math.abs(blueCount - greenCount)).toBeLessThanOrEqual(2);
    });

    it("should have all 12 zodiacs represented", () => {
      const allColors = getAllWaveColors();
      const zodiacs = new Set(Object.values(allColors).map(c => c.zodiac));
      expect(zodiacs.size).toBe(12);
    });
  });
});
