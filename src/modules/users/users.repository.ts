import type { Role } from "@toolhub/shared";
import { getDb } from "../../lib/db.js";
import type { AuthUser } from "../../types/index.js";

export interface UserRow extends AuthUser {
  created_at: string;
  updated_at: string;
}

export const usersRepository = {
  async findById(id: string) {
    const sql = getDb();
    const rows = await sql<UserRow[]>`
      SELECT id, email, name, role, created_at, updated_at
      FROM public.users WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ?? null;
  },

  async findMany(params: { search?: string; page: number; limit: number }) {
    const sql = getDb();
    const offset = (params.page - 1) * params.limit;
    const search = params.search ? `%${params.search}%` : null;

    const [items, countRows] = await Promise.all([
      search
        ? sql<UserRow[]>`
            SELECT id, email, name, role, created_at, updated_at
            FROM public.users
            WHERE email ILIKE ${search} OR name ILIKE ${search}
            ORDER BY created_at DESC
            LIMIT ${params.limit} OFFSET ${offset}
          `
        : sql<UserRow[]>`
            SELECT id, email, name, role, created_at, updated_at
            FROM public.users
            ORDER BY created_at DESC
            LIMIT ${params.limit} OFFSET ${offset}
          `,
      search
        ? sql<{ count: string }[]>`
            SELECT COUNT(*)::text AS count FROM public.users
            WHERE email ILIKE ${search} OR name ILIKE ${search}
          `
        : sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM public.users`,
    ]);

    return { items, total: Number(countRows[0]?.count ?? 0) };
  },

  async createProfile(input: {
    id: string;
    email: string;
    name: string;
    role: Role;
  }) {
    const sql = getDb();
    const rows = await sql<UserRow[]>`
      INSERT INTO public.users (id, email, name, role)
      VALUES (${input.id}, ${input.email}, ${input.name}, ${input.role})
      RETURNING id, email, name, role, created_at, updated_at
    `;
    return rows[0];
  },

  async update(id: string, input: { email?: string; name?: string; role?: Role }) {
    const sql = getDb();
    const existing = await this.findById(id);
    if (!existing) return null;

    const rows = await sql<UserRow[]>`
      UPDATE public.users SET
        email = ${input.email ?? existing.email},
        name = ${input.name ?? existing.name},
        role = ${input.role ?? existing.role}
      WHERE id = ${id}
      RETURNING id, email, name, role, created_at, updated_at
    `;
    return rows[0];
  },

  async remove(id: string) {
    const sql = getDb();
    await sql`DELETE FROM public.users WHERE id = ${id}`;
  },
};
