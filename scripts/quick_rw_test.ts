import 'dotenv/config';
import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  try {
    await client.connect();

    await client.query(`create table if not exists _probe(
      id serial primary key,
      note text not null,
      created_at timestamptz not null default now()
    )`);

    const note = 'hello_pg_' + Date.now();
    await client.query('insert into _probe(note) values($1)', [note]);

    const { rows } = await client.query('select id, note, created_at from _probe order by id desc limit 1');
    console.log(JSON.stringify({ ok: true, lastRow: rows[0] }));
  } catch (e: any) {
    console.error(JSON.stringify({ ok: false, error: e?.message || String(e) }));
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

run();
