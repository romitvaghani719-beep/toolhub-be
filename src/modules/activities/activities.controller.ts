import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  activitiesQuerySchema,
  createActivitySchema,
} from "@toolhub/shared";
import { authenticate } from "../../shared/middleware/auth.js";
import { validateBody, validateQuery } from "../../shared/middleware/validate.js";
import { paginate, success } from "../../shared/utils/response.js";
import { activitiesService } from "./activities.service.js";

export const activitiesController = {
  async list(req: VercelRequest, res: VercelResponse) {
    const user = await authenticate(req);
    const parsed = validateQuery(activitiesQuerySchema, req.query);
    const query = {
      page: parsed.page ?? 1,
      limit: parsed.limit ?? 20,
      user_id: parsed.user_id,
      tool_id: parsed.tool_id,
      action: parsed.action,
    };
    const { items, total } = await activitiesService.list(query, user);
    res.status(200).json(success(paginate(items, total, query.page, query.limit)));
  },

  async create(req: VercelRequest, res: VercelResponse) {
    const user = await authenticate(req);
    const body = validateBody(createActivitySchema, req.body);
    const activity = await activitiesService.create(body, user);
    res.status(201).json(success(activity));
  },
};
