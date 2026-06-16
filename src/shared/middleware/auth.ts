import type { VercelRequest } from "@vercel/node";
import type { Role } from "@toolhub/shared";
import { createSupabaseClient } from "../../lib/supabase.js";
import { getDb } from "../../lib/db.js";
import type { AuthUser } from "../../types/index.js";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error.js";

export async function authenticate(req: VercelRequest): Promise<AuthUser> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing authorization token");
  }

  const token = header.slice(7);
  const supabase = createSupabaseClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  const sql = getDb();
  const rows = await sql<AuthUser[]>`
    SELECT id, email, name, role
    FROM public.users
    WHERE id = ${data.user.id}
    LIMIT 1
  `;

  const profile = rows[0];
  if (!profile) {
    throw new UnauthorizedError("User profile not found");
  }

  return profile;
}

export function authorize(user: AuthUser, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new ForbiddenError("Insufficient permissions");
  }
}

export async function optionalAuth(req: VercelRequest): Promise<AuthUser | null> {
  try {
    return await authenticate(req);
  } catch {
    return null;
  }
}
