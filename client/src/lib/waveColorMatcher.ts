/**
 * 波色匹配工具
 * 根据号码返回对应的波色和颜色
 */

export interface WaveColorInfo {
  waveColor: string; // 波色名称 (红/蓝/绿)
  colorCode: "red" | "blue" | "green"; // 颜色代码
  zodiac?: string; // 生肖
}

// 号码到波色的映射
const WAVE_COLOR_MAP: Record<number, WaveColorInfo> = {
  1: { waveColor: "蛇/火", colorCode: "red", zodiac: "蛇" },
  2: { waveColor: "龙/火", colorCode: "red", zodiac: "龙" },
  3: { waveColor: "兔/金", colorCode: "blue", zodiac: "兔" },
  4: { waveColor: "虎/金", colorCode: "blue", zodiac: "虎" },
  5: { waveColor: "牛/土", colorCode: "green", zodiac: "牛" },
  6: { waveColor: "鼠/土", colorCode: "green", zodiac: "鼠" },
  7: { waveColor: "猪/木", colorCode: "red", zodiac: "猪" },
  8: { waveColor: "狗/木", colorCode: "red", zodiac: "狗" },
  9: { waveColor: "鸡/火", colorCode: "red", zodiac: "鸡" },
  10: { waveColor: "猴/火", colorCode: "red", zodiac: "猴" },
  11: { waveColor: "羊/金", colorCode: "blue", zodiac: "羊" },
  12: { waveColor: "马/金", colorCode: "blue", zodiac: "马" },
  13: { waveColor: "蛇/土", colorCode: "green", zodiac: "蛇" },
  14: { waveColor: "龙/土", colorCode: "green", zodiac: "龙" },
  15: { waveColor: "兔/木", colorCode: "red", zodiac: "兔" },
  16: { waveColor: "虎/木", colorCode: "red", zodiac: "虎" },
  17: { waveColor: "牛/火", colorCode: "red", zodiac: "牛" },
  18: { waveColor: "鼠/火", colorCode: "red", zodiac: "鼠" },
  19: { waveColor: "猪/金", colorCode: "blue", zodiac: "猪" },
  20: { waveColor: "狗/金", colorCode: "blue", zodiac: "狗" },
  21: { waveColor: "鸡/土", colorCode: "green", zodiac: "鸡" },
  22: { waveColor: "猴/土", colorCode: "green", zodiac: "猴" },
  23: { waveColor: "羊/木", colorCode: "red", zodiac: "羊" },
  24: { waveColor: "马/木", colorCode: "red", zodiac: "马" },
  25: { waveColor: "蛇/金", colorCode: "blue", zodiac: "蛇" },
  26: { waveColor: "龙/金", colorCode: "blue", zodiac: "龙" },
  27: { waveColor: "兔/火", colorCode: "red", zodiac: "兔" },
  28: { waveColor: "虎/火", colorCode: "red", zodiac: "虎" },
  29: { waveColor: "牛/木", colorCode: "red", zodiac: "牛" },
  30: { waveColor: "鼠/木", colorCode: "red", zodiac: "鼠" },
  31: { waveColor: "猪/土", colorCode: "green", zodiac: "猪" },
  32: { waveColor: "狗/土", colorCode: "green", zodiac: "狗" },
  33: { waveColor: "鸡/金", colorCode: "blue", zodiac: "鸡" },
  34: { waveColor: "猴/金", colorCode: "blue", zodiac: "猴" },
  35: { waveColor: "羊/火", colorCode: "red", zodiac: "羊" },
  36: { waveColor: "马/火", colorCode: "red", zodiac: "马" },
  37: { waveColor: "蛇/木", colorCode: "red", zodiac: "蛇" },
  38: { waveColor: "龙/木", colorCode: "red", zodiac: "龙" },
  39: { waveColor: "兔/土", colorCode: "green", zodiac: "兔" },
  40: { waveColor: "虎/土", colorCode: "green", zodiac: "虎" },
  41: { waveColor: "牛/金", colorCode: "blue", zodiac: "牛" },
  42: { waveColor: "鼠/金", colorCode: "blue", zodiac: "鼠" },
  43: { waveColor: "猪/火", colorCode: "red", zodiac: "猪" },
  44: { waveColor: "狗/火", colorCode: "red", zodiac: "狗" },
  45: { waveColor: "鸡/木", colorCode: "red", zodiac: "鸡" },
  46: { waveColor: "猴/木", colorCode: "red", zodiac: "猴" },
  47: { waveColor: "羊/金", colorCode: "blue", zodiac: "羊" },
  48: { waveColor: "马/金", colorCode: "blue", zodiac: "马" },
  49: { waveColor: "龙/土", colorCode: "green", zodiac: "龙" },
};

/**
 * 根据号码获取波色信息
 */
export function getWaveColorInfo(number: number): WaveColorInfo | null {
  return WAVE_COLOR_MAP[number] || null;
}

/**
 * 获取所有波色信息
 */
export function getAllWaveColors(): Record<number, WaveColorInfo> {
  return WAVE_COLOR_MAP;
}

/**
 * 根据波色获取所有号码
 */
export function getNumbersByWaveColor(waveColor: string): number[] {
  return Object.entries(WAVE_COLOR_MAP)
    .filter(([_, info]) => info.waveColor === waveColor)
    .map(([num, _]) => parseInt(num));
}

/**
 * 根据颜色代码获取所有号码
 */
export function getNumbersByColorCode(colorCode: "red" | "blue" | "green"): number[] {
  return Object.entries(WAVE_COLOR_MAP)
    .filter(([_, info]) => info.colorCode === colorCode)
    .map(([num, _]) => parseInt(num));
}
