import { z } from "zod";

export const roleSchema = z.enum(["admin", "user"]);
export type Role = z.infer<typeof roleSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const sessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
});
export type SessionTokens = z.infer<typeof sessionSchema>;

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(120),
  role: roleSchema.default("user"),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(120).optional(),
  role: roleSchema.optional(),
  password: z.string().min(6).optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: roleSchema,
  created_at: z.string(),
  updated_at: z.string(),
});
export type User = z.infer<typeof userSchema>;
