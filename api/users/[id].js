import { usersController } from "../../src/modules/users/users.controller.js";
import { createHandler } from "../_lib/handler.js";
export default createHandler(async (req, res) => {
    const id = req.query.id;
    if (!id) {
        res.status(400).json({ success: false, message: "User id is required" });
        return;
    }
    if (req.method === "GET") {
        await usersController.getById(req, res, id);
        return;
    }
    if (req.method === "PUT") {
        await usersController.update(req, res, id);
        return;
    }
    if (req.method === "DELETE") {
        await usersController.remove(req, res, id);
        return;
    }
    res.status(405).json({ success: false, message: "Method not allowed" });
});
