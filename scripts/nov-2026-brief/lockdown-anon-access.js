#!/usr/bin/env node
/**
 * Loveridge — close direct database access through the public Supabase "anon" key.
 *
 * WHY: NEXT_PUBLIC_SUPABASE_ANON_KEY is shipped to every browser. On 20 Nov 2026 that key could
 *   - read and WRITE/DELETE system_settings (RLS disabled): site settings, hero slides, the
 *     properties_catalog backup (which contains owner names and phone numbers) and the list of
 *     deleted listings — enough to deface the site or hide every listing;
 *   - read and WRITE gallery_items (RLS disabled);
 *   - read ownerName / ownerPhone straight from the properties table.
 *
 * The website itself never reads tables with the anon key (it uses Prisma as `postgres` and the
 * service-role key on the server; the browser only joins a realtime *broadcast* channel), so
 * removing anon/authenticated table access does not affect the site.
 *
 *   node scripts/nov-2026-brief/lockdown-anon-access.js           # show current exposure (read-only)
 *   node scripts/nov-2026-brief/lockdown-anon-access.js --apply   # apply the lockdown
 *
 * To undo (not recommended): GRANT SELECT ON <table> TO anon; and drop RLS as needed.
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } } });

const STATEMENTS = [
  'ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY',
  'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated',
  'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated',
  'REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated',
  // New tables created later (e.g. by `prisma db push`) must not silently become public again.
  'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated',
  'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated',
  'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated',
  // Leftover test row proving anonymous writes worked.
  "DELETE FROM public.system_settings WHERE key = 'test_anon'",
];

async function report(label) {
  const grants = await prisma.$queryRawUnsafe(
    `SELECT table_name, string_agg(privilege_type, ',' ORDER BY privilege_type) AS privs
       FROM information_schema.role_table_grants
      WHERE grantee IN ('anon','authenticated') AND table_schema = 'public'
      GROUP BY table_name ORDER BY table_name`
  );
  const rls = await prisma.$queryRawUnsafe(
    `SELECT c.relname, c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = false ORDER BY 1`
  );
  console.log(`\n${label}`);
  console.log(`  tables WITHOUT row-level security: ${rls.map((r) => r.relname).join(', ') || 'none'}`);
  console.log(`  tables the public anon/authenticated roles can access: ${grants.length}`);
  for (const g of grants) console.log(`    - ${g.table_name}: ${g.privs}`);
}

async function main() {
  console.log(`Supabase anon-key lockdown — ${APPLY ? 'APPLY MODE' : 'REPORT ONLY (no changes)'}`);
  await report('Current exposure:');
  if (!APPLY) {
    console.log('\nWould run:');
    STATEMENTS.forEach((s) => console.log(`  ${s};`));
    console.log('\nRun with --apply to execute.');
    return;
  }
  for (const sql of STATEMENTS) {
    process.stdout.write(`  ${sql} ... `);
    await prisma.$executeRawUnsafe(sql);
    console.log('ok');
  }
  await report('After lockdown:');

  // Verify with the real public key that nothing is readable any more.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    console.log('\nVerifying with the public anon key:');
    for (const table of ['properties', 'system_settings', 'gallery_items', 'users', 'leads']) {
      const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
      const body = await res.text();
      const exposed = res.ok && body.trim().startsWith('[') && body.trim() !== '[]';
      console.log(`  ${table}: HTTP ${res.status} ${exposed ? '❌ STILL READABLE' : '✓ blocked'}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('\nFAILED:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
