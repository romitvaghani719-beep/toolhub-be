import type { VercelRequest, VercelResponse } from "@vercel/node";
import { loginSchema, refreshSchema } from "@toolhub/shared";
import { createSupabaseClient } from "../../lib/supabase.js";
import { getDb } from "../../lib/db.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";
import { authenticate } from "../../shared/middleware/auth.js";
import { validateBody } from "../../shared/middleware/validate.js";
import { success } from "../../shared/utils/response.js";

function toSessionPayload(session: {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}) {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at ?? 0,
  };
}

export const authController = {
  async login(req: VercelRequest, res: VercelResponse) {
    const body = validateBody(loginSchema, req.body);
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedError(error?.message ?? "Invalid credentials");
    }

    const sql = getDb();
    const rows = await sql`
      SELECT id, email, name, role, created_at, updated_at
      FROM public.users WHERE id = ${data.user.id} LIMIT 1
    `;

    res.status(200).json(
      success({
        session: toSessionPayload(data.session),
        user: rows[0],
      }),
    );
  },

  async refresh(req: VercelRequest, res: VercelResponse) {
    const body = validateBody(refreshSchema, req.body);
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: body.refresh_token,
    });

    if (error || !data.session) {
      throw new UnauthorizedError(error?.message ?? "Invalid or expired refresh token");
    }

    res.status(200).json(
      success({
        session: toSessionPayload(data.session),
      }),
    );
  },

  async logout(req: VercelRequest, res: VercelResponse) {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const supabase = createSupabaseClient(header.slice(7));
      await supabase.auth.signOut();
    }
    res.status(200).json(success({ loggedOut: true }));
  },

  async me(req: VercelRequest, res: VercelResponse) {
    const user = await authenticate(req);
    const sql = getDb();
    const rows = await sql`
      SELECT id, email, name, role, created_at, updated_at
      FROM public.users WHERE id = ${user.id} LIMIT 1
    `;
    res.status(200).json(success(rows[0]));
  },
};
