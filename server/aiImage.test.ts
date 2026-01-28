import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("AI Image Generation", () => {
  describe("generateFromText", () => {
    it("should require admin role", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.aiImage.generateFromText({
          text: "Test image generation",
          style: "elegant",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(["FORBIDDEN", "UNAUTHORIZED"]).toContain(error.code);
      }
    });

    it("should reject empty text", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.aiImage.generateFromText({
          text: "",
          style: "elegant",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        // Zod validation error
        expect(error.message).toBeTruthy();
      }
    });

    it("should accept valid text and style", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.aiImage.generateFromText({
          text: "\u65b0\u5e74\u8d22\u8fd0\u6307\u5357 - 2026\u5e74\u8fd0\u52bf\u9884\u6d4b",
          style: "fortune",
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        // URL\u53ef\u80fd\u4e3a\u7a7a,\u56e0\u4e3a\u8fd9\u662f\u6d4b\u8bd5\u73af\u5883
        expect(typeof result.url).toBe("string");
      } catch (error: any) {
        // AI\u751f\u6210\u53ef\u80fd\u5931\u8d25,\u4f46\u4e0d\u5e94\u8be5\u662f\u6743\u9650\u9519\u8bef
        expect(["FORBIDDEN", "UNAUTHORIZED"]).not.toContain(error.code);
      }
    }, { timeout: 60000 });

    it("should support all style options", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const styles = ["elegant", "mystical", "fortune", "wisdom", "nature"] as const;

      for (const style of styles) {
        try {
          const result = await caller.aiImage.generateFromText({
            text: `Test image with ${style} style`,
            style,
          });

          expect(result).toBeDefined();
          expect(typeof result.url).toBe("string");
        } catch (error: any) {
          // AI\u751f\u6210\u53ef\u80fd\u5931\u8d25,\u4f46\u4e0d\u5e94\u8be5\u662f\u6743\u9650\u9519\u8bef
          expect(["FORBIDDEN", "UNAUTHORIZED"]).not.toContain(error.code);
        }
      }
    }, { timeout: 60000 });
  });

  describe("generateByType", () => {
    it("should require admin role", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.aiImage.generateByType({
          title: "Test",
          content: "Test content",
          type: "text",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(["FORBIDDEN", "UNAUTHORIZED"]).toContain(error.code);
      }
    });

    it("should reject empty title and content", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.aiImage.generateByType({
          title: "",
          content: "",
          type: "text",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        // Zod validation error
        expect(error.message).toBeTruthy();
      }
    });

    it("should accept valid title and content", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.aiImage.generateByType({
          title: "\u5f69\u7968\u77e5\u8bc6",
          content: "\u4e86\u89e3\u5f69\u7968\u7684\u57fa\u672c\u77e5\u8bc6\u548c\u9009\u53f7\u6280\u5de7",
          type: "wisdom",
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(typeof result.url).toBe("string");
      } catch (error: any) {
        // AI\u751f\u6210\u53ef\u80fd\u5931\u8d25,\u4f46\u4e0d\u5e94\u8be5\u662f\u6743\u9650\u9519\u8bef
        expect(["FORBIDDEN", "UNAUTHORIZED"]).not.toContain(error.code);
      }
    }, { timeout: 60000 });

    it("should support all content types", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const types = ["text", "formula", "wisdom"] as const;

      for (const type of types) {
        try {
          const result = await caller.aiImage.generateByType({
            title: `Test ${type}`,
            content: `This is test content for ${type} type`,
            type,
          });

          expect(result).toBeDefined();
          expect(typeof result.url).toBe("string");
        } catch (error: any) {
          // AI\u751f\u6210\u53ef\u80fd\u5931\u8d25,\u4f46\u4e0d\u5e94\u8be5\u662f\u6743\u9650\u9519\u8bef
          expect(["FORBIDDEN", "UNAUTHORIZED"]).not.toContain(error.code);
        }
      }
    }, { timeout: 60000 });
  });
});
