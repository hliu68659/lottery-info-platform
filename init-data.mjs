import { drizzle } from "drizzle-orm/mysql2";
import { lotteryTypes, numberAttributes, zodiacCards } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// 初始化彩票类型
const lotteryTypesData = [
  {
    code: "xinao_midnight",
    name: "新澳午夜彩",
    isCustom: true,
    intervalHours: 2,
    displayOrder: 1,
    enabled: true,
  },
  {
    code: "xinao",
    name: "新奥彩",
    isCustom: false,
    apiUrl: "https://api.example.com/xinao",
    intervalHours: 24,
    displayOrder: 2,
    enabled: true,
  },
  {
    code: "hongkong",
    name: "香港彩",
    isCustom: false,
    apiUrl: "https://api.example.com/hongkong",
    intervalHours: 24,
    displayOrder: 3,
    enabled: true,
  },
  {
    code: "laoao",
    name: "老澳彩",
    isCustom: false,
    apiUrl: "https://api.example.com/laoao",
    intervalHours: 24,
    displayOrder: 4,
    enabled: true,
  },
];

// 初始化号码属性(生肖和波色)
const zodiacs = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const colors = ["red", "blue", "green"];

const numberAttributesData = [];
for (let i = 1; i <= 49; i++) {
  const zodiac = zodiacs[(i - 1) % 12];
  const color = colors[(i - 1) % 3];
  numberAttributesData.push({
    number: i,
    zodiac,
    color,
  });
}

async function initData() {
  try {
    console.log("开始初始化数据...");

    // 插入彩票类型
    console.log("插入彩票类型...");
    for (const type of lotteryTypesData) {
      await db.insert(lotteryTypes).values(type).onDuplicateKeyUpdate({ set: { enabled: true } });
    }

    // 插入号码属性
    console.log("插入号码属性...");
    for (const attr of numberAttributesData) {
      await db.insert(numberAttributes).values(attr).onDuplicateKeyUpdate({ 
        set: { zodiac: attr.zodiac, color: attr.color } 
      });
    }

    console.log("数据初始化完成!");
  } catch (error) {
    console.error("数据初始化失败:", error);
    process.exit(1);
  }
}

initData();
