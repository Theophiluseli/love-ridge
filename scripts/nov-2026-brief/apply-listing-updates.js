#!/usr/bin/env node
/**
 * Loveridge — Nov 2026 developer brief: listing data updates.
 *
 * Covers:  Fix 2 / 6.4  rename the three "untitled-…" slugs (+ remember old slugs for 301s)
 *          Fix 4        Peduase city -> Aburi
 *          Fix 6.3      region follows city for every listing (Kumasi -> Ashanti, Aburi -> Eastern …)
 *          Fix 9        Peduase price / negotiable / land size / titled land / map pin / amenities
 *          Fix 10       Afienya shops listing, created as a DRAFT (add approved photos, then Publish)
 *
 * SAFE BY DEFAULT: prints what it would change and writes nothing.
 *
 *   node scripts/nov-2026-brief/apply-listing-updates.js            # dry run
 *   node scripts/nov-2026-brief/apply-listing-updates.js --apply    # write changes
 *
 * Idempotent: running it again after --apply reports "no change" for everything already done.
 * Run it AFTER the new code is deployed (the code already serves the new URLs either way).
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load .env when run locally.
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient();

const SLUG_RENAMES = [
  { id: 'prop-1788673496508', from: 'untitled-property-listing-draft-5823', to: '6-bedroom-house-pool-peduase-aburi' },
  { id: 'prop-1791596202249', from: 'untitled-property-listing-draft-1008', to: '4-bedroom-house-pool-for-sale-east-legon' },
  { id: 'prop-1790872421842', from: 'untitled-property-listing-draft-9116', to: '3-bedroom-house-boys-quarters-for-sale-lakeside-accra' },
];

// Keep in sync with src/lib/locations.ts
const CITY_REGION = {
  Accra: 'Greater Accra', Tema: 'Greater Accra', Afienya: 'Greater Accra', Dodowa: 'Greater Accra', Prampram: 'Greater Accra',
  Kasoa: 'Central', 'Cape Coast': 'Central',
  Aburi: 'Eastern', Peduase: 'Eastern', Akropong: 'Eastern', Koforidua: 'Eastern',
  Kumasi: 'Ashanti', Takoradi: 'Western',
};

const PEDUASE_ID = 'prop-1788673496508';
const PEDUASE_AMENITIES = ['Titled land', 'Swimming pool', 'Garage', "Annexe (Boys' quarters)", 'Roof terrace'];

const AFIENYA = {
  slug: 'shops-for-rent-bright-international-industrial-park-afienya',
  title: 'Shops for Rent – Bright International Industrial Park, Afienya – Shai Hills (62–65 m²)',
  description: [
    'Shops for Rent – Bright International Industrial Park, Afienya – Shai Hills',
    '',
    'Brand-new glass-front shops inside Bright International Industrial Park, Afienya – Shai Hills, near Tema. Several shops available, each 62–65 m².',
    '',
    'KEY FEATURES',
    '• Brand-new glass-front shops, 62–65 m² each',
    '• Covered walkway and parking',
    '• About 70 factories and 10,000+ workers in the park',
    '• AfriMall inside the park',
    '• A US$300 million amusement park and resort is being built next door',
    '',
    'IDEAL FOR',
    'Food spot, café, pharmacy, mini-mart, mobile money, crafts and souvenirs, salon.',
    '',
    'RENT: US$6 per m² per month (about US$372–390 per shop per month).',
    '',
    '📞 Call: +233 24 643 2493',
    '💬 WhatsApp: +233 53 434 3444',
    '📧 info@loveridgeproperty.com',
  ].join('\n'),
  listingType: 'RENT',
  propertyType: 'SHOP',
  status: 'DRAFT',
  price: 372,
  currency: 'USD',
  pricePeriod: 'per month',
  negotiable: false,
  locationAddress: 'Bright International Industrial Park, Afienya – Shai Hills, near Tema',
  city: 'Afienya',
  region: 'Greater Accra',
  country: 'Ghana',
};

const changes = [];
function plan(label, detail) {
  changes.push(label);
  console.log(`  • ${label}${detail ? `\n      ${detail}` : ''}`);
}

async function getSetting(key, fallback) {
  const rows = await prisma.$queryRaw`SELECT value FROM system_settings WHERE key = ${key} LIMIT 1`;
  if (!rows.length) return fallback;
  let v = rows[0].value;
  try { v = typeof v === 'string' ? JSON.parse(v) : v; } catch (_) {}
  try { if (typeof v === 'string') v = JSON.parse(v); } catch (_) {}
  return v ?? fallback;
}
async function setSetting(key, value) {
  const json = JSON.stringify(value);
  await prisma.$executeRaw`
    INSERT INTO system_settings (key, value, updated_at) VALUES (${key}, ${json}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`;
}

async function syncAmenities(propertyId, names) {
  const ids = [];
  for (const name of names) {
    const found = await prisma.amenity.findFirst({ where: { name: { equals: name, mode: 'insensitive' } }, select: { id: true } });
    ids.push(found ? found.id : (await prisma.amenity.upsert({ where: { name }, create: { name }, update: {}, select: { id: true } })).id);
  }
  await prisma.$transaction([
    prisma.propertyAmenity.deleteMany({ where: { propertyId, amenityId: { notIn: ids } } }),
    prisma.propertyAmenity.createMany({ data: ids.map((amenityId) => ({ propertyId, amenityId })), skipDuplicates: true }),
  ]);
}

async function main() {
  console.log(`\nLoveridge listing updates — ${APPLY ? 'APPLY MODE (writing to database)' : 'DRY RUN (no changes written)'}\n`);
  const catalogPatches = new Map(); // id -> fields to merge into the properties_catalog backup

  // ---------- 1. Slug renames ----------
  console.log('1) Listing URLs (slugs)');
  const redirects = await getSetting('property_slug_redirects', {});
  const newRedirects = { ...(redirects && typeof redirects === 'object' ? redirects : {}) };
  for (const r of SLUG_RENAMES) {
    const p = await prisma.property.findUnique({ where: { id: r.id }, select: { id: true, slug: true, title: true } });
    if (!p) { console.log(`  ! ${r.id} not found — skipped`); continue; }
    if (newRedirects[r.from] !== r.id) newRedirects[r.from] = r.id;
    if (p.slug === r.to) { console.log(`  = ${r.to} (already renamed)`); continue; }
    if (p.slug !== r.from) { console.log(`  ! ${r.id} has slug "${p.slug}" (expected "${r.from}") — left unchanged`); continue; }
    const clash = await prisma.property.findFirst({ where: { slug: r.to, NOT: { id: r.id } }, select: { id: true } });
    if (clash) { console.log(`  ! "${r.to}" is already used by ${clash.id} — skipped`); continue; }
    plan(`rename /properties/${r.from}  ->  /properties/${r.to}`, p.title);
    if (APPLY) await prisma.property.update({ where: { id: r.id }, data: { slug: r.to } });
    catalogPatches.set(r.id, { ...(catalogPatches.get(r.id) || {}), slug: r.to });
  }
  if (JSON.stringify(newRedirects) !== JSON.stringify(redirects)) {
    plan('record old slugs in property_slug_redirects (permanent redirects)');
    if (APPLY) await setSetting('property_slug_redirects', newRedirects);
  }

  // ---------- 2. Peduase details (Fix 4 + Fix 9) ----------
  console.log('\n2) Peduase listing details');
  const beforePeduase = changes.length;
  const ped = await prisma.property.findUnique({ where: { id: PEDUASE_ID }, include: { amenities: { include: { amenity: true } } } });
  if (!ped) {
    console.log('  ! Peduase listing not found — skipped');
  } else {
    const update = {};
    if (ped.price !== 1000000) update.price = 1000000;
    if (ped.currency !== 'USD') update.currency = 'USD';
    if (ped.negotiable !== true) update.negotiable = true;
    if (ped.sizeSqft !== 10880) update.sizeSqft = 10880;
    if (ped.livingAreaSqft !== null) update.livingAreaSqft = null; // unknown for now -> hidden
    if (ped.lat !== 5.816038608551025) update.lat = 5.816038608551025;
    if (ped.lng !== -0.17797242105007172) update.lng = -0.17797242105007172;
    if (ped.city !== 'Aburi') update.city = 'Aburi';
    if (ped.region !== 'Eastern') update.region = 'Eastern';

    let desc = ped.description || '';
    if (!desc.includes('10,880 sq ft')) {
      if (desc.includes('PRICE: US$1,000,000')) {
        desc = desc.replace(
          'PRICE: US$1,000,000',
          'LAND SIZE\n10,880 sq ft (about 1,011 m², about a quarter acre)\n\nPRICE: US$1,000,000 (negotiable)'
        );
      } else {
        console.log('  ! could not find "PRICE: US$1,000,000" in the description — land size line NOT added; edit in admin');
      }
    }
    if (!/titled land/i.test(desc)) {
      if (desc.includes('DOCUMENTATION\nTitle and indenture checked')) {
        desc = desc.replace('DOCUMENTATION\nTitle and indenture checked', 'DOCUMENTATION\nTitled land. Title and indenture checked');
      } else {
        console.log('  ! could not find the DOCUMENTATION paragraph — "Titled land" NOT added to description; edit in admin');
      }
    }
    if (desc !== ped.description) update.description = desc;

    for (const [k, v] of Object.entries(update)) {
      if (k === 'description') plan('description: add land size, "Titled land" and "(negotiable)"');
      else plan(`${k}: ${JSON.stringify(ped[k])} -> ${JSON.stringify(v)}`);
    }
    if (APPLY && Object.keys(update).length) await prisma.property.update({ where: { id: PEDUASE_ID }, data: update });
    if (Object.keys(update).length) catalogPatches.set(PEDUASE_ID, { ...(catalogPatches.get(PEDUASE_ID) || {}), ...update });

    const current = ped.amenities.map((a) => a.amenity.name.toLowerCase()).sort();
    const target = PEDUASE_AMENITIES.map((a) => a.toLowerCase()).sort();
    if (JSON.stringify(current) !== JSON.stringify(target)) {
      plan(`amenities: [${ped.amenities.map((a) => a.amenity.name).join(', ')}] -> [${PEDUASE_AMENITIES.join(', ')}]`);
      if (APPLY) await syncAmenities(PEDUASE_ID, PEDUASE_AMENITIES);
      catalogPatches.set(PEDUASE_ID, { ...(catalogPatches.get(PEDUASE_ID) || {}), amenities: PEDUASE_AMENITIES });
    } else {
      console.log('  = amenities already set');
    }
    if (changes.length === beforePeduase) console.log('  = nothing to change');
  }

  // ---------- 3. Region follows city (Fix 6.3) ----------
  console.log('\n3) Region matches city for every listing');
  const all = await prisma.property.findMany({ select: { id: true, title: true, city: true, region: true } });
  let regionFixes = 0;
  for (const p of all) {
    const city = p.id === PEDUASE_ID ? 'Aburi' : p.city;
    const want = CITY_REGION[city];
    if (!want || p.region === want || p.id === PEDUASE_ID) continue;
    regionFixes++;
    plan(`${p.title.slice(0, 60)}: region "${p.region}" -> "${want}" (city ${city})`);
    if (APPLY) await prisma.property.update({ where: { id: p.id }, data: { region: want } });
    catalogPatches.set(p.id, { ...(catalogPatches.get(p.id) || {}), region: want });
  }
  if (!regionFixes) console.log('  = all regions already match their city');

  // ---------- 4. Afienya shops (Fix 10) ----------
  console.log('\n4) Afienya shops listing (DRAFT)');
  const existingAfienya = await prisma.property.findFirst({
    where: { OR: [{ slug: AFIENYA.slug }, { title: { contains: 'Bright International Industrial Park' } }] },
    select: { id: true, slug: true, status: true },
  });
  let afienyaItem = null;
  if (existingAfienya) {
    console.log(`  = already exists (${existingAfienya.slug}, ${existingAfienya.status}) — not touched`);
  } else {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@loveridgeproperty.com' }, select: { id: true } })
      || await prisma.user.findFirst({ where: { role: { name: 'Super Admin' } }, select: { id: true } });
    if (!admin) {
      console.log('  ! no Super Admin user found to own the listing — skipped');
    } else {
      const id = `prop-${Date.now()}`;
      plan(`create DRAFT "${AFIENYA.title}"`, `slug: ${AFIENYA.slug} · US$372 per month · Afienya, Greater Accra · no photos yet`);
      if (APPLY) {
        const created = await prisma.property.create({
          data: {
            id,
            ...AFIENYA,
            bedrooms: 0, bathrooms: 0, guestRooms: 0, boysQuarters: 0, garage: 0,
            sizeSqft: null, livingAreaSqft: null,
            featured: false, imageUrl: null, galleryUrls: [],
            socialPlatform: 'TIKTOK', socialUrl: '',
            contactName: 'Desmond Senanu', contactPhone: '+233 24 643 2493', contactEmail: 'info@loveridgeproperty.com',
            createdBy: { connect: { id: admin.id } },
          },
        });
        afienyaItem = {
          ...AFIENYA, id: created.id, bedrooms: 0, bathrooms: 0, guestRooms: 0, boysQuarters: 0, garage: 0,
          sizeSqft: null, livingAreaSqft: null, lat: null, lng: null, featured: false, isFavourite: false,
          imageUrl: '', galleryUrls: [], amenities: [], socialPlatform: 'TIKTOK', socialUrl: '',
          contactName: 'Desmond Senanu', contactPhone: '+233 24 643 2493', contactEmail: 'info@loveridgeproperty.com',
          ownerName: '', ownerPhone: '', ownerCompany: '', commission: '',
          createdAt: created.createdAt.toISOString(), updatedAt: created.updatedAt.toISOString(),
        };
      }
    }
  }

  // ---------- 5. Keep the backup catalog in step + tell open browsers to refresh ----------
  if (changes.length) {
    console.log('\n5) Backup catalog + live refresh');
    plan('update properties_catalog backup and bump catalog_revision');
    if (APPLY) {
      const catalog = await getSetting('properties_catalog', []);
      if (Array.isArray(catalog) && catalog.length) {
        const nowIso = new Date().toISOString();
        let next = catalog.map((item) => {
          const patch = catalogPatches.get(item.id);
          return patch ? { ...item, ...patch, updatedAt: nowIso } : item;
        });
        if (afienyaItem && !next.some((i) => i.id === afienyaItem.id)) next = [afienyaItem, ...next];
        await setSetting('properties_catalog', next);
      }
      const rev = await getSetting('catalog_revision', { version: 1 });
      const now = Date.now();
      await setSetting('catalog_revision', { ...(rev || {}), properties: now, version: now });
    }
  }

  console.log(`\n${changes.length} change(s) ${APPLY ? 'applied' : 'planned'}.`);
  if (!APPLY && changes.length) console.log('Run again with --apply to write them.\n');
}

main()
  .catch((e) => {
    console.error('\nFAILED:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
