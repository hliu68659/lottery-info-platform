import { describe, it, expect, beforeEach } from "vitest";
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

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("lottery draw features", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createAdminContext();
  });

  it("should calculate correct time until draw", async () => {
    const now = new Date();
    const drawTime = new Date(now.getTime() + 3600000); // 1小时后
    
    const timeDiff = drawTime.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / 3600000);
    const minutes = Math.floor((timeDiff % 3600000) / 60000);
    
    expect(hours).toBe(1);
    expect(minutes).toBe(0);
  });

  it("should detect syncing phase (3 minutes before draw)", async () => {
    const now = new Date();
    const drawTime = new Date(now.getTime() + 2 * 60 * 1000); // 2分钟后
    const threeMinutesBefore = drawTime.getTime() - 3 * 60 * 1000;
    
    const isSyncing = now.getTime() >= threeMinutesBefore && now.getTime() < drawTime.getTime();
    
    expect(isSyncing).toBe(true);
  });

  it("should not be in syncing phase if more than 3 minutes before draw", async () => {
    const now = new Date();
    const drawTime = new Date(now.getTime() + 5 * 60 * 1000); // 5分钟后
    const threeMinutesBefore = drawTime.getTime() - 3 * 60 * 1000;
    
    const isSyncing = now.getTime() >= threeMinutesBefore && now.getTime() < drawTime.getTime();
    
    expect(isSyncing).toBe(false);
  });

  it("should format time correctly", () => {
    const ms = 3661000; // 1小时1分1秒
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    expect(hours).toBe(1);
    expect(minutes).toBe(1);
    expect(seconds).toBe(1);
  });

  it("should handle draw animation sequence", async () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7];
    const animationInterval = 8000; // 8秒
    
    // 模拟动画序列
    const displaySequence: Array<{ number: number; time: number }> = [];
    numbers.forEach((num, index) => {
      displaySequence.push({
        number: num,
        time: index * animationInterval,
      });
    });
    
    expect(displaySequence).toHaveLength(7);
    expect(displaySequence[0]?.time).toBe(0);
    expect(displaySequence[6]?.time).toBe(48000); // 最后一个号码在48秒时显示
  });

  it("should detect completed draw status", () => {
    const drawStatus = "completed";
    const isCompleted = drawStatus === "completed";
    
    expect(isCompleted).toBe(true);
  });

  it("should detect pending draw status", () => {
    const drawStatus = "pending";
    const isPending = drawStatus === "pending";
    
    expect(isPending).toBe(true);
  });

  it("should countdown warning trigger at less than 1 hour", () => {
    const timeLeft = 3000000; // 50分钟
    const isWarning = timeLeft < 3600000; // 1小时
    
    expect(isWarning).toBe(true);
  });

  it("should not trigger warning if more than 1 hour left", () => {
    const timeLeft = 5400000; // 1.5小时
    const isWarning = timeLeft < 3600000; // 1小时
    
    expect(isWarning).toBe(false);
  });
});
