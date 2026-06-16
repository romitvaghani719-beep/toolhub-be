import { adminController } from "../../../src/modules/admin/admin.controller.js";
import { createHandler } from "../../_lib/handler.js";

export default createHandler(async (req, res) => {
  const id = req.query.id as string;
  if (!id) {
    res.status(400).json({ success: false, message: "User id is required" });
    return;
  }

  if (req.method === "PUT") {
    await adminController.updateUser(req, res, id);
    return;
  }
  if (req.method === "DELETE") {
    await adminController.deleteUser(req, res, id);
    return;
  }
  res.status(405).json({ success: false, message: "Method not allowed" });
});
