import { Router, Request, Response } from "express";
import { justify } from "../utils/justify";
import { authMiddleware } from "../middleware/auth";
import { rateLimitMiddleware } from "../middleware/rateLimit";
import { config } from "../config";

const router = Router();

/*
  POST /api/justify
  Justify text to 80 characters per line.
 */
router.post(
  "/",
  authMiddleware,
  rateLimitMiddleware,
  (req: Request, res: Response) => {
    const text = req.body as string;
    const justifiedText = justify(text, config.lineWidth);

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(justifiedText);
  }
);

export default router;
