#!/usr/bin/env node
/**
 * Loveridge — full database backup to this computer.
 *
 *   node scripts/backup-database.js
 *
 * Saves every table in the public schema (listings, products, leads, users, settings, …) to
 *   backups/loveridge-db-YYYY-MM-DDTHH-MM.json.gz
 * and keeps the newest 30 backups. The backups/ folder is git-ignored and must NEVER be
 * committed: it contains customer leads and staff password hashes.
 *
 * This is a safety net on top of Supabase's own backups (Supabase dashboard →
 * Database → Backups; daily backups need a paid plan). Run it weekly and before big changes.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { PrismaClient } = require('@prisma/client');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const KEEP = 30;
const OUT_DIR = path.join(__dirname, '..', 'backups');
const prisma = new PrismaClient();

function replacer(_key, value) {
  if (typeof value === 'bigint') return value.toString();
  if (value && value.type === 'Buffer' && Array.isArray(value.data)) return Buffer.from(value.data).toString('base64');
  return value;
}

async function main() {
  const tables = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name`
  );

  const dump = { createdAt: new Date().toISOString(), source: 'loveridge-supabase', tables: {} };
  let totalRows = 0;
  for (const { table_name } of tables) {
    if (!/^[a-z0-9_]+$/i.test(table_name)) continue;
    const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "public"."${table_name}"`);
    dump.tables[table_name] = rows;
    totalRows += rows.length;
    console.log(`  ${table_name.padEnd(22)} ${rows.length} rows`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
  const file = path.join(OUT_DIR, `loveridge-db-${stamp}.json.gz`);
  fs.writeFileSync(file, zlib.gzipSync(JSON.stringify(dump, replacer)), { mode: 0o600 });

  // Self-check: the file must read back with the same row counts.
  const back = JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString('utf-8'));
  const backRows = Object.values(back.tables).reduce((n, rows) => n + rows.length, 0);
  if (backRows !== totalRows) throw new Error(`Verification failed: wrote ${totalRows} rows, read back ${backRows}`);

  const old = fs.readdirSync(OUT_DIR).filter((f) => /^loveridge-db-.*\.json\.gz$/.test(f)).sort();
  for (const f of old.slice(0, Math.max(0, old.length - KEEP))) fs.unlinkSync(path.join(OUT_DIR, f));

  const kb = Math.round(fs.statSync(file).size / 1024);
  console.log(`\n✓ Backup saved and verified: ${path.relative(process.cwd(), file)} (${totalRows} rows, ${kb} KB)`);
}

main()
  .catch((e) => {
    console.error('\nBACKUP FAILED:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
