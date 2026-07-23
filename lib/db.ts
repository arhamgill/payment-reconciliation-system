import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && typeof window === 'undefined') {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
      if (match) {
        dbUrl = match[1];
      }
    }
  } catch {
    // Ignore error
  }
}

const globalForPg = globalThis as unknown as { pool: Pool | undefined };

export const pool =
  globalForPg.pool ??
  new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pool = pool;
}
