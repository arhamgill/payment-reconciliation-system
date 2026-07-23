import { pool } from '../lib/db';

async function runBenchmark() {
  console.log('--- NEON DATABASE PERFORMANCE BENCHMARK ---');

  // Test Query 1 (First query - tests cold start / connection establishment)
  const start1 = Date.now();
  await pool.query('SELECT 1;');
  const time1 = Date.now() - start1;
  console.log(`Query 1 (Connection / Cold Start Latency): ${time1} ms`);

  // Test Query 2 (Second query - warm connection)
  const start2 = Date.now();
  await pool.query('SELECT 1;');
  const time2 = Date.now() - start2;
  console.log(`Query 2 (Warm Connection Latency): ${time2} ms`);

  // Test Query 3 (Third query)
  const start3 = Date.now();
  await pool.query('SELECT COUNT(*) FROM reconciliation_runs;');
  const time3 = Date.now() - start3;
  console.log(`Query 3 (Table Query Latency): ${time3} ms`);

  await pool.end();
}

runBenchmark().catch((err) => {
  console.error('Benchmark Error:', err);
});
