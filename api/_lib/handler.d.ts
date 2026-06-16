import type { VercelRequest, VercelResponse } from "@vercel/node";
export declare function createHandler(fn: (req: VercelRequest, res: VercelResponse) => Promise<void>): (req: VercelRequest, res: VercelResponse) => Promise<void>;
