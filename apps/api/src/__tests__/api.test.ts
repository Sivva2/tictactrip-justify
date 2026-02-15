import request from "supertest";
import app from "../app";
import { tokenStore } from "../utils/tokenStore";

describe("API Integration Tests", () => {
  beforeEach(() => {
    tokenStore.clear();
  });

  describe("POST /api/token", () => {
    it("should return a token for a valid email", async () => {
      const res = await request(app)
        .post("/api/token")
        .send({ email: "test@example.com" })
        .expect(200);

      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");
    });

    it("should return 400 for missing email", async () => {
      const res = await request(app).post("/api/token").send({}).expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("should return 400 for invalid email format", async () => {
      const res = await request(app)
        .post("/api/token")
        .send({ email: "not-an-email" })
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("should generate different tokens for different requests", async () => {
      const res1 = await request(app)
        .post("/api/token")
        .send({ email: "test@example.com" });

      const res2 = await request(app)
        .post("/api/token")
        .send({ email: "test@example.com" });

      expect(res1.body.token).not.toBe(res2.body.token);
    });
  });

  describe("POST /api/justify", () => {
    let token: string;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/token")
        .send({ email: "test@example.com" });
      token = res.body.token;
    });

    it("should return justified text for valid request", async () => {
      const text =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

      const res = await request(app)
        .post("/api/justify")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "text/plain")
        .send(text)
        .expect(200);

      const lines = res.text.split("\n");
      for (let i = 0; i < lines.length - 1; i++) {
        if (lines[i].length > 0) {
          expect(lines[i].length).toBe(80);
        }
      }
    });

    it("should return 401 without authorization header", async () => {
      await request(app)
        .post("/api/justify")
        .set("Content-Type", "text/plain")
        .send("Some text")
        .expect(401);
    });

    it("should return 401 with invalid token", async () => {
      await request(app)
        .post("/api/justify")
        .set("Authorization", "Bearer invalid-token")
        .set("Content-Type", "text/plain")
        .send("Some text")
        .expect(401);
    });

    it("should return 401 for malformed authorization header", async () => {
      await request(app)
        .post("/api/justify")
        .set("Authorization", "NotBearer token")
        .set("Content-Type", "text/plain")
        .send("Some text")
        .expect(401);
    });

    it("should include rate limit headers", async () => {
      const res = await request(app)
        .post("/api/justify")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "text/plain")
        .send("Hello world")
        .expect(200);

      expect(res.headers).toHaveProperty("x-ratelimit-remaining");
    });

    it("should return 402 when rate limit is exceeded", async () => {
      const text1 = Array(80000).fill("word").join(" ");
      await request(app)
        .post("/api/justify")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "text/plain")
        .send(text1)
        .expect(200);

      const res = await request(app)
        .post("/api/justify")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "text/plain")
        .send("one more word")
        .expect(402);

      expect(res.body.error).toContain("Payment Required");
    });

    it("should track rate limits per token independently", async () => {
      const res2 = await request(app)
        .post("/api/token")
        .send({ email: "other@example.com" });
      const token2 = res2.body.token;

      const bigText = Array(80000).fill("word").join(" ");
      await request(app)
        .post("/api/justify")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "text/plain")
        .send(bigText)
        .expect(200);

      await request(app)
        .post("/api/justify")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "text/plain")
        .send("blocked")
        .expect(402);

      await request(app)
        .post("/api/justify")
        .set("Authorization", `Bearer ${token2}`)
        .set("Content-Type", "text/plain")
        .send("This should work fine")
        .expect(200);
    });
  });

  describe("GET /api/health", () => {
    it("should return health status", async () => {
      const res = await request(app).get("/api/health").expect(200);

      expect(res.body).toHaveProperty("status", "ok");
    });
  });

  describe("404 handling", () => {
    it("should return 404 for unknown routes", async () => {
      await request(app).get("/api/unknown").expect(404);
    });
  });
});
