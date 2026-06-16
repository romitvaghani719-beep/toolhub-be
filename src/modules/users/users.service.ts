import type { CreateUserInput, UpdateUserInput } from "@toolhub/shared";
import { getSupabaseAdmin } from "../../lib/supabase.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import { usersRepository } from "./users.repository.js";

export const usersService = {
  async list(params: { search?: string; page: number; limit: number }) {
    return usersRepository.findMany(params);
  },

  async getById(id: string) {
    const user = await usersRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async create(input: CreateUserInput) {
    const { data, error } = await getSupabaseAdmin().auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { name: input.name },
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? "Failed to create auth user");
    }

    return usersRepository.createProfile({
      id: data.user.id,
      email: input.email,
      name: input.name,
      role: input.role ?? "user",
    });
  },

  async update(id: string, input: UpdateUserInput) {
    if (input.password || input.email) {
      await getSupabaseAdmin().auth.admin.updateUserById(id, {
        email: input.email,
        password: input.password,
      });
    }

    const updated = await usersRepository.update(id, {
      email: input.email,
      name: input.name,
      role: input.role,
    });
    if (!updated) throw new NotFoundError("User not found");
    return updated;
  },

  async remove(id: string) {
    await usersRepository.remove(id);
    await getSupabaseAdmin().auth.admin.deleteUser(id);
  },
};
