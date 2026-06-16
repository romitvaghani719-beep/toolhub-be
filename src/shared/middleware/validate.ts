import type { VercelRequest } from "@vercel/node";
import type { ZodSchema } from "zod";
import { ValidationError } from "../errors/app-error.js";

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(", ");
    throw new ValidationError(message);
  }
  return result.data;
}

export function validateQuery<T>(schema: ZodSchema<T>, query: VercelRequest["query"]): T {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") flat[key] = value;
    else if (Array.isArray(value) && value[0]) flat[key] = value[0];
  }
  const result = schema.safeParse(flat);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(", ");
    throw new ValidationError(message);
  }
  return result.data;
}
