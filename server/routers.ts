import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import * as db from "./db";
import { 
  textBlocks, 
  imageBlocks, 
  lotteryDraws, 
  lotteryTypes, 
  numberAttributes,
  zodiacCards 
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

// 管理员权限检查中间件
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: '需要管理员权限' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ 文字资料板块 ============
  textBlocks: router({
    list: publicProcedure
      .input(z.object({
        location: z.enum(["home", "shensuan", "guanjiapo", "huangdaxian"]).optional(),
        visibleOnly: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTextBlocks(input.location, input.visibleOnly);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTextBlockById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        displayOrder: z.number().default(0),
        visible: z.boolean().default(true),
        location: z.enum(["home", "shensuan", "guanjiapo", "huangdaxian"]).default("home"),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        const result = await database.insert(textBlocks).values(input);
        return { id: Number(result[0].insertId), success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        displayOrder: z.number().optional(),
        visible: z.boolean().optional(),
        location: z.enum(["home", "shensuan", "guanjiapo", "huangdaxian"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        const { id, ...updates } = input;
        await database.update(textBlocks).set(updates).where(eq(textBlocks.id, id));
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        await database.delete(textBlocks).where(eq(textBlocks.id, input.id));
        return { success: true };
      }),
  }),

  // ============ 图片资料板块 ============
  imageBlocks: router({
    list: publicProcedure
      .input(z.object({
        location: z.enum(["home", "shensuan", "guanjiapo", "huangdaxian"]).optional(),
        visibleOnly: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getImageBlocks(input.location, input.visibleOnly);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getImageBlockById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string(),
        imageUrl: z.string(),
        description: z.string().optional(),
        displayOrder: z.number().default(0),
        visible: z.boolean().default(true),
        location: z.enum(["home", "shensuan", "guanjiapo", "huangdaxian"]).default("home"),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        const result = await database.insert(imageBlocks).values(input);
        return { id: Number(result[0].insertId), success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        imageUrl: z.string().optional(),
        description: z.string().optional(),
        displayOrder: z.number().optional(),
        visible: z.boolean().optional(),
        location: z.enum(["home", "shensuan", "guanjiapo", "huangdaxian"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        const { id, ...updates } = input;
        await database.update(imageBlocks).set(updates).where(eq(imageBlocks.id, id));
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        await database.delete(imageBlocks).where(eq(imageBlocks.id, input.id));
        return { success: true };
      }),
  }),

  // ============ 号码属性 ============
  numberAttributes: router({
    getByNumber: publicProcedure
      .input(z.object({ number: z.number().min(1).max(49) }))
      .query(async ({ input }) => {
        return await db.getNumberAttribute(input.number);
      }),
    
    getAll: publicProcedure.query(async () => {
      return await db.getAllNumberAttributes();
    }),
    
    update: adminProcedure
      .input(z.object({
        number: z.number().min(1).max(49),
        zodiac: z.string(),
        color: z.enum(["red", "blue", "green"]),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        await database
          .insert(numberAttributes)
          .values(input)
          .onDuplicateKeyUpdate({ set: { zodiac: input.zodiac, color: input.color } });
        
        return { success: true };
      }),
  }),

  // ============ 彩票类型 ============
  lotteryTypes: router({
    list: publicProcedure
      .input(z.object({ enabledOnly: z.boolean().optional() }))
      .query(async ({ input }) => {
        return await db.getLotteryTypes(input.enabledOnly);
      }),
    
    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return await db.getLotteryTypeByCode(input.code);
      }),
  }),

  // ============ 开奖记录 ============
  lotteryDraws: router({
    list: publicProcedure
      .input(z.object({
        lotteryTypeId: z.number().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getLotteryDraws(input.lotteryTypeId, input.limit);
      }),
    
    getLatest: publicProcedure
      .input(z.object({ lotteryTypeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLatestDraw(input.lotteryTypeId);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getLotteryDrawById(input.id);
      }),
    
    // 快捷开奖 - 自动计算期号和时间
    quickCreate: adminProcedure
      .input(z.object({
        lotteryTypeId: z.number(),
        numbers: z.array(z.number().min(1).max(49)).length(7),
        drawTime: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        // 获取彩票类型信息
        const lotteryType = await db.getLotteryTypeById(input.lotteryTypeId);
        if (!lotteryType) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '彩票类型不存在' });
        }
        
        // 获取上一期记录
        const latestDraw = await db.getLatestDraw(input.lotteryTypeId);
        
        // 自动计算期号
        let issueNumber: string;
        let year = new Date().getFullYear();
        
        if (latestDraw) {
          const latestIssueNum = parseInt(latestDraw.issueNumber);
          issueNumber = String(latestIssueNum + 1).padStart(3, '0');
          year = latestDraw.year;
        } else {
          issueNumber = '001';
        }
        
        // 自动计算开奖时间(如果没有提供)
        const drawTime = input.drawTime || (latestDraw 
          ? new Date(latestDraw.drawTime.getTime() + lotteryType.intervalHours * 60 * 60 * 1000)
          : new Date());
        
        // 计算下期开奖时间和期号
        const nextDrawTime = new Date(drawTime.getTime() + lotteryType.intervalHours * 60 * 60 * 1000);
        const nextIssueNumber = String(parseInt(issueNumber) + 1).padStart(3, '0');
        
        // 自动识别号码属性
        const attributes = await Promise.all(
          input.numbers.map(num => db.getNumberAttribute(num))
        );
        
        // 构建开奖记录
        const drawData: any = {
          lotteryTypeId: input.lotteryTypeId,
          issueNumber,
          year,
          drawTime,
          status: 'pending',
          nextDrawTime,
          nextIssueNumber,
        };
        
        // 填充7个号码及其属性
        input.numbers.forEach((num, index) => {
          const attr = attributes[index];
          if (index < 6) {
            drawData[`number${index + 1}`] = num;
            drawData[`number${index + 1}Zodiac`] = attr?.zodiac || null;
            drawData[`number${index + 1}Color`] = attr?.color || null;
          } else {
            drawData.specialNumber = num;
            drawData.specialNumberZodiac = attr?.zodiac || null;
            drawData.specialNumberColor = attr?.color || null;
          }
        });
        
        const result = await database.insert(lotteryDraws).values(drawData);
        return { id: Number(result[0].insertId), success: true, issueNumber, drawTime, nextDrawTime };
      }),
    
    // 更新开奖记录
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        numbers: z.array(z.number().min(1).max(49)).length(7).optional(),
        drawTime: z.date().optional(),
        status: z.enum(["pending", "drawing", "completed"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        const updates: any = {};
        
        if (input.drawTime) {
          updates.drawTime = input.drawTime;
        }
        
        if (input.status) {
          updates.status = input.status;
        }
        
        // 如果更新号码,重新识别属性
        if (input.numbers) {
          const attributes = await Promise.all(
            input.numbers.map(num => db.getNumberAttribute(num))
          );
          
          input.numbers.forEach((num, index) => {
            const attr = attributes[index];
            if (index < 6) {
              updates[`number${index + 1}`] = num;
              updates[`number${index + 1}Zodiac`] = attr?.zodiac || null;
              updates[`number${index + 1}Color`] = attr?.color || null;
            } else {
              updates.specialNumber = num;
              updates.specialNumberZodiac = attr?.zodiac || null;
              updates.specialNumberColor = attr?.color || null;
            }
          });
        }
        
        await database.update(lotteryDraws).set(updates).where(eq(lotteryDraws.id, input.id));
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        await database.delete(lotteryDraws).where(eq(lotteryDraws.id, input.id));
        return { success: true };
      }),
  }),

  // ============ 生肖卡 ============
  zodiacCards: router({
    getActive: publicProcedure.query(async () => {
      return await db.getActiveZodiacCard();
    }),
    
    getAll: adminProcedure.query(async () => {
      return await db.getAllZodiacCards();
    }),
    
    create: adminProcedure
      .input(z.object({
        imageUrl: z.string(),
        year: z.number(),
        active: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        // 如果设置为活跃,先将其他卡片设为非活跃
        if (input.active) {
          await database.update(zodiacCards).set({ active: false });
        }
        
        const result = await database.insert(zodiacCards).values(input);
        return { id: Number(result[0].insertId), success: true };
      }),
    
    setActive: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        // 先将所有卡片设为非活跃
        await database.update(zodiacCards).set({ active: false });
        // 再将指定卡片设为活跃
        await database.update(zodiacCards).set({ active: true }).where(eq(zodiacCards.id, input.id));
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
