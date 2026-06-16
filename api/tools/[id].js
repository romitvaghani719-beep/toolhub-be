import { toolsController } from "../../src/modules/tools/tools.controller.js";
import { createHandler } from "../_lib/handler.js";
export default createHandler(async (req, res) => {
    const id = req.query.id;
    if (!id) {
        res.status(400).json({ success: false, message: "Tool id is required" });
        return;
    }
    if (req.method === "GET") {
        await toolsController.getById(req, res, id);
        return;
    }
    if (req.method === "PUT") {
        await toolsController.update(req, res, id);
        return;
    }
    if (req.method === "DELETE") {
        await toolsController.remove(req, res, id);
        return;
    }
    res.status(405).json({ success: false, message: "Method not allowed" });
});
