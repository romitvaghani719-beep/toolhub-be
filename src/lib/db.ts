import postgres from "postgres";
import { getEnv } from "../config/env.js";

let sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!sql) {
    sql = postgres(getEnv().SUPABASE_POOLER_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return sql;
}

export async function closeDb() {
  if (sql) {
    await sql.end();
    sql = null;
  }
}
