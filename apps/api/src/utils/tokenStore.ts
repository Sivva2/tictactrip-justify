import { v4 as uuidv4 } from "uuid";
import { TokenRecord, RateLimitRecord } from "../types";
import { config } from "../config";

/*
  Returns the start of the next UTC day (midnight 00:00:00.000).
 */

function getNextMidnightUTC(from: Date): Date {
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + 1);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

/*
  In-memory token store.
  In production, this would be backed by a database.
 */

class TokenStore {
  private tokens: Map<string, TokenRecord> = new Map();
  private rateLimits: Map<string, RateLimitRecord> = new Map();

  public getNow: () => Date = () => new Date();

  /*
    Generates a new unique token for the given email.

   */
  generateToken(email: string): string {
    const token = uuidv4();
    this.tokens.set(token, {
      email,
      createdAt: this.getNow(),
    });
    return token;
  }

  /*
    Validates that a token exists and returns the associated record.

   */
  validateToken(token: string): TokenRecord | null {
    return this.tokens.get(token) || null;
  }

  /*
    Returns the current rate limit record for a token,
    resetting it if the day has rolled over.
   */

  private getOrResetRecord(token: string): RateLimitRecord {
    const now = this.getNow();
    const existing = this.rateLimits.get(token);

    if (!existing || now >= existing.resetAt) {
      const fresh: RateLimitRecord = {
        wordCount: 0,
        resetAt: getNextMidnightUTC(now),
      };
      this.rateLimits.set(token, fresh);
      return fresh;
    }

    return existing;
  }

  /*
    Checks the rate limit for a token and adds wordCount if within limit.
    The request that pushes past 80,000 is still allowed.
    Only subsequent requests after exceeding are blocked (402).

   */
  checkAndUpdateRateLimit(
    token: string,
    wordCount: number
  ): { allowed: boolean; remaining: number } {
    const record = this.getOrResetRecord(token);
    const remaining = config.dailyWordLimit - record.wordCount;

    // If adding these words would exceed the limit → block
    if (record.wordCount + wordCount > config.dailyWordLimit) {
      return { allowed: false, remaining: Math.max(0, remaining) };
    }

    // Allow and accumulate
    record.wordCount += wordCount;
    this.rateLimits.set(token, record);

    return {
      allowed: true,
      remaining: config.dailyWordLimit - record.wordCount,
    };
  }
  /*
   Gets current usage for a token.
   */
  getUsage(token: string): { used: number; limit: number; remaining: number } {
    const record = this.getOrResetRecord(token);

    return {
      used: record.wordCount,
      limit: config.dailyWordLimit,
      remaining: Math.max(0, config.dailyWordLimit - record.wordCount),
    };
  }

  /*
   Clear all data (for testing).
   */
  clear(): void {
    this.tokens.clear();
    this.rateLimits.clear();
    this.getNow = () => new Date();
  }
}

export const tokenStore = new TokenStore();
