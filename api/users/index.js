import { usersController } from "../../src/modules/users/users.controller.js";
import { createHandler } from "../_lib/handler.js";
export default createHandler(async (req, res) => {
    if (req.method === "GET") {
        await usersController.list(req, res);
        return;
    }
    if (req.method === "POST") {
        await usersController.create(req, res);
        return;
    }
    res.status(405).json({ success: false, message: "Method not allowed" });
});
