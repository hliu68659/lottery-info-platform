import { eq, and, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  textBlocks,
  imageBlocks,
  numberAttributes,
  lotteryTypes,
  lotteryDraws,
  zodiacCards,
  type TextBlock,
  type ImageBlock,
  type NumberAttribute,
  type LotteryType,
  type LotteryDraw,
  type ZodiacCard,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ 用户相关 ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ 文字资料板块 ============
export async function getTextBlocks(location?: string, visibleOnly = false) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(textBlocks);
  
  const conditions = [];
  if (location) {
    conditions.push(eq(textBlocks.location, location as any));
  }
  if (visibleOnly) {
    conditions.push(eq(textBlocks.visible, true));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(asc(textBlocks.displayOrder));
}

export async function getTextBlockById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(textBlocks).where(eq(textBlocks.id, id)).limit(1);
  return result[0] || null;
}

// ============ 图片资料板块 ============
export async function getImageBlocks(location?: string, visibleOnly = false) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(imageBlocks);
  
  const conditions = [];
  if (location) {
    conditions.push(eq(imageBlocks.location, location as any));
  }
  if (visibleOnly) {
    conditions.push(eq(imageBlocks.visible, true));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(asc(imageBlocks.displayOrder));
}

export async function getImageBlockById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(imageBlocks).where(eq(imageBlocks.id, id)).limit(1);
  return result[0] || null;
}

// ============ 号码属性 ============
export async function getNumberAttribute(number: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(numberAttributes).where(eq(numberAttributes.number, number)).limit(1);
  return result[0] || null;
}

export async function getAllNumberAttributes() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(numberAttributes).orderBy(asc(numberAttributes.number));
}

// ============ 彩票类型 ============
export async function getLotteryTypes(enabledOnly = false) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(lotteryTypes);
  
  if (enabledOnly) {
    query = query.where(eq(lotteryTypes.enabled, true)) as any;
  }
  
  return await query.orderBy(asc(lotteryTypes.displayOrder));
}

export async function getLotteryTypeByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(lotteryTypes).where(eq(lotteryTypes.code, code)).limit(1);
  return result[0] || null;
}

export async function getLotteryTypeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(lotteryTypes).where(eq(lotteryTypes.id, id)).limit(1);
  return result[0] || null;
}

// ============ 开奖记录 ============
export async function getLotteryDraws(lotteryTypeId?: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(lotteryDraws);
  
  if (lotteryTypeId) {
    query = query.where(eq(lotteryDraws.lotteryTypeId, lotteryTypeId)) as any;
  }
  
  return await query.orderBy(desc(lotteryDraws.drawTime)).limit(limit);
}

export async function getLatestDraw(lotteryTypeId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(lotteryDraws)
    .where(eq(lotteryDraws.lotteryTypeId, lotteryTypeId))
    .orderBy(desc(lotteryDraws.drawTime))
    .limit(1);
  
  return result[0] || null;
}

export async function getLotteryDrawById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(lotteryDraws).where(eq(lotteryDraws.id, id)).limit(1);
  return result[0] || null;
}

export async function getPendingDraws() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(lotteryDraws)
    .where(eq(lotteryDraws.status, "pending"))
    .orderBy(asc(lotteryDraws.drawTime));
}

// ============ 生肖卡 ============
export async function getActiveZodiacCard() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(zodiacCards)
    .where(eq(zodiacCards.active, true))
    .orderBy(desc(zodiacCards.year))
    .limit(1);
  
  return result[0] || null;
}

export async function getAllZodiacCards() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(zodiacCards).orderBy(desc(zodiacCards.year));
}
