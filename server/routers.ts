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
  
  // ============ 认证管理 ============
  auth: router({
    me: protectedProcedure
      .query(async ({ ctx }) => {
        return ctx.user;
      }),
    logout: protectedProcedure
      .mutation(async ({ ctx }) => {
        return { success: true };
      }),
  }),
  
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
        
        const token = jwt.sign(
          { username: ADMIN_USERNAME, type: 'admin' },
          process.env.JWT_SECRET || 'default-secret',
          { expiresIn: '7d' }
        );
        
        return {
          success: true,
          token,
          message: '登入成功'
        };
      }),
  }),

  // ============ 彩票类型管理 ============
  lotteryTypes: router({
    list: publicProcedure
      .input(z.object({ enabledOnly: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        try {
          const database = await getDb();
          if (!database) return [];
          
          if (input?.enabledOnly) {
            return await database.select().from(lotteryTypes).where(eq(lotteryTypes.enabled, true));
          }
          return await database.select().from(lotteryTypes);
        } catch (error) {
          console.error('Error fetching lottery types:', error);
          return [];
        }
      }),
  }),

  // ============ 文字资料板块管理 ============
  textBlocks: router({
    list: publicProcedure
      .input(z.object({ location: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return [];
        
        if (input?.location) {
          return await database.select().from(textBlocks).where(eq(textBlocks.location, input.location as any)).orderBy(desc(textBlocks.displayOrder));
        }
        return await database.select().from(textBlocks).orderBy(desc(textBlocks.displayOrder));
      }),

    create: adminProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        location: z.enum(["home", "shensuan", "guanjiapo", "huangdaxian"]),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        const result = await database.insert(textBlocks).values({
          title: input.title,
          content: input.content,
          location: input.location,
          displayOrder: input.displayOrder || 0,
          visible: true,
        });
        
        return { id: Number(result[0].insertId), ...input };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        visible: z.boolean().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        const updates: any = {};
        if (input.title) updates.title = input.title;
        if (input.content) updates.content = input.content;
        if (input.visible !== undefined) updates.visible = input.visible;
        if (input.displayOrder !== undefined) updates.displayOrder = input.displayOrder;
        
        await database.update(textBlocks).set(updates).where(eq(textBlocks.id, input.id));
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

  // ============ 图片资料板块管理 ============
  imageBlocks: router({
    list: publicProcedure
      .input(z.object({ location: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return [];
        
        if (input?.location) {
          return await database.select().from(imageBlocks).where(eq(imageBlocks.location, input.location as any)).orderBy(desc(imageBlocks.displayOrder));
        }
        return await database.select().from(imageBlocks).orderBy(desc(imageBlocks.displayOrder));
      }),

    create: adminProcedure
      .input(z.object({
        title: z.string(),
        imageUrl: z.string(),
        description: z.string().optional(),
        location: z.enum(["home", "shensuan", "guanjiapo", "huangdaxian"]),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        const result = await database.insert(imageBlocks).values({
          title: input.title,
          imageUrl: input.imageUrl,
          description: input.description,
          location: input.location,
          displayOrder: input.displayOrder || 0,
          visible: true,
        });
        
        return { id: Number(result[0].insertId), ...input };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        imageUrl: z.string().optional(),
        description: z.string().optional(),
        visible: z.boolean().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库不可用' });
        
        const updates: any = {};
        if (input.title) updates.title = input.title;
        if (input.imageUrl) updates.imageUrl = input.imageUrl;
        if (input.description !== undefined) updates.description = input.description;
        if (input.visible !== undefined) updates.visible = input.visible;
        if (input.displayOrder !== undefined) updates.displayOrder = input.displayOrder;
        
        await database.update(imageBlocks).set(updates).where(eq(imageBlocks.id, input.id));
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

  // ============ 号码属性管理 ============
  numberAttributes: router({
    getByNumber: publicProcedure
      .input(z.object({ number: z.number().min(1).max(49) }))
      .query(async ({ input }) => {
        return await db.getNumberAttribute(input.number);
      }),
  }),

  // ============ 开奖记录管理 ============
  lotteryDraws: router({
    list: publicProcedure
      .input(z.object({ 
        lotteryTypeCode: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return [];
        
        try {
          if (input?.limit) {
            return await database.select().from(lotteryDraws).orderBy(desc(lotteryDraws.drawTime)).limit(input.limit).offset(input.offset || 0);
          }
          return await database.select().from(lotteryDraws).orderBy(desc(lotteryDraws.drawTime));
        } catch (error) {
          console.error('Error fetching lottery draws:', error);
          return [];
        }
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
        
        // 根据彩票类型代码获取彩票类型ID
        const lotteryType = await database.select().from(lotteryTypes).where(eq(lotteryTypes.code, input.lotteryTypeCode)).limit(1).then(rows => rows[0]);
        
        if (!lotteryType) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: '彩票类型不存在' });
        }
        
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
        
        // 从drawTime中提取年份
        const year = input.drawTime.getFullYear();
        
        const drawData: any = {
          lotteryTypeId: lotteryType.id,
          issueNumber: input.issueNumber,
          year: year,
          drawTime: input.drawTime,
          nextDrawTime: nextDrawTime,
          nextIssueNumber: nextIssue,
          status: 'pending',
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

    // 删除开奖记录
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
        text: z.string(),
        style: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const imageUrl = await generateImageFromText(input.text, input.style);
          return { success: true, imageUrl };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `生成失败: ${error instanceof Error ? error.message : '未知错误'}`,
          });
        }
      }),

    generateByType: adminProcedure
      .input(z.object({
        lotteryTypeCode: z.string(),
        style: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const imageUrl = await generateImageByType(input.lotteryTypeCode, input.style);
          return { success: true, imageUrl };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `生成失败: ${error instanceof Error ? error.message : '未知错误'}`,
          });
        }
      }),
  }),

  // ============ 文件上传 ============
  upload: router({
    image: protectedProcedure
      .input(z.object({
        filename: z.string(),
        base64: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          // 将base64转换为Buffer
          const buffer = Buffer.from(input.base64, 'base64');
          
          // 生成唯一的文件名
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8);
          const ext = input.filename.split('.').pop() || 'jpg';
          const fileKey = `uploads/${timestamp}-${random}.${ext}`;
          
          // 上传到S3
          const result = await storagePut(fileKey, buffer, 'image/jpeg');
          
          return {
            url: result.url,
            key: result.key,
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `上传失败: ${error instanceof Error ? error.message : '未知错误'}`,
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
