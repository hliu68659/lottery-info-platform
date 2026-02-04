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
import { eq, desc } from "drizzle-orm";
import { generateImageFromText, generateImageByType } from "./imageGeneration";
import { storagePut } from "../server/storage";
import jwt from "jsonwebtoken";

// 管理员权限检查中间件
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: '需要管理员权限' });
  }
  return next({ ctx });
});

// 后台登入凭证
const ADMIN_USERNAME = "kaijiang";
const ADMIN_PASSWORD = "kaijiang1866333";

export const appRouter = router({
  system: systemRouter,
  
  // ============ 后台登入 ============
  admin: router({
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (input.username !== ADMIN_USERNAME || input.password !== ADMIN_PASSWORD) {
          throw new TRPCError({ 
            code: 'UNAUTHORIZED', 
            message: '账号或密码错误' 
          });
        }

        // 生成JWT token
        const token = jwt.sign(
          { username: ADMIN_USERNAME, type: 'admin' },
          process.env.JWT_SECRET || 'default-secret',
          { expiresIn: '7d' }
        );

        return { success: true, token };
      }),
  }),
  
  // ============ 文件上传 ============
  upload: router({
    image: protectedProcedure
      .input(z.object({
        filename: z.string(),
        base64: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const buffer = Buffer.from(input.base64, 'base64');
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8);
          const fileKey = `materials/${ctx.user.id}/${timestamp}-${random}-${input.filename}`;
          const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
          return { url };
        } catch (error) {
          console.error('Image upload failed:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Image upload failed' });
        }
      }),
  }),
  
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
        lotteryTypeCode: z.string().optional(),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return [];
        
        let query = database.select().from(lotteryDraws);
        
        if (input.lotteryTypeCode) {
          const lotteryType = await database.select().from(lotteryTypes).where(eq(lotteryTypes.code, input.lotteryTypeCode));
          if (lotteryType.length > 0) {
            query = query.where(eq(lotteryDraws.lotteryTypeId, lotteryType[0].id)) as any;
          }
        }
        return await query.orderBy(desc(lotteryDraws.drawTime)).limit(input.limit);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getLotteryDrawById(input.id);
      }),

    // 快捷开奖
    quickCreate: adminProcedure
      .input(z.object({
        lotteryTypeCode: z.string(),
        issueNumber: z.string(),
        drawTime: z.date(),
        numbers: z.array(z.number().min(1).max(49)).length(7),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        // 计算下期时间
        const nextDrawTime = new Date(input.drawTime);
        nextDrawTime.setDate(nextDrawTime.getDate() + 1);
        
        // 计算下期期号
        const currentIssue = parseInt(input.issueNumber);
        const nextIssue = String(currentIssue + 1).padStart(3, '0');
        
        // 获取号码属性
        const attributes = await Promise.all(
          input.numbers.map(num => db.getNumberAttribute(num))
        );
        
        const drawData: any = {
          lotteryTypeCode: input.lotteryTypeCode,
          issueNumber: input.issueNumber,
          drawTime: input.drawTime,
          nextDrawTime: nextDrawTime,
          nextIssueNumber: nextIssue,
          status: 'completed',
        };
        
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
        return { id: Number(result[0].insertId), success: true, issueNumber: input.issueNumber, drawTime: input.drawTime, nextDrawTime };
      }),
    
    // 更新开奖记录
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        issueNumber: z.string().optional(),
        drawTime: z.date().optional(),
        numbers: z.array(z.number().min(1).max(49)).length(7).optional(),
        status: z.enum(["pending", "drawing", "completed"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        const updates: any = {};
        
        if (input.issueNumber) {
          updates.issueNumber = input.issueNumber;
        }
        
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

  // ============ AI配图生成 ============
  aiImage: router({
    generateFromText: adminProcedure
      .input(z.object({
        text: z.string().min(1),
        style: z.enum(["elegant", "mystical", "fortune", "wisdom", "nature"]).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const imageUrl = await generateImageFromText(input.text, input.style);
          return { imageUrl };
        } catch (error) {
          console.error('Image generation failed:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Image generation failed' });
        }
      }),
    
    generateByType: adminProcedure
      .input(z.object({
        type: z.enum(["fortune", "zodiac", "number", "custom"]),
        data: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const imageUrl = await generateImageByType(input.type, "");
          return { imageUrl };
        } catch (error) {
          console.error('Image generation failed:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Image generation failed' });
        }
      }),
  }),

  // ============ 生肖卡片 ============
  zodiacCard: router({
    list: publicProcedure.query(async () => {
      return await db.getAllZodiacCards();
    }),
  }),
});

export type AppRouter = typeof appRouter;
