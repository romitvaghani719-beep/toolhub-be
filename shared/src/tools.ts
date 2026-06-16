import { z } from "zod";

export const toolCategorySchema = z.enum([
  "chat",
  "code",
  "image",
  "writing",
  "audio",
  "auto",
  "data",
  "search",
]);

export const createToolSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  website_url: z
    .string()
    .url("Invalid URL")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v ?? null)),
  category: toolCategorySchema,
  image_url: z.string().url().optional().nullable().or(z.literal("")),
  logo_color: z.string().optional().nullable(),
  tags: z.array(z.string().min(1)).max(20).default([]),
  votes: z.coerce.number().int().min(0).default(0),
  api_available: z.boolean().default(false),
  free_plan: z.boolean().default(false),
  open_source: z.boolean().default(false),
  pricing: z.string().max(300).optional().nullable(),
  automation: z.string().max(300).optional().nullable(),
  community: z.string().max(300).optional().nullable(),
  models: z.array(z.string()).max(30).default([]),
  features: z.array(z.string()).max(50).default([]),
  ai_capabilities: z.array(z.string()).max(50).default([]),
  use_cases: z.array(z.string()).max(50).default([]),
  featured: z.boolean().default(false),
});
export type CreateToolInput = z.infer<typeof createToolSchema>;

export const updateToolSchema = createToolSchema.partial();
export type UpdateToolInput = z.infer<typeof updateToolSchema>;

export const toolSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  website_url: z.string().nullable(),
  category: z.string(),
  image_url: z.string().nullable(),
  logo_color: z.string().nullable(),
  tags: z.array(z.string()),
  votes: z.number().int(),
  api_available: z.boolean(),
  free_plan: z.boolean(),
  open_source: z.boolean(),
  pricing: z.string().nullable(),
  automation: z.string().nullable(),
  community: z.string().nullable(),
  models: z.array(z.string()),
  features: z.array(z.string()),
  ai_capabilities: z.array(z.string()),
  use_cases: z.array(z.string()),
  featured: z.boolean(),
  created_by: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Tool = z.infer<typeof toolSchema>;

export const toolsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["newest", "name", "votes"]).default("newest"),
});
export type ToolsQuery = z.infer<typeof toolsQuerySchema>;
