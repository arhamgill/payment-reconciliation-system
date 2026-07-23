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

  // Update existing mismatched rows to granular mismatch statuses
  await pool.query(`
    UPDATE reconciliation_results
    SET match_status = CASE
      WHEN bank_amount <> internal_amount AND bank_date <> internal_date THEN 'amount_and_date_mismatch'
      WHEN bank_amount <> internal_amount THEN 'amount_mismatch'
      WHEN bank_date <> internal_date THEN 'date_mismatch'
      ELSE match_status
    END
    WHERE match_status = 'mismatched';
  `);

  // Update existing runs to granular status (discrepancies_found vs fully_balanced)
  await pool.query(`
    UPDATE reconciliation_runs
    SET status = CASE
      WHEN (mismatched_count + missing_in_bank_count + missing_in_internal_count) > 0 THEN 'discrepancies_found'
      ELSE 'fully_balanced'
    END;
  `);

  console.log('Migration complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
