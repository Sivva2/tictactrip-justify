import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  dailyWordLimit: parseInt(process.env.DAILY_WORD_LIMIT || "80000", 10),
  lineWidth: parseInt(process.env.LINE_WIDTH || "80", 10),
} as const;
