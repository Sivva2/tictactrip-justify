import { Request, Response, NextFunction } from "express";
import { tokenStore } from "../utils/tokenStore";
import { countWords } from "../utils/justify";

/*
  Middleware that enforces the daily word rate limit per token.
  Must be used after authMiddleware.
 */
export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = (req as any).token as string;
  const body = req.body as string;

  if (!body || typeof body !== "string") {
    res
      .status(400)
      .json({ error: "Request body must be non-empty text/plain" });
    return;
  }

  const wordCount = countWords(body);

  if (wordCount === 0) {
    res.status(400).json({ error: "Request body contains no words" });
    return;
  }

  const { allowed, remaining } = tokenStore.checkAndUpdateRateLimit(
    token,
    wordCount
  );

  res.setHeader("X-RateLimit-Remaining", remaining.toString());

  if (!allowed) {
    res.status(402).json({
      error: "Payment Required: daily word limit exceeded",
      details: {
        dailyLimit: 80000,
        remainingWords: remaining,
        requestedWords: wordCount,
      },
    });
    return;
  }

  next();
}
