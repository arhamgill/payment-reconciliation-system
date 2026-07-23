import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Load .env manually if process.env.DATABASE_URL is missing
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (match) {
      dbUrl = match[1];
    }
  }
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const sql = fs.readFileSync(path.join(process.cwd(), 'lib/schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Migration complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
