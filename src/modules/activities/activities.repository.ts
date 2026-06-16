import type { Activity, ActivityAction } from "@toolhub/shared";
import { getDb } from "../../lib/db.js";

export interface ActivityWithRelations extends Activity {
  user_name: string;
  tool_name: string;
}

export const activitiesRepository = {
  async findMany(params: {
    page: number;
    limit: number;
    user_id?: string;
    tool_id?: string;
    action?: ActivityAction;
  }) {
    const sql = getDb();
    const offset = (params.page - 1) * params.limit;

    const [items, countRows] = await Promise.all([
      sql<ActivityWithRelations[]>`
        SELECT a.id, a.user_id, a.tool_id, a.action, a.created_at,
               u.name AS user_name, t.name AS tool_name
        FROM public.activities a
        JOIN public.users u ON u.id = a.user_id
        JOIN public.tools t ON t.id = a.tool_id
        WHERE (${params.user_id ?? null}::uuid IS NULL OR a.user_id = ${params.user_id ?? null})
          AND (${params.tool_id ?? null}::uuid IS NULL OR a.tool_id = ${params.tool_id ?? null})
          AND (${params.action ?? null}::text IS NULL OR a.action = ${params.action ?? null})
        ORDER BY a.created_at DESC
        LIMIT ${params.limit} OFFSET ${offset}
      `,
      sql<{ count: string }[]>`
        SELECT COUNT(*)::text AS count FROM public.activities a
        WHERE (${params.user_id ?? null}::uuid IS NULL OR a.user_id = ${params.user_id ?? null})
          AND (${params.tool_id ?? null}::uuid IS NULL OR a.tool_id = ${params.tool_id ?? null})
          AND (${params.action ?? null}::text IS NULL OR a.action = ${params.action ?? null})
      `,
    ]);

    return { items, total: Number(countRows[0]?.count ?? 0) };
  },

  async findByTool(toolId: string, limit = 10) {
    const sql = getDb();
    return sql<ActivityWithRelations[]>`
      SELECT a.id, a.user_id, a.tool_id, a.action, a.created_at,
             u.name AS user_name, t.name AS tool_name
      FROM public.activities a
      JOIN public.users u ON u.id = a.user_id
      JOIN public.tools t ON t.id = a.tool_id
      WHERE a.tool_id = ${toolId}
      ORDER BY a.created_at DESC
      LIMIT ${limit}
    `;
  },

  async create(input: {
    user_id: string;
    tool_id: string;
    action: ActivityAction;
  }) {
    const sql = getDb();
    const rows = await sql<Activity[]>`
      INSERT INTO public.activities (user_id, tool_id, action)
      VALUES (${input.user_id}, ${input.tool_id}, ${input.action})
      RETURNING id, user_id, tool_id, action, created_at
    `;
    return rows[0];
  },
};
