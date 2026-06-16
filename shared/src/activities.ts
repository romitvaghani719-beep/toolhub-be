import { z } from "zod";

export const activityActionSchema = z.enum(["created", "updated", "deleted"]);
export type ActivityAction = z.infer<typeof activityActionSchema>;

export const createActivitySchema = z.object({
  tool_id: z.string().uuid(),
  action: activityActionSchema,
});
export type CreateActivityInput = z.infer<typeof createActivitySchema>;

export const activitySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  tool_id: z.string().uuid(),
  action: activityActionSchema,
  created_at: z.string(),
});
export type Activity = z.infer<typeof activitySchema>;

export const activitiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  user_id: z.string().uuid().optional(),
  tool_id: z.string().uuid().optional(),
  action: activityActionSchema.optional(),
});
export type ActivitiesQuery = z.infer<typeof activitiesQuerySchema>;

export const usersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});
export type UsersQuery = z.infer<typeof usersQuerySchema>;
