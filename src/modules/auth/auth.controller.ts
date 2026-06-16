import type { VercelRequest, VercelResponse } from "@vercel/node";
import { loginSchema } from "@toolhub/shared";
import { createSupabaseClient } from "../../lib/supabase.js";
import { getDb } from "../../lib/db.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";
import { authenticate } from "../../shared/middleware/auth.js";
import { validateBody } from "../../shared/middleware/validate.js";
import { success } from "../../shared/utils/response.js";

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
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
        user: rows[0],
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
