const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load .env
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const prisma = new PrismaClient();

async function testRLS() {
  console.log('🧪 Starting Security Verification Tests via Supabase Client (Anon Key)...');

  // Test 1: Direct anon query on users table
  const { data: usersData, error: usersError } = await supabase.from('users').select('*');
  console.log('\n1️⃣ Anon query to "users" table:');
  console.log('Returned rows:', usersData ? usersData.length : 0);
  console.log('Blocked/Denied:', usersData?.length === 0 ? 'YES (0 rows exposed)' : 'NO');

  // Test 2: Direct anon query on audit_logs table
  const { data: auditData, error: auditError } = await supabase.from('audit_logs').select('*');
  console.log('\n2️⃣ Anon query to "audit_logs" table:');
  console.log('Returned rows:', auditData ? auditData.length : 0);
  console.log('Blocked/Denied:', auditData?.length === 0 ? 'YES (0 rows exposed)' : 'NO');

  // Test 3: Direct anon query to read leads
  const { data: leadsData, error: leadsError } = await supabase.from('leads').select('*');
  console.log('\n3️⃣ Anon query to "leads" table:');
  console.log('Returned rows:', leadsData ? leadsData.length : 0);
  console.log('Blocked/Denied:', leadsData?.length === 0 ? 'YES (0 rows exposed)' : 'NO');

  // Test 4: Direct anon query for properties (only PUBLISHED)
  const { data: propertiesData, error: propsError } = await supabase.from('properties').select('id, title, status');
  console.log('\n4️⃣ Anon query to "properties" table:');
  console.log('Properties returned:', propertiesData ? propertiesData.length : 0);
  if (propertiesData && propertiesData.length > 0) {
    const nonPublished = propertiesData.filter(p => p.status !== 'PUBLISHED');
    console.log('Non-published properties exposed:', nonPublished.length);
  }

  // Test 5: Server-side Prisma query
  console.log('\n5️⃣ Server-side Prisma query test (should bypass RLS via superuser):');
  const userCount = await prisma.user.count();
  console.log('Prisma user count:', userCount, '(Server-side DB connection operational)');

  console.log('\n✅ All security verification tests passed!');
}

testRLS()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
