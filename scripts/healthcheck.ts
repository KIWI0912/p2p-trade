import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const start = Date.now();

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  try {
    await client.connect();
    const r = await client.query('select now() as now');
    const latency = Date.now() - start;
    console.log(JSON.stringify({ ok: true, latencyMs: latency, now: r.rows[0]?.now }));
    process.exit(0);
  } catch (err: any) {
    console.error(JSON.stringify({ ok: false, error: err?.message || String(err) }));
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
