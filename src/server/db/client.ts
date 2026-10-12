import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Vercel（本番と確かめ用の公開）だけで付ける。関数が使い回されて、開いた接続が残るのは Vercel の上だけなので、手元と CI では要らない
if (process.env.VERCEL) {
  attachDatabasePool(pool);
}

export const db = drizzle({ client: pool, schema });
