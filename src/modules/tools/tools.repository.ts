import type { Tool } from "@toolhub/shared";
import { getDb } from "../../lib/db.js";
import type { AuthUser } from "../../types/index.js";

export const toolsRepository = {
  selectCols: `
      id, name, description, website_url, category, image_url, logo_color,
      tags, votes, api_available, free_plan, open_source, pricing, automation, community,
      models, features, ai_capabilities, use_cases, featured,
      created_by, created_at, updated_at
  `,
  async findMany(params: {
    search?: string;
    category?: string;
    sort: string;
    page: number;
    limit: number;
  }) {
    const sql = getDb();
    const offset = (params.page - 1) * params.limit;
    const search = params.search ? `%${params.search}%` : null;
    const category = params.category || null;
    const orderClause =
      params.sort === "name"
        ? "name ASC"
        : params.sort === "votes"
          ? "votes DESC, created_at DESC"
          : "created_at DESC";

    // Single query: page of tools + total count (one table scan vs two)
    const rows = await sql.unsafe<(Tool & { total_count: string })[]>(
      `
        SELECT ${toolsRepository.selectCols}, COUNT(*) OVER()::text AS total_count
        FROM public.tools
        WHERE ($1::text IS NULL OR name ILIKE $1 OR description ILIKE $1)
          AND ($2::text IS NULL OR category = $2)
        ORDER BY ${orderClause}
        LIMIT $3 OFFSET $4
      `,
      [search, category, params.limit, offset],
    );

    const total = Number(rows[0]?.total_count ?? 0);
    const items = rows.map(({ total_count: _total, ...tool }) => tool);

    return { items, total };
  },

  async findById(id: string) {
    const sql = getDb();
    const rows = await sql<Tool[]>`
      SELECT ${sql.unsafe(toolsRepository.selectCols)}
      FROM public.tools WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ?? null;
  },

  async findRelated(category: string, excludeId: string, limit = 3) {
    const sql = getDb();
    return sql<Tool[]>`
      SELECT ${sql.unsafe(toolsRepository.selectCols)}
      FROM public.tools
      WHERE category = ${category} AND id != ${excludeId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  },

  async create(input: {
    name: string;
    description?: string | null;
    website_url?: string | null;
    category: string;
    image_url?: string | null;
    logo_color?: string | null;
    tags?: string[];
    votes?: number;
    api_available?: boolean;
    free_plan?: boolean;
    open_source?: boolean;
    pricing?: string | null;
    automation?: string | null;
    community?: string | null;
    models?: string[];
    features?: string[];
    ai_capabilities?: string[];
    use_cases?: string[];
    featured?: boolean;
    created_by: string;
  }) {
    const sql = getDb();
    const rows = await sql<Tool[]>`
      INSERT INTO public.tools (
        name, description, website_url, category, image_url, logo_color, tags, votes,
        api_available, free_plan, open_source, pricing, automation, community,
        models, features, ai_capabilities, use_cases, featured, created_by
      )
      VALUES (
        ${input.name},
        ${input.description ?? null},
        ${input.website_url ?? null},
        ${input.category},
        ${input.image_url ?? null},
        ${input.logo_color ?? null},
        ${input.tags ?? []},
        ${input.votes ?? 0},
        ${input.api_available ?? false},
        ${input.free_plan ?? false},
        ${input.open_source ?? false},
        ${input.pricing ?? null},
        ${input.automation ?? null},
        ${input.community ?? null},
        ${input.models ?? []},
        ${input.features ?? []},
        ${input.ai_capabilities ?? []},
        ${input.use_cases ?? []},
        ${input.featured ?? false},
        ${input.created_by}
      )
      RETURNING ${sql.unsafe(toolsRepository.selectCols)}
    `;
    return rows[0];
  },

  async update(
    id: string,
    input: Partial<{
      name: string;
      description: string | null;
      website_url: string | null;
      category: string;
      image_url: string | null;
      logo_color: string | null;
      tags: string[];
      votes: number;
      api_available: boolean;
      free_plan: boolean;
      open_source: boolean;
      pricing: string | null;
      automation: string | null;
      community: string | null;
      models: string[];
      features: string[];
      ai_capabilities: string[];
      use_cases: string[];
      featured: boolean;
    }>,
  ) {
    const sql = getDb();
    const existing = await this.findById(id);
    if (!existing) return null;

    const rows = await sql<Tool[]>`
      UPDATE public.tools SET
        name = ${input.name ?? existing.name},
        description = ${input.description !== undefined ? input.description : existing.description},
        website_url = ${input.website_url !== undefined ? input.website_url : existing.website_url},
        category = ${input.category ?? existing.category},
        image_url = ${input.image_url !== undefined ? input.image_url : existing.image_url},
        logo_color = ${input.logo_color !== undefined ? input.logo_color : existing.logo_color},
        tags = ${input.tags !== undefined ? input.tags : existing.tags},
        votes = ${input.votes !== undefined ? input.votes : existing.votes},
        api_available = ${input.api_available !== undefined ? input.api_available : existing.api_available},
        free_plan = ${input.free_plan !== undefined ? input.free_plan : existing.free_plan},
        open_source = ${input.open_source !== undefined ? input.open_source : existing.open_source},
        pricing = ${input.pricing !== undefined ? input.pricing : existing.pricing},
        automation = ${input.automation !== undefined ? input.automation : existing.automation},
        community = ${input.community !== undefined ? input.community : existing.community},
        models = ${input.models !== undefined ? input.models : existing.models},
        features = ${input.features !== undefined ? input.features : existing.features},
        ai_capabilities = ${input.ai_capabilities !== undefined ? input.ai_capabilities : existing.ai_capabilities},
        use_cases = ${input.use_cases !== undefined ? input.use_cases : existing.use_cases},
        featured = ${input.featured !== undefined ? input.featured : existing.featured}
      WHERE id = ${id}
      RETURNING ${sql.unsafe(toolsRepository.selectCols)}
    `;
    return rows[0];
  },

  async remove(id: string) {
    const sql = getDb();
    await sql`DELETE FROM public.tools WHERE id = ${id}`;
  },

  canModify(tool: Tool, user: AuthUser) {
    return user.role === "admin" || tool.created_by === user.id;
  },
};
