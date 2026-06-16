import { authController } from "../../src/modules/auth/auth.controller.js";
import { createHandler } from "../_lib/handler.js";

export default createHandler(async (req, res) => {
  if (req.method === "GET") {
    await authController.me(req, res);
    return;
  }
  res.status(405).json({ success: false, message: "Method not allowed" });
});
