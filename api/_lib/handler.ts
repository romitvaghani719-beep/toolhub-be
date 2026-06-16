import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors, rateLimit, requestLogger } from "../../src/shared/middleware/cors.js";
import { withErrorHandler } from "../../src/shared/middleware/error-handler.js";

export function createHandler(
  fn: (req: VercelRequest, res: VercelResponse) => Promise<void>,
) {
  return withErrorHandler(async (req, res) => {
    if (cors(req, res)) return;
    requestLogger(req);
    if (rateLimit(req, res)) return;
    await fn(req, res);
  });
}
