import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import { applyCorsHeaders } from "./shared/middleware/cors.js";

type Handler = (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => Promise<void>;

const routes: Array<{ method: string; pattern: RegExp; keys: string[]; handler: Handler }> = [];

function addRoute(method: string, path: string, handler: Handler) {
  const keys: string[] = [];
  const pattern = new RegExp(
    "^" + path.replace(/:([a-zA-Z]+)/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    }) + "$",
  );
  routes.push({ method, pattern, keys, handler });
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function toVercelReq(req: IncomingMessage, url: URL, body: unknown, params: Record<string, string>) {
  return {
    method: req.method,
    url: url.pathname + url.search,
    headers: req.headers,
    query: { ...Object.fromEntries(url.searchParams), ...params },
    body,
  };
}

function toVercelRes(res: ServerResponse) {
  return {
    status(code: number) {
      res.statusCode = code;
      return this;
    },
    setHeader(name: string, value: string) {
      res.setHeader(name, value);
      return this;
    },
    json(data: unknown) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    },
    end() {
      res.end();
    },
  };
}

async function loadRoutes() {
  const { authController } = await import("./modules/auth/auth.controller.js");
  const { toolsController } = await import("./modules/tools/tools.controller.js");
  const { activitiesController } = await import("./modules/activities/activities.controller.js");
  const { usersController } = await import("./modules/users/users.controller.js");

  addRoute("POST", "/api/auth/login", async (req, res, p) => {
    const body = await readBody(req);
    await authController.login(toVercelReq(req, new URL(req.url!, "http://localhost"), body, p) as never, toVercelRes(res) as never);
  });
  addRoute("POST", "/api/auth/refresh", async (req, res, p) => {
    const body = await readBody(req);
    await authController.refresh(toVercelReq(req, new URL(req.url!, "http://localhost"), body, p) as never, toVercelRes(res) as never);
  });
  addRoute("POST", "/api/auth/logout", async (req, res, p) => {
    await authController.logout(toVercelReq(req, new URL(req.url!, "http://localhost"), {}, p) as never, toVercelRes(res) as never);
  });
  addRoute("GET", "/api/auth/me", async (req, res, p) => {
    await authController.me(toVercelReq(req, new URL(req.url!, "http://localhost"), {}, p) as never, toVercelRes(res) as never);
  });
  addRoute("GET", "/api/tools", async (req, res, p) => {
    const url = new URL(req.url!, "http://localhost");
    await toolsController.list(toVercelReq(req, url, {}, p) as never, toVercelRes(res) as never);
  });
  addRoute("POST", "/api/tools", async (req, res, p) => {
    const body = await readBody(req);
    await toolsController.create(toVercelReq(req, new URL(req.url!, "http://localhost"), body, p) as never, toVercelRes(res) as never);
  });
  addRoute("GET", "/api/tools/:id", async (req, res, p) => {
    await toolsController.getById(toVercelReq(req, new URL(req.url!, "http://localhost"), {}, p) as never, toVercelRes(res) as never, p.id);
  });
  addRoute("PUT", "/api/tools/:id", async (req, res, p) => {
    const body = await readBody(req);
    await toolsController.update(toVercelReq(req, new URL(req.url!, "http://localhost"), body, p) as never, toVercelRes(res) as never, p.id);
  });
  addRoute("DELETE", "/api/tools/:id", async (req, res, p) => {
    await toolsController.remove(toVercelReq(req, new URL(req.url!, "http://localhost"), {}, p) as never, toVercelRes(res) as never, p.id);
  });
  addRoute("GET", "/api/activities", async (req, res, p) => {
    await activitiesController.list(toVercelReq(req, new URL(req.url!, "http://localhost"), {}, p) as never, toVercelRes(res) as never);
  });
  addRoute("GET", "/api/admin/users", async (req, res, p) => {
    await usersController.list(toVercelReq(req, new URL(req.url!, "http://localhost"), {}, p) as never, toVercelRes(res) as never);
  });
  addRoute("POST", "/api/admin/users", async (req, res, p) => {
    const body = await readBody(req);
    await usersController.create(toVercelReq(req, new URL(req.url!, "http://localhost"), body, p) as never, toVercelRes(res) as never);
  });
  addRoute("PUT", "/api/admin/users/:id", async (req, res, p) => {
    const body = await readBody(req);
    await usersController.update(toVercelReq(req, new URL(req.url!, "http://localhost"), body, p) as never, toVercelRes(res) as never, p.id);
  });
  addRoute("DELETE", "/api/admin/users/:id", async (req, res, p) => {
    await usersController.remove(toVercelReq(req, new URL(req.url!, "http://localhost"), {}, p) as never, toVercelRes(res) as never, p.id);
  });
}

const port = Number(process.env.PORT ?? 3001);

loadRoutes().then(() => {
  createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);
    applyCorsHeaders(res, req.headers.origin);

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    for (const route of routes) {
      if (route.method !== req.method) continue;
      const match = url.pathname.match(route.pattern);
      if (!match) continue;
      const params: Record<string, string> = {};
      route.keys.forEach((key, i) => {
        params[key] = match[i + 1];
      });
      try {
        await route.handler(req, res, params);
      } catch (err) {
        console.error(err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "Internal server error" }));
      }
      return;
    }

    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, message: "Not found" }));
  }).listen(port, () => {
    console.log(`API dev server running at http://localhost:${port}`);
  });
});
