import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AppError } from "../errors/app-error.js";
import { error } from "../utils/response.js";

export function withErrorHandler(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>,
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json(error(err.message));
        return;
      }
      console.error(err);
      res.status(500).json(error("Internal server error"));
    }
  };
}
