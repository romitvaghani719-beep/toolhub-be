import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  type CreateToolInput,
  type UpdateToolInput,
  createToolSchema,
  toolsQuerySchema,
  updateToolSchema,
} from "@toolhub/shared";
import { authenticate, optionalAuth } from "../../shared/middleware/auth.js";
import { validateBody, validateQuery } from "../../shared/middleware/validate.js";
import { paginate, success } from "../../shared/utils/response.js";
import { toolsService } from "./tools.service.js";

export const toolsController = {
  async list(req: VercelRequest, res: VercelResponse) {
    await optionalAuth(req);
    const parsed = validateQuery(toolsQuerySchema, req.query);
    const query = {
      page: parsed.page ?? 1,
      limit: parsed.limit ?? 12,
      sort: parsed.sort ?? "newest",
      search: parsed.search,
      category: parsed.category,
    };
    const { items, total } = await toolsService.list(query);
    res.status(200).json(success(paginate(items, total, query.page, query.limit)));
  },

  async getById(req: VercelRequest, res: VercelResponse, id: string) {
    await optionalAuth(req);
    const data = await toolsService.getById(id);
    res.status(200).json(success(data));
  },

  async create(req: VercelRequest, res: VercelResponse) {
    const user = await authenticate(req);
    const body = validateBody(createToolSchema, req.body);
    const tool = await toolsService.create(body as CreateToolInput, user);
    res.status(201).json(success(tool));
  },

  async update(req: VercelRequest, res: VercelResponse, id: string) {
    const user = await authenticate(req);
    const body = validateBody(updateToolSchema, req.body);
    const tool = await toolsService.update(id, body as UpdateToolInput, user);
    res.status(200).json(success(tool));
  },

  async remove(req: VercelRequest, res: VercelResponse, id: string) {
    const user = await authenticate(req);
    await toolsService.remove(id, user);
    res.status(200).json(success({ deleted: true }));
  },
};
