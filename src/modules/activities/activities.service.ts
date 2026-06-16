import type { CreateActivityInput } from "@toolhub/shared";
import type { AuthUser } from "../../types/index.js";
import { ForbiddenError } from "../../shared/errors/app-error.js";
import { activitiesRepository } from "./activities.repository.js";

export const activitiesService = {
  async list(
    params: Parameters<typeof activitiesRepository.findMany>[0],
    user: AuthUser,
  ) {
    if (user.role !== "admin") {
      params.user_id = user.id;
    }
    return activitiesRepository.findMany(params);
  },

  async create(input: CreateActivityInput, user: AuthUser) {
    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can manually create activities");
    }
    return activitiesRepository.create({
      user_id: user.id,
      tool_id: input.tool_id,
      action: input.action,
    });
  },
};
