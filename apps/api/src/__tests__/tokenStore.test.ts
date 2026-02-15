import { tokenStore } from "../utils/tokenStore";

describe("TokenStore", () => {
  beforeEach(() => {
    tokenStore.clear();
  });

  describe("generateToken", () => {
    it("should generate a unique token", () => {
      const token = tokenStore.generateToken("test@example.com");
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate different tokens each time", () => {
      const token1 = tokenStore.generateToken("test@example.com");
      const token2 = tokenStore.generateToken("test@example.com");
      expect(token1).not.toBe(token2);
    });
  });

  describe("validateToken", () => {
    it("should validate a valid token", () => {
      const token = tokenStore.generateToken("test@example.com");
      const record = tokenStore.validateToken(token);
      expect(record).not.toBeNull();
      expect(record!.email).toBe("test@example.com");
    });

    it("should return null for invalid token", () => {
      const record = tokenStore.validateToken("nonexistent");
      expect(record).toBeNull();
    });
  });

  describe("checkAndUpdateRateLimit", () => {
    it("should allow requests within limit", () => {
      const token = tokenStore.generateToken("test@example.com");
      const result = tokenStore.checkAndUpdateRateLimit(token, 100);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(79900);
    });

    it("should reject requests that would exceed limit", () => {
      const token = tokenStore.generateToken("test@example.com");
      tokenStore.checkAndUpdateRateLimit(token, 50000);
      const result = tokenStore.checkAndUpdateRateLimit(token, 40000);
      expect(result.allowed).toBe(false);
    });

    it("should accumulate word count", () => {
      const token = tokenStore.generateToken("test@example.com");
      tokenStore.checkAndUpdateRateLimit(token, 40000);
      const result = tokenStore.checkAndUpdateRateLimit(token, 40000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });
  });

  describe("daily reset", () => {
    it("should reset word count after midnight UTC", () => {
      const token = tokenStore.generateToken("test@example.com");

      const day1 = new Date("2025-06-15T14:00:00Z");
      tokenStore.getNow = () => day1;

      tokenStore.checkAndUpdateRateLimit(token, 80000);
      const blocked = tokenStore.checkAndUpdateRateLimit(token, 1);
      expect(blocked.allowed).toBe(false);

      const day2 = new Date("2025-06-16T00:01:00Z");
      tokenStore.getNow = () => day2;

      const afterReset = tokenStore.checkAndUpdateRateLimit(token, 100);
      expect(afterReset.allowed).toBe(true);
      expect(afterReset.remaining).toBe(79900);
    });

    it("should NOT reset before midnight UTC", () => {
      const token = tokenStore.generateToken("test@example.com");

      const morning = new Date("2025-06-15T10:00:00Z");
      tokenStore.getNow = () => morning;

      tokenStore.checkAndUpdateRateLimit(token, 80000);

      const lateNight = new Date("2025-06-15T23:59:59Z");
      tokenStore.getNow = () => lateNight;

      const result = tokenStore.checkAndUpdateRateLimit(token, 1);
      expect(result.allowed).toBe(false);
    });

    it("should give each user their own independent quota", () => {
      const tokenA = tokenStore.generateToken("alice@example.com");
      const tokenB = tokenStore.generateToken("bob@example.com");

      tokenStore.checkAndUpdateRateLimit(tokenA, 80000);
      const aliceBlocked = tokenStore.checkAndUpdateRateLimit(tokenA, 1);
      expect(aliceBlocked.allowed).toBe(false);

      const bobResult = tokenStore.checkAndUpdateRateLimit(tokenB, 50000);
      expect(bobResult.allowed).toBe(true);
      expect(bobResult.remaining).toBe(30000);
    });
  });

  describe("getUsage", () => {
    it("should return zero usage for new token", () => {
      const token = tokenStore.generateToken("test@example.com");
      const usage = tokenStore.getUsage(token);
      expect(usage.used).toBe(0);
      expect(usage.remaining).toBe(80000);
    });

    it("should track usage correctly", () => {
      const token = tokenStore.generateToken("test@example.com");
      tokenStore.checkAndUpdateRateLimit(token, 5000);
      const usage = tokenStore.getUsage(token);
      expect(usage.used).toBe(5000);
      expect(usage.remaining).toBe(75000);
    });
  });
});
