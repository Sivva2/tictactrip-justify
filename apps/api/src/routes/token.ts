import { Router, Request, Response } from "express";
import { tokenStore } from "../utils/tokenStore";
import { TokenRequest, TokenResponse, ErrorResponse } from "../types";

const router = Router();

/*
  POST /api/token 
  */

router.post(
  "/",
  (req: Request, res: Response<TokenResponse | ErrorResponse>) => {
    const { email } = req.body as TokenRequest;

    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    const token = tokenStore.generateToken(email);

    res.status(200).json({ token });
  }
);

export default router;
