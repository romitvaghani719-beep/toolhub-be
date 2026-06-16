import { toolsController } from "../../src/modules/tools/tools.controller.js";
import { createHandler } from "../_lib/handler.js";
export default createHandler(async (req, res) => {
    if (req.method === "GET") {
        await toolsController.list(req, res);
        return;
    }
    if (req.method === "POST") {
        await toolsController.create(req, res);
        return;
    }
    res.status(405).json({ success: false, message: "Method not allowed" });
});
