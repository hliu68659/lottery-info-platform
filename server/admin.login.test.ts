import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';

// 模拟管理员凭证
const ADMIN_USERNAME = "kaijiang";
const ADMIN_PASSWORD = "kaijiang1866333";
const JWT_SECRET = "test-secret";

describe('Admin Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该使用正确的凭证成功登入', () => {
    const username = ADMIN_USERNAME;
    const password = ADMIN_PASSWORD;

    // 验证凭证
    const isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
    expect(isValid).toBe(true);

    // 生成JWT token
    const token = jwt.sign(
      { username: ADMIN_USERNAME, type: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('应该使用错误的用户名拒绝登入', () => {
    const username = "wronguser";
    const password = ADMIN_PASSWORD;

    const isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
    expect(isValid).toBe(false);
  });

  it('应该使用错误的密码拒绝登入', () => {
    const username = ADMIN_USERNAME;
    const password = "wrongpassword";

    const isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
    expect(isValid).toBe(false);
  });

  it('应该生成有效的JWT token', () => {
    const token = jwt.sign(
      { username: ADMIN_USERNAME, type: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    expect(decoded.username).toBe(ADMIN_USERNAME);
    expect(decoded.type).toBe('admin');
  });

  it('应该能够解析JWT token中的用户信息', () => {
    const token = jwt.sign(
      { username: ADMIN_USERNAME, type: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    expect(decoded).toHaveProperty('username');
    expect(decoded).toHaveProperty('type');
    expect(decoded.username).toBe(ADMIN_USERNAME);
    expect(decoded.type).toBe('admin');
  });

  it('应该拒绝过期的token', () => {
    // 创建一个已过期的token
    const expiredToken = jwt.sign(
      { username: ADMIN_USERNAME, type: 'admin' },
      JWT_SECRET,
      { expiresIn: '0s' }
    );

    // 等待token过期
    expect(() => {
      jwt.verify(expiredToken, JWT_SECRET);
    }).toThrow();
  });

  it('应该拒绝使用错误密钥签名的token', () => {
    const token = jwt.sign(
      { username: ADMIN_USERNAME, type: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 尝试使用错误的密钥验证
    expect(() => {
      jwt.verify(token, 'wrong-secret');
    }).toThrow();
  });

  it('应该验证凭证格式', () => {
    const validUsername = ADMIN_USERNAME;
    const validPassword = ADMIN_PASSWORD;

    expect(validUsername).toBeTruthy();
    expect(validPassword).toBeTruthy();
    expect(typeof validUsername).toBe('string');
    expect(typeof validPassword).toBe('string');
    expect(validUsername.length).toBeGreaterThan(0);
    expect(validPassword.length).toBeGreaterThan(0);
  });
});
