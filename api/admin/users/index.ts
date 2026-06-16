import { adminController } from "../../../src/modules/admin/admin.controller.js";
import { createHandler } from "../../_lib/handler.js";

export default createHandler(async (req, res) => {
  if (req.method === "GET") {
    await adminController.listUsers(req, res);
    return;
  }
  if (req.method === "POST") {
    await adminController.createUser(req, res);
    return;
  }
  res.status(405).json({ success: false, message: "Method not allowed" });
});
