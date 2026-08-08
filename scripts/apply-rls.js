const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load .env file variables manually if not loaded
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2];
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

// Connect via DIRECT_URL (port 5432) for direct DDL execution
const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
console.log(`Connecting to Postgres target: ${directUrl.includes(':5432') ? 'DIRECT (Port 5432)' : 'POOLED'}`);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
});

function parseSqlStatements(sqlContent) {
  // Strip single line comments (-- ...)
  const cleaned = sqlContent
    .split('\n')
    .map(line => {
      const commentIdx = line.indexOf('--');
      return commentIdx >= 0 ? line.substring(0, commentIdx) : line;
    })
    .join('\n');

  // Split into individual SQL statements by semicolon
  return cleaned
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

async function applyRLS() {
  console.log('🔒 Starting Row Level Security (RLS) enforcement on PostgreSQL...');
  
  const sqlPath = path.join(__dirname, '..', 'prisma', 'enable_rls.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  const statements = parseSqlStatements(sqlContent);

  console.log(`📋 Found ${statements.length} SQL statements to execute.`);

  let count = 0;
  for (const statement of statements) {
    process.stdout.write(`Executing [${count + 1}/${statements.length}]: ${statement.substring(0, 45)}... `);
    try {
      await prisma.$executeRawUnsafe(statement);
      console.log('OK');
      count++;
    } catch (err) {
      console.log('FAILED');
      console.error(`❌ Error executing statement:\n${statement}\nError:`, err.message);
      throw err;
    }
  }

  console.log(`\n✅ Successfully executed all ${count} SQL statements!`);

  // Verify status of all public tables
  const tables = await prisma.$queryRawUnsafe(`
    SELECT 
      c.relname AS table_name,
      c.relrowsecurity AS rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname;
  `);

  console.log('\n📊 Updated RLS Status for Public Schema Tables:');
  console.table(tables);

  const disabledTables = tables.filter(t => !t.rls_enabled);
  if (disabledTables.length > 0) {
    console.error('⚠️ Warning: Some tables still have RLS disabled:', disabledTables.map(t => t.table_name));
    process.exit(1);
  } else {
    console.log('\n🎉 SUCCESS: 100% of public schema tables now have Row Level Security enabled!');
  }

  // List all active policies
  const policies = await prisma.$queryRawUnsafe(`
    SELECT tablename, policyname, cmd 
    FROM pg_policies 
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `);

  console.log('\n🛡️ Installed Security Policies:');
  console.table(policies);
}

applyRLS()
  .catch(err => {
    console.error('Fatal error applying RLS:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
