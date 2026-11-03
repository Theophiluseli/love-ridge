export interface BusinessItem {
  id: string;
  title: string;
  slug: string;
  category: string; // e.g., "Real Property Rltd", "Hospitality & Hotels", "Manufacturing & Industrial"
  summary?: string;
  description: string;
  status: 'PUBLISHED' | 'DRAFT' | 'SOLD' | 'ARCHIVED' | string;
  currency: string;
  askingPrice: number;
  downPayment: number | null;
  sellersDiscretionaryEarnings: number | null;
  grossRevenue?: number | null;
  cashFlow?: number | null;
  inventoryValue?: number | null;
  realEstateIncluded?: boolean | string;
  location: string; // e.g., "Accra Metropolitan, Greater Accra Region"
  city: string;
  region: string;
  country?: string;
  establishedYear?: string;
  employees?: string;
  reasonForSelling?: string;
  facilitiesOverview?: string;
  growthOpportunities?: string;
  supportAndTraining?: string;
  highlights: string[];
  featured: boolean;
  isFavourite?: boolean;
  imageUrl?: string | null;
  galleryUrls?: string[];
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  socialPlatform?: string;
  socialUrl?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerCompany?: string;
  ownerNotes?: string;
  sourceUrl?: string;
  commission?: string;
  createdAt: string;
  updatedAt: string;
}

export type PublicBusinessItem = BusinessItem;

export const BUSINESS_CATEGORIES = [
  'Real Property Rltd',
  'Hospitality & Hotels',
  'Manufacturing & Industrial',
  'Commercial & Retail',
  'Service & Logistics',
  'Agribusiness & Processing',
  'Healthcare & Wellness',
  'Technology & Media',
];

/**
 * Strips confidential internal admin fields (owner details, commission) before sending to public clients.
 */
export function sanitizeBusinessForPublic(business: BusinessItem): PublicBusinessItem {
  const {
    ownerName,
    ownerPhone,
    ownerEmail,
    ownerCompany,
    ownerNotes,
    sourceUrl,
    commission,
    ...publicFields
  } = business;
  return publicFields as PublicBusinessItem;
}

