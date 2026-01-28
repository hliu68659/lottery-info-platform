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

describe("Lottery System", () => {
  describe("Text Blocks", () => {
    it("should list text blocks for public users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.textBlocks.list({ location: "home", visibleOnly: true });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should allow admin to create text block", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.textBlocks.create({
        title: "Test Block",
        content: "Test Content",
        displayOrder: 0,
        visible: true,
        location: "home",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeGreaterThan(0);
    });
  });

  describe("Image Blocks", () => {
    it("should list image blocks for public users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.imageBlocks.list({ location: "home", visibleOnly: true });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should allow admin to create image block", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.imageBlocks.create({
        title: "Test Image",
        imageUrl: "https://example.com/image.jpg",
        description: "Test Description",
        displayOrder: 0,
        visible: true,
        location: "home",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeGreaterThan(0);
    });
  });

  describe("Number Attributes", () => {
    it("should get number attribute for valid number", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.numberAttributes.getByNumber({ number: 1 });
      expect(result).toBeDefined();
      if (result) {
        expect(result.number).toBe(1);
        expect(result.zodiac).toBeDefined();
        expect(result.color).toBeDefined();
      }
    });

    it("should get all number attributes", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.numberAttributes.getAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Lottery Types", () => {
    it("should list lottery types", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lotteryTypes.list({ enabledOnly: true });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should get lottery type by code", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lotteryTypes.getByCode({ code: "xinao_midnight" });
      expect(result).toBeDefined();
      if (result) {
        expect(result.code).toBe("xinao_midnight");
        expect(result.name).toBe("新澳午夜彩");
      }
    });
  });

  describe("Lottery Draws", () => {
    it("should list lottery draws", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lotteryDraws.list({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("should allow admin to create quick draw with auto-calculated issue number", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Get lottery type first
      const lotteryType = await caller.lotteryTypes.getByCode({ code: "xinao_midnight" });
      expect(lotteryType).toBeDefined();

      if (lotteryType) {
        const result = await caller.lotteryDraws.quickCreate({
          lotteryTypeId: lotteryType.id,
          numbers: [1, 2, 3, 4, 5, 6, 7],
        });

        expect(result.success).toBe(true);
        expect(result.id).toBeGreaterThan(0);
        expect(result.issueNumber).toBeDefined();
        expect(result.drawTime).toBeDefined();
        expect(result.nextDrawTime).toBeDefined();
      }
    });
  });

  describe("Zodiac Cards", () => {
    it("should get active zodiac card", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.zodiacCards.getActive();
      // May be null if no zodiac card is set
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("should allow admin to create zodiac card", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.zodiacCards.create({
        imageUrl: "https://example.com/zodiac.jpg",
        year: 2026,
        active: true,
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeGreaterThan(0);
    });
  });
});
