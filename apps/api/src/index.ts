import app from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`Justify API running on http://localhost:${config.port}`);
  console.log(`POST /api/token    → Get authentication token`);
  console.log(`POST /api/justify  → Justify text (requires token)`);
  console.log(`GET  /api/health   → Health check`);
});
