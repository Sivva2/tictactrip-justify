import { Request, Response, NextFunction } from "express";
import { tokenStore } from "../utils/tokenStore";

/*
  Middleware that validates the authorizatio bearer token.
  
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Authorization header is required" });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({
      error: "Invalid authorization format. Use: Bearer <token>",
    });
    return;
  }

  const token = parts[1];
  const record = tokenStore.validateToken(token);

  if (!record) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  (req as any).token = token;
  (req as any).tokenRecord = record;

  next();
}
