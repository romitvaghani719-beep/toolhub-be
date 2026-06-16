import type { VercelRequest, VercelResponse } from "@vercel/node";
import { usersController } from "../users/users.controller.js";

export const adminController = {
  listUsers: usersController.list,
  createUser: usersController.create,
  updateUser: usersController.update,
  deleteUser: usersController.remove,
};
