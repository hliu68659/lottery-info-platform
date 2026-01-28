import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * 用户表
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 文字资料板块表
 */
export const textBlocks = mysqlTable("text_blocks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  displayOrder: int("displayOrder").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  location: mysqlEnum("location", ["home", "shensuan", "guanjiapo", "huangdaxian"]).notNull().default("home"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TextBlock = typeof textBlocks.$inferSelect;
export type InsertTextBlock = typeof textBlocks.$inferInsert;

/**
 * 图片资料板块表
 */
export const imageBlocks = mysqlTable("image_blocks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  description: text("description"),
  displayOrder: int("displayOrder").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  location: mysqlEnum("location", ["home", "shensuan", "guanjiapo", "huangdaxian"]).notNull().default("home"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ImageBlock = typeof imageBlocks.$inferSelect;
export type InsertImageBlock = typeof imageBlocks.$inferInsert;

/**
 * 号码属性配置表(生肖、波色)
 */
export const numberAttributes = mysqlTable("number_attributes", {
  id: int("id").autoincrement().primaryKey(),
  number: int("number").notNull().unique(), // 1-49
  zodiac: varchar("zodiac", { length: 20 }).notNull(), // 生肖
  color: mysqlEnum("color", ["red", "blue", "green"]).notNull(), // 波色
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NumberAttribute = typeof numberAttributes.$inferSelect;
export type InsertNumberAttribute = typeof numberAttributes.$inferInsert;

/**
 * 开奖系统配置表
 */
export const lotteryTypes = mysqlTable("lottery_types", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // xinao_midnight, xinao, hongkong, laoao
  name: varchar("name", { length: 100 }).notNull(),
  isCustom: boolean("isCustom").notNull().default(false), // 是否自定义开奖
  apiUrl: text("apiUrl"), // 官方API地址
  intervalHours: int("intervalHours").notNull().default(2), // 开奖间隔(小时)
  displayOrder: int("displayOrder").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LotteryType = typeof lotteryTypes.$inferSelect;
export type InsertLotteryType = typeof lotteryTypes.$inferInsert;

/**
 * 开奖记录表
 */
export const lotteryDraws = mysqlTable("lottery_draws", {
  id: int("id").autoincrement().primaryKey(),
  lotteryTypeId: int("lotteryTypeId").notNull(),
  issueNumber: varchar("issueNumber", { length: 50 }).notNull(), // 期号
  year: int("year").notNull(),
  drawTime: timestamp("drawTime").notNull(), // 开奖时间
  status: mysqlEnum("status", ["pending", "drawing", "completed"]).notNull().default("pending"),
  
  // 7个号码及其属性
  number1: int("number1"),
  number1Zodiac: varchar("number1Zodiac", { length: 20 }),
  number1Color: mysqlEnum("number1Color", ["red", "blue", "green"]),
  
  number2: int("number2"),
  number2Zodiac: varchar("number2Zodiac", { length: 20 }),
  number2Color: mysqlEnum("number2Color", ["red", "blue", "green"]),
  
  number3: int("number3"),
  number3Zodiac: varchar("number3Zodiac", { length: 20 }),
  number3Color: mysqlEnum("number3Color", ["red", "blue", "green"]),
  
  number4: int("number4"),
  number4Zodiac: varchar("number4Zodiac", { length: 20 }),
  number4Color: mysqlEnum("number4Color", ["red", "blue", "green"]),
  
  number5: int("number5"),
  number5Zodiac: varchar("number5Zodiac", { length: 20 }),
  number5Color: mysqlEnum("number5Color", ["red", "blue", "green"]),
  
  number6: int("number6"),
  number6Zodiac: varchar("number6Zodiac", { length: 20 }),
  number6Color: mysqlEnum("number6Color", ["red", "blue", "green"]),
  
  specialNumber: int("specialNumber"), // 特码
  specialNumberZodiac: varchar("specialNumberZodiac", { length: 20 }),
  specialNumberColor: mysqlEnum("specialNumberColor", ["red", "blue", "green"]),
  
  nextDrawTime: timestamp("nextDrawTime"), // 下期开奖时间
  nextIssueNumber: varchar("nextIssueNumber", { length: 50 }), // 下期期号
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LotteryDraw = typeof lotteryDraws.$inferSelect;
export type InsertLotteryDraw = typeof lotteryDraws.$inferInsert;

/**
 * 生肖卡图片配置表
 */
export const zodiacCards = mysqlTable("zodiac_cards", {
  id: int("id").autoincrement().primaryKey(),
  imageUrl: text("imageUrl").notNull(),
  year: int("year").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ZodiacCard = typeof zodiacCards.$inferSelect;
export type InsertZodiacCard = typeof zodiacCards.$inferInsert;