export const INITIAL_BUSINESSES_STORE: BusinessItem[] = [
  {
    id: 'biz-boutique-hotel-accra',
    title: 'Elegant Boutique Hotel & Suites for Sale – Prime Location, Accra',
    slug: 'elegant-boutique-hotel-suites-for-sale-prime-location-accra',
    category: 'Real Property Rltd',
    description:
      'An exceptional opportunity to acquire a profitable, fully operational luxury boutique hotel and executive suites situated in a prime commercial and diplomatic enclave within the Accra Metropolitan area.\n\nThe property features tastefully appointed guest rooms and executive suites, a fine-dining restaurant and lounge bar, conference and banquet facilities for corporate retreats, a resort-style swimming pool, backup power generation, water treatment systems, and secure on-site parking. The business enjoys strong year-round occupancy driven by international corporate travelers, diplomatic missions, diaspora visitors, and high-end hospitality clientele.\n\nIncluded in the sale are the freehold/long-lease real estate assets, all commercial kitchen and hospitality equipment, luxury furnishings, hospitality management software, transferable operating licenses (Ghana Tourism Authority certified), and an experienced operational team in place for a seamless handover.',
    status: 'PUBLISHED',
    currency: 'USD',
    askingPrice: 4300000,
    downPayment: 3300000,
    sellersDiscretionaryEarnings: 238471,
    grossRevenue: 890000,
    cashFlow: 238471,
    inventoryValue: 185000,
    realEstateIncluded: true,
    location: 'Accra Metropolitan, Greater Accra Region',
    city: 'Accra Metropolitan',
    region: 'Greater Accra Region',
    country: 'Ghana',
    establishedYear: '2019',
    employees: '28 Full-Time Staff',
    reasonForSelling: 'Owner relocating and consolidating international investment portfolio.',
    facilitiesOverview:
      'Multi-story purpose-built hospitality complex on a walled plot with 24 luxury en-suite rooms & executive suites, 80-seat restaurant & lounge, conference hall, swimming pool, commercial laundry, 250kVA standby generator, borehole & water filtration plant, and 24/7 CCTV security.',
    growthOpportunities:
      'Immediate upside through expanding corporate airline crew contracts, introducing rooftop event hosting, and partnering with international booking platforms for diplomat long-stays.',
    supportAndTraining:
      '90 days of comprehensive executive transition support and operational handover provided by current management.',
    highlights: [
      'Freehold / titled commercial real estate included in asking price',
      'Ghana Tourism Authority (GTA) licensed & fully compliant',
      'Consistent corporate, diplomatic, and diaspora repeat clientele',
      'Turnkey operations with trained management and hospitality staff',
      'Full standby power generator, borehole water system & commercial kitchen',
    ],
    featured: true,
    isFavourite: true,
    imageUrl: null,
    galleryUrls: [],
    contactName: 'Desmond Senanu',
    contactPhone: '+233 24 643 2493',
    contactEmail: 'info@loveridgeproperty.com',
    socialPlatform: 'TIKTOK',
    socialUrl: '',
    ownerName: 'Loveridge Corporate Advisory',
    ownerPhone: '+233 24 643 2493',
    ownerCompany: 'Loveridge Properties & Consult',
    commission: '5%',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
  },
  {
    id: 'biz-serviced-apartments-airport',
    title: 'Executive Serviced Apartments & Short-Let Portfolio – Airport Residential, Accra',
    slug: 'executive-serviced-apartments-short-let-portfolio-airport-accra',
    category: 'Real Property Rltd',
    description:
      'A high-yielding turnkey hospitality and serviced apartment business located minutes from Kotoka International Airport. This established portfolio comprises modern furnished luxury suites catering to multinational executives, embassy staff, and short-stay corporate guests.\n\nThe operation includes centralized property management, housekeeping, 24-hour concierge security, dedicated high-speed fiber internet, gym & poolside amenities, and direct corporate billing agreements with leading oil & gas, mining, and telecommunications firms in Ghana.',
    status: 'PUBLISHED',
    currency: 'USD',
    askingPrice: 2950000,
    downPayment: 2100000,
    sellersDiscretionaryEarnings: 284500,
    grossRevenue: 640000,
    cashFlow: 284500,
    inventoryValue: 140000,
    realEstateIncluded: true,
    location: 'Airport Residential Area, Greater Accra Region',
    city: 'Airport Residential, Accra',
    region: 'Greater Accra Region',
    country: 'Ghana',
    establishedYear: '2021',
    employees: '16 Full-Time Staff',
    reasonForSelling: 'Capital reallocation into new large-scale industrial development.',
    facilitiesOverview:
      '14 luxury furnished 1-bedroom and 2-bedroom executive suites, reception lounge, fitness studio, swimming pool, underground & surface parking, solar + generator hybrid backup.',
    growthOpportunities:
      'High demand for corporate long-term leasing and executive relocation packages.',
    supportAndTraining: '60 days full management handover and corporate client introductions.',
    highlights: [
      'Prime Airport Residential location with 82%+ average annual occupancy',
      'Includes titled real estate, luxury furniture, and corporate contracts',
      'Strong USD-indexed revenue stream from international corporate tenants',
      'Solar-hybrid power system keeping utility overhead low',
    ],
    featured: true,
    isFavourite: true,
    imageUrl: null,
    galleryUrls: [],
    contactName: 'Desmond Senanu',
    contactPhone: '+233 24 643 2493',
    contactEmail: 'info@loveridgeproperty.com',
    socialPlatform: 'TIKTOK',
    socialUrl: '',
    ownerName: '',
    ownerPhone: '',
    ownerCompany: '',
    commission: '5%',
    createdAt: '2026-10-29T12:00:00.000Z',
    updatedAt: '2026-10-29T12:00:00.000Z',
  },
  {
    id: 'biz-commercial-building-materials-spintex',
    title: 'Established Building Materials & Architectural Hardware Distribution Hub – Spintex',
    slug: 'established-building-materials-hardware-distribution-hub-spintex',
    category: 'Commercial & Retail',
    description:
      'A thriving wholesale and retail building materials distribution business positioned along the busy Spintex commercial corridor in Accra. The company specializes in direct-imported porcelain tiles, sanitary ware, security doors, architectural profiles, and contractor hardware.\n\nThe sale includes a large showroom and warehouse facility lease, active supplier agreements with verified manufacturers in China and Europe, delivery trucks, forklifts, ERP inventory system, and an active B2B contractor and developer customer base across Greater Accra and Kumasi.',
    status: 'PUBLISHED',
    currency: 'USD',
    askingPrice: 920000,
    downPayment: 650000,
    sellersDiscretionaryEarnings: 196400,
    grossRevenue: 1150000,
    cashFlow: 196400,
    inventoryValue: 310000,
    realEstateIncluded: false,
    location: 'Spintex Road, Accra Metropolitan, Greater Accra Region',
    city: 'Spintex, Accra',
    region: 'Greater Accra Region',
    country: 'Ghana',
    establishedYear: '2018',
    employees: '19 Full-Time Staff',
    reasonForSelling: 'Founders retiring from day-to-day retail operations.',
    facilitiesOverview:
      '1,400 sqm modern double-height showroom and adjoining palletized warehouse, 2 heavy-duty delivery trucks, 1 forklift, and administrative offices.',
    growthOpportunities:
      'Expand online B2B ordering and introduce exclusive contractor credit lines for real estate developers.',
    supportAndTraining: '90 days supplier introduction, freight forwarding & customs clearance training.',
    highlights: [
      'Over $310,000 in fast-moving showroom & warehouse inventory included',
      'Direct factory relationships and freight logistics channels in place',
      'Prime main-road visibility on Spintex Road with ample customer parking',
      'Established B2B developer, architect, and contractor accounts',
    ],
    featured: true,
    isFavourite: false,
    imageUrl: null,
    galleryUrls: [],
    contactName: 'Desmond Senanu',
    contactPhone: '+233 24 643 2493',
    contactEmail: 'info@loveridgeproperty.com',
    socialPlatform: 'TIKTOK',
    socialUrl: '',
    ownerName: '',
    ownerPhone: '',
    ownerCompany: '',
    commission: '5%',
    createdAt: '2026-10-28T12:00:00.000Z',
    updatedAt: '2026-10-28T12:00:00.000Z',
  },
];
