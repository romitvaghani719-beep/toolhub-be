import { activitiesController } from "../../src/modules/activities/activities.controller.js";
import { createHandler } from "../_lib/handler.js";

export default createHandler(async (req, res) => {
  if (req.method === "GET") {
    await activitiesController.list(req, res);
    return;
  }
  if (req.method === "POST") {
    await activitiesController.create(req, res);
    return;
  }
  res.status(405).json({ success: false, message: "Method not allowed" });
});
