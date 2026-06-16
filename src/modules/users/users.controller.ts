import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createUserSchema,
  updateUserSchema,
  usersQuerySchema,
} from "@toolhub/shared";
import { authenticate, authorize } from "../../shared/middleware/auth.js";
import { validateBody, validateQuery } from "../../shared/middleware/validate.js";
import { paginate, success } from "../../shared/utils/response.js";
import { usersService } from "./users.service.js";

export const usersController = {
  async list(req: VercelRequest, res: VercelResponse) {
    const user = await authenticate(req);
    authorize(user, ["admin", "user"]);

    const parsed = validateQuery(usersQuerySchema, req.query);
    const query = {
      page: parsed.page ?? 1,
      limit: parsed.limit ?? 20,
      search: parsed.search,
    };
    const { items, total } = await usersService.list(query);
    res.status(200).json(success(paginate(items, total, query.page, query.limit)));
  },

  async getById(req: VercelRequest, res: VercelResponse, id: string) {
    const user = await authenticate(req);
    if (user.role !== "admin" && user.id !== id) {
      authorize(user, ["admin"]);
    }
    const profile = await usersService.getById(id);
    res.status(200).json(success(profile));
  },

  async create(req: VercelRequest, res: VercelResponse) {
    const user = await authenticate(req);
    authorize(user, ["admin"]);
    const body = validateBody(createUserSchema, req.body);
    const created = await usersService.create({ ...body, role: body.role ?? "user" });
    res.status(201).json(success(created));
  },

  async update(req: VercelRequest, res: VercelResponse, id: string) {
    const user = await authenticate(req);
    authorize(user, ["admin"]);
    const body = validateBody(updateUserSchema, req.body);
    const updated = await usersService.update(id, body);
    res.status(200).json(success(updated));
  },

  async remove(req: VercelRequest, res: VercelResponse, id: string) {
    const user = await authenticate(req);
    authorize(user, ["admin"]);
    await usersService.remove(id);
    res.status(200).json(success({ deleted: true }));
  },
};
