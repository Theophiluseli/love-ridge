import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed into Supabase...');

  // 1. Permissions
  const permissionsList = [
    { key: 'users.manage', description: 'Create, update, delete user accounts & 2FA' },
    { key: 'roles.manage', description: 'Create and modify system roles and permission matrices' },
    { key: 'property.create', description: 'Create property listings' },
    { key: 'property.edit', description: 'Edit property listings' },
    { key: 'property.delete', description: 'Delete property listings' },
    { key: 'property.approve', description: 'Publish or reject property listings' },
    { key: 'product.create', description: 'Create catalogue products' },
    { key: 'product.edit', description: 'Edit product details, pricing, stock' },
    { key: 'product.delete', description: 'Delete products' },
    { key: 'categories.manage', description: 'Manage product & property categories' },
    { key: 'media.manage', description: 'Upload, organize and delete shared media files' },
    { key: 'leads.view', description: 'View viewing requests, quote requests & leads' },
    { key: 'leads.manage', description: 'Assign, update status, and respond to leads' },
    { key: 'content.manage', description: 'Manage FAQs, testimonials, blog/cms content' },
    { key: 'analytics.view', description: 'Access reporting and performance analytics' },
    { key: 'settings.manage', description: 'Configure site settings, WhatsApp, SMTP keys' },
  ];

  const createdPermissions: Record<string, string> = {};
  for (const perm of permissionsList) {
    const p = await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
    createdPermissions[perm.key] = p.id;
  }
  console.log('✅ Permissions created/synced');

  // 2. Roles
  const rolesData = [
    {
      name: 'Super Admin',
      description: 'Full system access: manage users, roles, financial reports, all listings and settings',
      isSystemRole: true,
      permissions: Object.keys(createdPermissions),
    },
    {
      name: 'Admin',
      description: 'Manage properties, products, leads, media, content; cannot manage users or settings',
      isSystemRole: true,
      permissions: [
        'property.create', 'property.edit', 'property.delete', 'property.approve',
        'product.create', 'product.edit', 'product.delete', 'categories.manage',
        'media.manage', 'leads.view', 'leads.manage', 'content.manage', 'analytics.view'
      ],
    },
    {
      name: 'Property Manager',
      description: 'Create, edit, delete and approve property listings; view property leads',
      isSystemRole: true,
      permissions: [
        'property.create', 'property.edit', 'property.delete', 'property.approve',
        'categories.manage', 'media.manage', 'leads.view', 'leads.manage', 'analytics.view'
      ],
    },
    {
      name: 'Catalogue Manager',
      description: 'Create, edit, delete products, categories, pricing, stock; view quote leads',
      isSystemRole: true,
      permissions: [
        'product.create', 'product.edit', 'product.delete', 'categories.manage',
        'media.manage', 'leads.view', 'leads.manage', 'analytics.view'
      ],
    },
    {
      name: 'Agent',
      description: 'Create & edit own property listings (needs approval); view assigned leads',
      isSystemRole: true,
      permissions: [
        'property.create', 'property.edit', 'media.manage', 'leads.view'
      ],
    },
    {
      name: 'Editor',
      description: 'Manage site content (FAQs, testimonials, partners), no listing/product access',
      isSystemRole: true,
      permissions: [
        'content.manage', 'media.manage'
      ],
    },
    {
      name: 'Viewer',
      description: 'Read-only access across properties, products, leads and reporting',
      isSystemRole: true,
      permissions: [
        'leads.view', 'analytics.view'
      ],
    },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of rolesData) {
    const roleObj = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: {
        name: r.name,
        description: r.description,
        isSystemRole: r.isSystemRole,
      },
    });
    roleMap[r.name] = roleObj.id;

    const rolePermsToCreate = r.permissions
      .filter((pKey) => createdPermissions[pKey])
      .map((pKey) => ({
        roleId: roleObj.id,
        permissionId: createdPermissions[pKey],
      }));

    if (rolePermsToCreate.length > 0) {
      await prisma.rolePermission.createMany({
        data: rolePermsToCreate,
        skipDuplicates: true,
      });
    }
  }
  console.log('✅ Roles & Role Permissions created/synced');

  // 3. Seed Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@loveridge.com' },
    update: {},
    create: {
      name: 'Kwaku Loveridge',
      email: 'admin@loveridge.com',
      phone: '+233 24 000 1111',
      passwordHash,
      roleId: roleMap['Super Admin'],
      status: 'ACTIVE',
      twoFactorEnabled: true,
    },
  });

  const propertyManager = await prisma.user.upsert({
    where: { email: 'propmgr@loveridge.com' },
    update: {},
    create: {
      name: 'Ama Osei',
      email: 'propmgr@loveridge.com',
      phone: '+233 20 222 3333',
      passwordHash,
      roleId: roleMap['Property Manager'],
      status: 'ACTIVE',
    },
  });

  const catalogueManager = await prisma.user.upsert({
    where: { email: 'catmgr@loveridge.com' },
    update: {},
    create: {
      name: 'Kofi Mensah',
      email: 'catmgr@loveridge.com',
      phone: '+233 27 444 5555',
      passwordHash,
      roleId: roleMap['Catalogue Manager'],
      status: 'ACTIVE',
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: 'agent.kwame@loveridge.com' },
    update: {},
    create: {
      name: 'Kwame Appiah',
      email: 'agent.kwame@loveridge.com',
      phone: '+233 55 666 7777',
      passwordHash,
      roleId: roleMap['Agent'],
      status: 'ACTIVE',
    },
  });
  console.log('✅ Default Admin Users created');

  // 4. Seed Amenities
  const amenitiesList = [
    { name: 'Swimming Pool', icon: 'Waves' },
    { name: '24/7 Security & CCTV', icon: 'ShieldCheck' },
    { name: 'Backup Generator', icon: 'Zap' },
    { name: 'Solar Energy System', icon: 'Sun' },
    { name: 'Fitted Kitchen', icon: 'Utensils' },
    { name: 'Air Conditioning', icon: 'Wind' },
    { name: 'Private Balcony', icon: 'Maximize' },
    { name: 'Ample Parking Space', icon: 'Car' },
    { name: 'Gated Community', icon: 'Lock' },
    { name: 'Smart Home Automation', icon: 'Cpu' },
  ];

  for (const item of amenitiesList) {
    await prisma.amenity.upsert({
      where: { name: item.name },
      update: { icon: item.icon },
      create: item,
    });
  }
  console.log('✅ Amenities synced');

  // 5. Seed Product Categories
  const matCategory = await prisma.productCategory.upsert({
    where: { slug: 'building-materials' },
    update: {},
    create: {
      name: 'Building Materials',
      slug: 'building-materials',
      description: 'Imported porcelain tiles, marble slabs, luxury sanitaryware, and structural items',
    },
  });

  const tilesSubCategory = await prisma.productCategory.upsert({
    where: { slug: 'tiles-marble' },
    update: {},
    create: {
      name: 'Tiles & Marble Slabs',
      slug: 'tiles-marble',
      description: 'Glazed porcelain floor tiles, wall cladding & natural marble',
      parentId: matCategory.id,
    },
  });

  const toolsCategory = await prisma.productCategory.upsert({
    where: { slug: 'tools-equipment' },
    update: {},
    create: {
      name: 'Tools & Construction Equipment',
      slug: 'tools-equipment',
      description: 'Heavy duty power tools, safety equipment, and smart hardware',
    },
  });
  console.log('✅ Product categories created');

  // 6. Seed Sample Properties
  await prisma.property.upsert({
    where: { slug: 'luxury-4-bedroom-smart-villa-east-legon' },
    update: {},
    create: {
      title: 'Luxury 4-Bedroom Smart Villa (East Legon)',
      slug: 'luxury-4-bedroom-smart-villa-east-legon',
      description: 'Ultra-modern 4-bedroom detached smart villa situated in the heart of East Legon. Features automated home systems, private infinity swimming pool, rooftop terrace, fully fitted Italian kitchen with Bosch appliances, solar backup system, and 24/7 security post.',
      listingType: 'SALE',
      propertyType: 'HOUSE',
      status: 'PUBLISHED',
      price: 450000,
      currency: 'USD',
      pricePeriod: 'outright purchase',
      bedrooms: 4,
      bathrooms: 5,
      sizeSqft: 4500,
      locationAddress: 'Boundary Road, East Legon',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      featured: true,
      agentId: agentUser.id,
      createdById: superAdmin.id,
      approvedById: superAdmin.id,
      publishedAt: new Date(),
    },
  });

  await prisma.property.upsert({
    where: { slug: 'executive-2-bedroom-serviced-apartment-airport-residential' },
    update: {},
    create: {
      title: 'Executive 2-Bedroom Serviced Apartment (Airport Residential)',
      slug: 'executive-2-bedroom-serviced-apartment-airport-residential',
      description: 'Modern high-rise residential apartment unit offering panoramic views of Airport Residential Area. Comes fully furnished with designer Italian furniture, gym access, standby generator, underground parking, and concierge service.',
      listingType: 'RENT',
      propertyType: 'APARTMENT',
      status: 'PUBLISHED',
      price: 3200,
      currency: 'USD',
      pricePeriod: 'per month',
      bedrooms: 2,
      bathrooms: 2,
      sizeSqft: 1800,
      locationAddress: 'Airport Residential Area',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      featured: true,
      agentId: agentUser.id,
      createdById: propertyManager.id,
      approvedById: superAdmin.id,
      publishedAt: new Date(),
    },
  });

  await prisma.property.upsert({
    where: { slug: 'prime-commercial-land-cantonments-embassy-quarter' },
    update: {},
    create: {
      title: 'Prime Commercial Land (1.2 Acres) - Cantonments',
      slug: 'prime-commercial-land-cantonments-embassy-quarter',
      description: 'Rare development opportunity! 1.2 acres of prime commercial/residential land located in the diplomatic zone of Cantonments. Fully registered title with Lands Commission clearance. Ideal for embassy headquarters, high-rise luxury apartments, or corporate office complex.',
      listingType: 'SALE',
      propertyType: 'LAND',
      status: 'PUBLISHED',
      price: 1800000,
      currency: 'USD',
      pricePeriod: 'outright purchase',
      bedrooms: 0,
      bathrooms: 0,
      sizeSqft: 52272,
      locationAddress: 'Cantonments Embassy Quarter',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      featured: true,
      agentId: agentUser.id,
      createdById: superAdmin.id,
      approvedById: superAdmin.id,
      publishedAt: new Date(),
    },
  });

  await prisma.property.upsert({
    where: { slug: '2-acre-industrial-lease-land-tema-heavy-industrial-zone' },
    update: {},
    create: {
      title: '2-Acre Industrial Land for Rent / Lease (Tema Port Zone)',
      slug: '2-acre-industrial-lease-land-tema-heavy-industrial-zone',
      description: 'Prime fenced 2-acre industrial land plot available for long-term lease. Situated 5 minutes from Tema Port with high-capacity three-phase electrical power, piped water, and heavy vehicle paved access roads.',
      listingType: 'RENT',
      propertyType: 'LAND',
      status: 'PUBLISHED',
      price: 4500,
      currency: 'USD',
      pricePeriod: 'per month',
      bedrooms: 0,
      bathrooms: 0,
      sizeSqft: 87120,
      locationAddress: 'Heavy Industrial Area Zone 2',
      city: 'Tema',
      region: 'Greater Accra',
      country: 'Ghana',
      featured: true,
      agentId: agentUser.id,
      createdById: superAdmin.id,
      approvedById: superAdmin.id,
      publishedAt: new Date(),
    },
  });

  await prisma.property.upsert({
    where: { slug: 'grade-a-executive-office-suite-ridge-financial-district' },
    update: {},
    create: {
      title: 'Grade-A Executive Office Suite (350 sqm) - Ridge',
      slug: 'grade-a-executive-office-suite-ridge-financial-district',
      description: 'Ultra-modern 350 sqm open-plan commercial office space located in Accra’s premier financial hub in Ridge. Features panoramic skyline views, high-speed fiber internet infrastructure, 24/7 power backup, central AC, and 10 dedicated underground parking slots.',
      listingType: 'RENT',
      propertyType: 'OFFICE_SPACE',
      status: 'PUBLISHED',
      price: 8750,
      currency: 'USD',
      pricePeriod: 'per month',
      bedrooms: 0,
      bathrooms: 4,
      sizeSqft: 3767,
      locationAddress: 'Financial District, Ridge',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      featured: true,
      agentId: agentUser.id,
      createdById: superAdmin.id,
      approvedById: superAdmin.id,
      publishedAt: new Date(),
    },
  });

  await prisma.property.upsert({
    where: { slug: 'corporate-office-floor-airport-city-accra' },
    update: {},
    create: {
      title: 'Corporate Office Floor (850 sqm) for Sale - Airport City',
      slug: 'corporate-office-floor-airport-city-accra',
      description: 'Exclusive 850 sqm commercial office floor in an iconic Airport City high-rise. Fully partitioned into executive corner offices, boardrooms, open workstations, and cafeteria. High investment yield with blue-chip corporate tenant potential.',
      listingType: 'SALE',
      propertyType: 'OFFICE_SPACE',
      status: 'PUBLISHED',
      price: 2600000,
      currency: 'USD',
      pricePeriod: 'outright purchase',
      bedrooms: 0,
      bathrooms: 6,
      sizeSqft: 9149,
      locationAddress: 'Liberia Road, Airport City',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      featured: true,
      agentId: agentUser.id,
      createdById: superAdmin.id,
      approvedById: superAdmin.id,
      publishedAt: new Date(),
    },
  });

  await prisma.property.upsert({
    where: { slug: 'high-bay-logistics-distribution-warehouse-tema' },
    update: {},
    create: {
      title: '2,500 sqm Logistics Warehouse for Rent (Tema)',
      slug: 'high-bay-logistics-distribution-warehouse-tema',
      description: 'Modern 2,500 sqm high-bay logistics warehouse facility featuring 12m clear height clearance, 4 raised dock levelers, automated drive-in container doors, 24/7 security patrol, fire sprinkler systems, and dedicated administrative offices.',
      listingType: 'RENT',
      propertyType: 'WAREHOUSE',
      status: 'PUBLISHED',
      price: 15000,
      currency: 'USD',
      pricePeriod: 'per month',
      bedrooms: 0,
      bathrooms: 4,
      sizeSqft: 26910,
      locationAddress: 'Harbour Commercial Expressway',
      city: 'Tema',
      region: 'Greater Accra',
      country: 'Ghana',
      featured: true,
      agentId: agentUser.id,
      createdById: superAdmin.id,
      approvedById: superAdmin.id,
      publishedAt: new Date(),
    },
  });

  await prisma.property.upsert({
    where: { slug: 'industrial-manufacturing-warehouse-spintex-road' },
    update: {},
    create: {
      title: '4,000 sqm Industrial Warehouse Facility for Sale - Spintex',
      slug: 'industrial-manufacturing-warehouse-spintex-road',
      description: 'Substantial 4,000 sqm industrial manufacturing and logistics complex on 3 acres of land along Spintex Road. Includes cold storage room facilities, heavy overhead crane rails, 500kVA transformer substation, and expansive turning yard for 40ft articulation trucks.',
      listingType: 'SALE',
      propertyType: 'WAREHOUSE',
      status: 'PUBLISHED',
      price: 3500000,
      currency: 'USD',
      pricePeriod: 'outright purchase',
      bedrooms: 0,
      bathrooms: 8,
      sizeSqft: 43055,
      locationAddress: 'Spintex Road Commercial Corridor',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      featured: true,
      agentId: agentUser.id,
      createdById: superAdmin.id,
      approvedById: superAdmin.id,
      publishedAt: new Date(),
    },
  });
  console.log('✅ Sample properties created');

  // 7. Seed Sample Products
  await prisma.product.upsert({
    where: { slug: 'italian-60x120-porcelain-floor-tiles' },
    update: { featured: true },
    create: {
      name: 'Italian Carrara Porcelain Floor Tiles (60x120cm)',
      slug: 'italian-60x120-porcelain-floor-tiles',
      description: 'Premium nano-polished porcelain floor tiles with authentic Carrara marble pattern. High wear resistance.',
      sku: 'TILE-ITA-60120-CAR',
      price: 145.00,
      currency: 'GHS',
      unit: 'per box (1.44 sqm)',
      stockQuantity: 450,
      stockStatus: 'IN_STOCK',
      originCountry: 'Italy',
      moq: 20,
      status: 'PUBLISHED',
      featured: true,
      categoryId: tilesSubCategory.id,
      createdById: catalogueManager.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'industrial-20v-brushless-cordless-drill-kit' },
    update: { featured: true },
    create: {
      name: 'Industrial 20V Brushless Cordless Drill & Impact Driver Set',
      slug: 'industrial-20v-brushless-cordless-drill-kit',
      description: 'Heavy duty construction grade cordless power tool combo kit. Includes 2x 4.0Ah Lithium-ion batteries.',
      sku: 'TOOL-20V-DRILL-KIT',
      price: 1850.00,
      currency: 'GHS',
      unit: 'per set',
      stockQuantity: 35,
      stockStatus: 'IN_STOCK',
      originCountry: 'China',
      moq: 1,
      status: 'PUBLISHED',
      featured: true,
      categoryId: toolsCategory.id,
      createdById: catalogueManager.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'smart-biometric-fingerprint-front-door-lock' },
    update: { featured: true },
    create: {
      name: 'Smart Biometric Fingerprint & Keypad Front Door Lock',
      slug: 'smart-biometric-fingerprint-front-door-lock',
      description: 'High-security 5-in-1 smart lock. Unlocks via Fingerprint, Mobile App, Passcode, RFID Card, and Key.',
      sku: 'SEC-SMART-LOCK-01',
      price: 1200.00,
      currency: 'GHS',
      unit: 'per piece',
      stockQuantity: 15,
      stockStatus: 'IN_STOCK',
      originCountry: 'China',
      moq: 5,
      status: 'PUBLISHED',
      featured: true,
      categoryId: toolsCategory.id,
      createdById: catalogueManager.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'spanish-calacatta-gold-porcelain-wall-tiles' },
    update: { featured: false },
    create: {
      name: 'Spanish Calacatta Gold Glossy Porcelain Wall Tiles (30x90cm)',
      slug: 'spanish-calacatta-gold-porcelain-wall-tiles',
      description: 'Luxury Spanish manufactured high-gloss ceramic & porcelain wall tiles with delicate gold veining.',
      sku: 'TILE-ESP-3090-CAL-GOLD',
      price: 165.00,
      currency: 'GHS',
      unit: 'per box (1.35 sqm)',
      stockQuantity: 320,
      stockStatus: 'IN_STOCK',
      originCountry: 'Spain',
      moq: 15,
      status: 'PUBLISHED',
      featured: false,
      categoryId: tilesSubCategory.id,
      createdById: catalogueManager.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: '5-5kva-hybrid-solar-inverter-lithium-battery-system' },
    update: { featured: false },
    create: {
      name: '5.5kVA Hybrid Solar Inverter & 10kWh Lithium Battery Storage System',
      slug: '5-5kva-hybrid-solar-inverter-lithium-battery-system',
      description: 'Complete off-grid and grid-tied intelligent solar power backup solution with dual MPPT charge controller.',
      sku: 'SOLAR-HYBRID-55KVA-KIT',
      price: 28500.00,
      currency: 'GHS',
      unit: 'per complete system',
      stockQuantity: 12,
      stockStatus: 'IN_STOCK',
      originCountry: 'China',
      moq: 1,
      status: 'PUBLISHED',
      featured: false,
      categoryId: toolsCategory.id,
      createdById: catalogueManager.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'luxury-brushed-gold-thermostatic-rain-shower-set' },
    update: { featured: false },
    create: {
      name: 'Luxury Brushed Gold Thermostatic Rain Shower System & Faucet',
      slug: 'luxury-brushed-gold-thermostatic-rain-shower-set',
      description: 'Premium solid brass wall-mounted thermostatic rainfall shower kit with PVD brushed gold finish.',
      sku: 'BATH-GOLD-SHOWER-SET',
      price: 2450.00,
      currency: 'GHS',
      unit: 'per set',
      stockQuantity: 28,
      stockStatus: 'IN_STOCK',
      originCountry: 'China',
      moq: 2,
      status: 'PUBLISHED',
      featured: false,
      categoryId: matCategory.id,
      createdById: catalogueManager.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'commercial-automatic-hydraulic-swing-gate-opener' },
    update: { featured: false },
    create: {
      name: 'Commercial Heavy-Duty Automatic Hydraulic Swing Gate Opener',
      slug: 'commercial-automatic-hydraulic-swing-gate-opener',
      description: 'Industrial grade automated dual swing gate actuator kit for heavy iron gates up to 800kg per leaf.',
      sku: 'GATE-AUTO-HYD-500',
      price: 4800.00,
      currency: 'GHS',
      unit: 'per set',
      stockQuantity: 18,
      stockStatus: 'IN_STOCK',
      originCountry: 'China',
      moq: 1,
      status: 'PUBLISHED',
      featured: false,
      categoryId: toolsCategory.id,
      createdById: catalogueManager.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'turkish-engineered-natural-oak-hardwood-flooring' },
    update: { featured: false },
    create: {
      name: 'Turkish Engineered Natural Oak Hardwood Flooring (15x190mm)',
      slug: 'turkish-engineered-natural-oak-hardwood-flooring',
      description: 'Authentic European oak hardwood plank flooring with multi-ply birch plywood core and click system.',
      sku: 'WOOD-TURK-OAK-15190',
      price: 280.00,
      currency: 'GHS',
      unit: 'per sqm',
      stockQuantity: 600,
      stockStatus: 'IN_STOCK',
      originCountry: 'Turkey',
      moq: 25,
      status: 'PUBLISHED',
      featured: false,
      categoryId: tilesSubCategory.id,
      createdById: catalogueManager.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'ultra-hd-outdoor-4k-solar-ai-security-camera-kit' },
    update: { featured: false },
    create: {
      name: 'Ultra-HD Outdoor 4K Solar Powered AI Security Camera System',
      slug: 'ultra-hd-outdoor-4k-solar-ai-security-camera-kit',
      description: 'Wireless 100% wire-free 4K Ultra HD smart security camera set with integrated solar panel.',
      sku: 'SEC-4K-SOLAR-CAM-KIT',
      price: 1650.00,
      currency: 'GHS',
      unit: 'per kit (4 cameras)',
      stockQuantity: 40,
      stockStatus: 'IN_STOCK',
      originCountry: 'China',
      moq: 1,
      status: 'PUBLISHED',
      featured: false,
      categoryId: toolsCategory.id,
      createdById: catalogueManager.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'industrial-portable-electric-concrete-mixer-350l' },
    update: { featured: false },
    create: {
      name: 'Industrial Portable Electric Concrete Mixer (350L Capacity)',
      slug: 'industrial-portable-electric-concrete-mixer-350l',
      description: 'Heavy duty site concrete and mortar batch mixer powered by a 3.0HP copper wire induction electric motor.',
      sku: 'EQP-MIXER-350L-ELE',
      price: 6200.00,
      currency: 'GHS',
      unit: 'per unit',
      stockQuantity: 10,
      stockStatus: 'IN_STOCK',
      originCountry: 'China',
      moq: 1,
      status: 'PUBLISHED',
      featured: false,
      categoryId: toolsCategory.id,
      createdById: catalogueManager.id,
    },
  });
  console.log('✅ Sample products created (10 products total)');

  console.log('🚀 DATABASE SEED COMPLETE! All data successfully pushed to Supabase!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
