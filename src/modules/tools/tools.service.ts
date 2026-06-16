import type { CreateToolInput, UpdateToolInput } from "@toolhub/shared";
import { ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js";
import type { AuthUser } from "../../types/index.js";
import { activitiesRepository } from "../activities/activities.repository.js";
import { usersRepository } from "../users/users.repository.js";
import { toolsRepository } from "./tools.repository.js";

export const toolsService = {
  async list(params: Parameters<typeof toolsRepository.findMany>[0]) {
    return toolsRepository.findMany(params);
  },

  async getById(id: string) {
    const tool = await toolsRepository.findById(id);
    if (!tool) throw new NotFoundError("Tool not found");

    const [creator, related, activities] = await Promise.all([
      tool.created_by ? usersRepository.findById(tool.created_by) : null,
      toolsRepository.findRelated(tool.category, tool.id),
      activitiesRepository.findByTool(id, 10),
    ]);

    return { tool, creator, related, activities };
  },

  async create(input: CreateToolInput, user: AuthUser) {
    const tool = await toolsRepository.create({
      name: input.name,
      category: input.category,
      description: input.description ?? null,
      website_url: input.website_url ?? null,
      image_url: input.image_url ?? null,
      logo_color: input.logo_color ?? null,
      tags: input.tags ?? [],
      votes: input.votes ?? 0,
      api_available: input.api_available ?? false,
      free_plan: input.free_plan ?? false,
      open_source: input.open_source ?? false,
      pricing: input.pricing ?? null,
      automation: input.automation ?? null,
      community: input.community ?? null,
      models: input.models ?? [],
      features: input.features ?? [],
      ai_capabilities: input.ai_capabilities ?? [],
      use_cases: input.use_cases ?? [],
      featured: input.featured ?? false,
      created_by: user.id,
    });

    await activitiesRepository.create({
      user_id: user.id,
      tool_id: tool.id,
      action: "created",
    });

    return tool;
  },

  async update(id: string, input: UpdateToolInput, user: AuthUser) {
    const existing = await toolsRepository.findById(id);
    if (!existing) throw new NotFoundError("Tool not found");
    if (!toolsRepository.canModify(existing, user)) {
      throw new ForbiddenError("You cannot edit this tool");
    }

    const updated = await toolsRepository.update(id, {
      ...input,
      website_url: input.website_url === "" ? null : input.website_url,
      image_url: input.image_url === "" ? null : input.image_url,
      pricing: input.pricing === "" ? null : input.pricing,
      automation: input.automation === "" ? null : input.automation,
      community: input.community === "" ? null : input.community,
    });

    await activitiesRepository.create({
      user_id: user.id,
      tool_id: id,
      action: "updated",
    });

    return updated;
  },

  async remove(id: string, user: AuthUser) {
    const existing = await toolsRepository.findById(id);
    if (!existing) throw new NotFoundError("Tool not found");
    if (!toolsRepository.canModify(existing, user)) {
      throw new ForbiddenError("You cannot delete this tool");
    }

    await activitiesRepository.create({
      user_id: user.id,
      tool_id: id,
      action: "deleted",
    });
    await toolsRepository.remove(id);
  },
};
