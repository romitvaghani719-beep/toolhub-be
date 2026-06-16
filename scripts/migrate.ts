import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "../supabase/migrations");

async function migrate() {
  const url = process.env.SUPABASE_POOLER_URL;
  if (!url) {
    console.error("SUPABASE_POOLER_URL is required in .env");
    process.exit(1);
  }

  const sql = postgres(url, { max: 1, prepare: false });
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    for (const file of files) {
      const applied = await sql`
        SELECT 1 FROM public.schema_migrations WHERE filename = ${file}
      `;
      if (applied.length > 0) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      const content = readFileSync(join(migrationsDir, file), "utf8");
      console.log(`Applying ${file}...`);
      await sql.unsafe(content);
      await sql`INSERT INTO public.schema_migrations (filename) VALUES (${file})`;
      console.log(`Applied ${file}`);
    }

    console.log("Migrations complete.");
  } finally {
    await sql.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
