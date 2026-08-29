import fs from 'fs';
import path from 'path';
import { prisma } from './db';
import { getSystemSetting, setSystemSetting } from './system-settings';

export interface PropertyItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  listingType: 'SALE' | 'RENT' | string;
  propertyType: 'HOUSE' | 'LAND' | 'APARTMENT' | 'OFFICE_SPACE' | 'WAREHOUSE' | string;
  status: 'DRAFT' | 'PUBLISHED' | string;
  price: number;
  currency: string;
  pricePeriod?: string;
  bedrooms: number;
  bathrooms: number;
  guestRooms?: number;
  boysQuarters?: number;
  garage?: number;
  sizeSqft?: number | null;
  livingAreaSqft?: number | null;
  locationAddress: string;
  city: string;
  region: string;
  country: string;
  featured: boolean;
  imageUrl?: string | null;
  galleryUrls: string[];
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  agent?: { id: string; name: string } | null;
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_PROPERTIES_STORE: PropertyItem[] = [
  {
    id: 'prop-1',
    title: 'Luxury 4-Bedroom Smart Villa (East Legon)',
    slug: 'luxury-4-bedroom-smart-villa-east-legon',
    description: 'Ultra-modern 4-bedroom detached smart villa situated in the heart of East Legon. Features automated home systems, private infinity swimming pool, rooftop terrace, fully fitted Italian kitchen with Bosch appliances, solar backup system, and 24/7 security post.',
    listingType: 'SALE',
    propertyType: 'HOUSE',
    status: 'PUBLISHED',
    amenities: [
      'Air conditioning',
      'Cooker',
      'Washing machine',
      'Fans',
      'Refrigerator',
      'Microwave',
      'Internet access',
      'Satellite tv',
      'Garden',
      'Garage',
      "Annexe (Boys' quarters)",
      'Roof terrace',
    ],
    price: 450000,
    currency: 'USD',
    pricePeriod: 'outright purchase',
    bedrooms: 4,
    bathrooms: 5,
    guestRooms: 1,
    boysQuarters: 1,
    garage: 2,
    sizeSqft: 4500,
    livingAreaSqft: 3800,
    locationAddress: 'Boundary Road, East Legon',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
    featured: true,
    imageUrl: '/property_villa.png',
    galleryUrls: ['/property_villa.png'],
    contactName: 'Desmond Senanu',
    contactPhone: '+233 24 000 1111',
    contactEmail: 'agent@loveridge.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prop-2',
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
    guestRooms: 0,
    boysQuarters: 0,
    garage: 1,
    sizeSqft: 1800,
    livingAreaSqft: 1650,
    locationAddress: 'Airport Residential Area',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
    featured: true,
    imageUrl: '/property_villa.png',
    galleryUrls: ['/property_villa.png'],
    contactName: 'Kwame Appiah',
    contactPhone: '+233 20 222 3333',
    contactEmail: 'agent@loveridge.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prop-3',
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
    imageUrl: '/property_land.png',
    galleryUrls: ['/property_land.png'],
    contactName: 'Kwaku Loveridge',
    contactPhone: '+233 24 000 1111',
    contactEmail: 'admin@loveridge.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prop-4',
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
    imageUrl: '/property_land.png',
    galleryUrls: ['/property_land.png'],
    contactName: 'Sarah Osei',
    contactPhone: '+233 24 000 1111',
    contactEmail: 'sarah@loveridge.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prop-5',
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
    imageUrl: '/property_office.png',
    galleryUrls: ['/property_office.png'],
    contactName: 'Kwame Appiah',
    contactPhone: '+233 24 000 1111',
    contactEmail: 'kwame@loveridge.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prop-6',
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
    imageUrl: '/property_office.png',
    galleryUrls: ['/property_office.png'],
    contactName: 'Desmond Senanu',
    contactPhone: '+233 24 000 1111',
    contactEmail: 'desmond@loveridge.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prop-7',
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
    imageUrl: '/property_warehouse.png',
    galleryUrls: ['/property_warehouse.png'],
    contactName: 'Kwaku Loveridge',
    contactPhone: '+233 24 000 1111',
    contactEmail: 'admin@loveridge.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prop-8',
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
    imageUrl: '/property_warehouse.png',
    galleryUrls: ['/property_warehouse.png'],
    contactName: 'Sarah Osei',
    contactPhone: '+233 24 000 1111',
    contactEmail: 'sarah@loveridge.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const FILE_PATH = path.join(process.cwd(), 'scratch', 'properties.json');

function ensureFile() {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_PROPERTIES_STORE, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error maintaining properties.json file:', err);
  }
}

export function readPropertiesFromFile(): PropertyItem[] {
  ensureFile();
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed reading properties from file:', err);
  }
  return INITIAL_PROPERTIES_STORE;
}

