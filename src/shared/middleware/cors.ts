import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEnv, getAllowedOrigins, normalizeOrigin } from "../../config/env.js";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isLocalOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Resolve which origin to echo back in Access-Control-Allow-Origin */
export function resolveCorsOrigin(requestOrigin: string | undefined): string | null {
  const allowed = getAllowedOrigins();
  if (!requestOrigin) return allowed[0] ?? null;

  const normalized = normalizeOrigin(requestOrigin);

  // Local dev: allow any localhost port (5173, 5174, etc.) without listing each one.
  if (getEnv().NODE_ENV === "development" && isLocalOrigin(normalized)) {
    return normalized;
  }

  if (allowed.includes(normalized)) return normalized;
  return null;
}

export function applyCorsHeaders(
  res: { setHeader(name: string, value: string): void },
  requestOrigin: string | undefined,
) {
  const origin = resolveCorsOrigin(requestOrigin);
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

export function cors(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(res, req.headers.origin as string | undefined);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export function requestLogger(req: VercelRequest) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
}

export function rateLimit(
  req: VercelRequest,
  res: VercelResponse,
  limit = 100,
  windowMs = 60_000,
) {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  if (entry.count > limit) {
    res.status(429).json({ success: false, message: "Too many requests" });
    return true;
  }
  return false;
}