export function writePropertiesToFile(properties: PropertyItem[]) {
  ensureFile();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(properties, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing properties to file:', err);
  }
}

export async function getAllProperties(): Promise<PropertyItem[]> {
  try {
    const { data: dbCatalog, isDefault } = await getSystemSetting<PropertyItem[]>(
      'properties_catalog',
      INITIAL_PROPERTIES_STORE
    );
    if (!isDefault && Array.isArray(dbCatalog) && dbCatalog.length > 0) {
      return dbCatalog;
    }
  } catch (e) {
    console.warn('Could not read properties from system_settings:', e);
  }

  const fileProperties = readPropertiesFromFile();
  return fileProperties.length > 0 ? fileProperties : INITIAL_PROPERTIES_STORE;
}

export async function saveProperty(propData: Partial<PropertyItem>): Promise<PropertyItem> {
  const currentProps = await getAllProperties();
  const now = new Date().toISOString();

  let existingIndex = -1;
  if (propData.id) {
    existingIndex = currentProps.findIndex((p) => p.id === propData.id);
  }
  if (existingIndex === -1 && propData.slug) {
    existingIndex = currentProps.findIndex((p) => p.slug === propData.slug);
  }

  const newProperty: PropertyItem = {
    id: propData.id || `prop-${Date.now()}`,
    title: propData.title || 'Untitled Property',
    slug: propData.slug || ((propData.title || 'prop').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4)),
    description: propData.description || 'Property listing description.',
    listingType: propData.listingType || 'SALE',
    propertyType: propData.propertyType || 'HOUSE',
    status: propData.status || 'DRAFT',
    price: typeof propData.price === 'number' ? propData.price : parseFloat(propData.price as any) || 0,
    currency: propData.currency || 'USD',
    pricePeriod: propData.pricePeriod || 'outright purchase',
    bedrooms: typeof propData.bedrooms === 'number' ? propData.bedrooms : parseInt(propData.bedrooms as any) || 0,
    bathrooms: typeof propData.bathrooms === 'number' ? propData.bathrooms : parseInt(propData.bathrooms as any) || 0,
    guestRooms: typeof propData.guestRooms === 'number' ? propData.guestRooms : parseInt(propData.guestRooms as any) || 0,
    boysQuarters: typeof propData.boysQuarters === 'number' ? propData.boysQuarters : parseInt(propData.boysQuarters as any) || 0,
    garage: typeof propData.garage === 'number' ? propData.garage : parseInt(propData.garage as any) || 0,
    sizeSqft: propData.sizeSqft ? (typeof propData.sizeSqft === 'number' ? propData.sizeSqft : parseFloat(propData.sizeSqft as any)) : null,
    livingAreaSqft: propData.livingAreaSqft ? (typeof propData.livingAreaSqft === 'number' ? propData.livingAreaSqft : parseFloat(propData.livingAreaSqft as any)) : null,
    locationAddress: propData.locationAddress || 'Accra',
    city: propData.city || 'Accra',
    region: propData.region || 'Greater Accra',
    country: propData.country || 'Ghana',
    featured: Boolean(propData.featured),
    imageUrl: propData.imageUrl || '/property_villa.png',
    galleryUrls: Array.isArray(propData.galleryUrls) ? propData.galleryUrls : [],
    contactName: propData.contactName || 'Desmond Senanu',
    contactPhone: propData.contactPhone || '+233 24 000 1111',
    contactEmail: propData.contactEmail || 'agent@loveridge.com',
    amenities: Array.isArray(propData.amenities)
      ? propData.amenities
      : existingIndex >= 0 && Array.isArray(currentProps[existingIndex].amenities)
      ? currentProps[existingIndex].amenities
      : [],
    createdAt: existingIndex >= 0 ? currentProps[existingIndex].createdAt : now,
    updatedAt: now,
  };

  const updatedList = [...currentProps];
  if (existingIndex >= 0) {
    updatedList[existingIndex] = { ...updatedList[existingIndex], ...newProperty };
  } else {
    updatedList.unshift(newProperty);
  }

  // Save permanently in PostgreSQL system_settings table
  await setSystemSetting('properties_catalog', updatedList);

  // Best-effort local file write
  writePropertiesToFile(updatedList);

  return newProperty;
}

export async function deleteProperty(id: string): Promise<boolean> {
  const currentProps = await getAllProperties();
  const updated = currentProps.filter((p) => p.id !== id);
  await setSystemSetting('properties_catalog', updated);
  writePropertiesToFile(updated);
  try {
    await prisma.property.delete({ where: { id } }).catch(() => null);
  } catch (e) {
    // ignore prisma error
  }
  return true;
}
