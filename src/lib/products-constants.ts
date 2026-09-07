export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export type ProductCategoryItem = ProductCategory;

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  priceCny?: number;
  referenceUrl?: string;
  currency: string;
  unit: string;
  stockQuantity: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER" | string;
  status?: "DRAFT" | "PUBLISHED" | string;
  originCountry?: string;
  moq: number;
  featured: boolean;
  isFavourite?: boolean;
  categoryId?: string;
  category?: {
    id?: string;
    name: string;
    slug?: string;
  } | null;
  imageUrl?: string | null;
  galleryUrls?: string[];
  specs?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_CATEGORIES_STORE: ProductCategory[] = [
  { id: "cat-doors", name: "Doors & Smart Locks", slug: "doors-and-smart-locks", description: "Smart locks and entrance doors" },
  { id: "cat-lights", name: "Solar Lighting & CCTV", slug: "solar-lighting-and-cctv", description: "Solar street lights and CCTV security" },
  { id: "cat-machinery", name: "Construction Equipment", slug: "construction-equipment", description: "Block machines, mixers and site machinery" },
  { id: "cat-materials", name: "Building Materials", slug: "building-materials", description: "Tiles, fittings and architectural essentials" },
  { id: "cat-tiles", name: "TILES & MARBLE SLABS", slug: "tiles-marble-slabs", description: "Floor and wall tiles" },
  { id: "cat-tools", name: "TOOLS & CONSTRUCTION EQUIPMENT", slug: "tools-equipment", description: "Tools and power equipment" }
];

export const INITIAL_PRODUCTS_STORE: ProductItem[] = [
  {
    "id": "f830e123-66fa-4983-b572-e0465d17cb84",
    "name": "High-Power Solar LED Street Light – 100W to 600W Outdoor Lighting",
    "slug": "high-power-solar-led-street-light-100w-to-600w-outdoor-lighting-8683",
    "description": "Reliable solar-powered LED lighting for streets, compounds, gardens, homes, shops and commercial properties.\nAvailable in 100W, 200W, 300W, 400W and 600W options, plus the S5500 project model for larger installations.\nDesigned for strong outdoor illumination with low power consumption and independent solar operation.\nIdeal for areas with limited grid power or customers looking to reduce electricity costs.\nSuitable for residential, commercial, roadway and project-based outdoor lighting.",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Building Materials",
      "slug": "building-materials"
    },
    "sku": "SKU-916151",
    "referenceUrl": "",
    "price": 799,
    "priceCny": 376,
    "currency": "GHS",
    "unit": "Per piece",
    "stockQuantity": 498,
    "stockStatus": "IN_STOCK",
    "originCountry": "China",
    "moq": 10,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-f830e123-66fa-4983-b572-e0465d17cb84.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-f830e123-66fa-4983-b572-e0465d17cb84-0.jpg",
      "/uploads/prod-gallery-f830e123-66fa-4983-b572-e0465d17cb84-1.jpg",
      "/uploads/prod-gallery-f830e123-66fa-4983-b572-e0465d17cb84-2.jpg",
      "/uploads/prod-gallery-f830e123-66fa-4983-b572-e0465d17cb84-3.jpg",
      "/uploads/prod-gallery-f830e123-66fa-4983-b572-e0465d17cb84-4.jpg"
    ],
    "createdAt": "2026-08-28T16:24:39.427Z",
    "updatedAt": "2026-08-28T16:24:39.427Z"
  },
  {
    "id": "432f8043-d714-4b61-be59-e76944c78855",
    "name": "Solar Security Street Light with 4G Camera – AI Detection, Night Vision & App Control",
    "slug": "solar-security-street-light-with-4g-camera-ai-detection-night-vision-app-control-9678",
    "description": "Powerful 300W, 400W, 500W and 600W solar street lights with an integrated 4-in-1 HD security camera, ideal for homes, compounds, shops, farms, warehouses and commercial properties.\nFeatures 4G connectivity, AI motion detection, night vision, two-way talk and instant app alerts for convenient remote monitoring.\nRuns fully on solar power with intelligent lighting control, helping reduce dependence on grid electricity.\nAvailable in single-camera and multi-camera configurations for wider surveillance coverage.\nA smart 2-in-1 lighting and security solution for reliable outdoor illumination and continuous property monitoring.",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Building Materials",
      "slug": "building-materials"
    },
    "sku": "SKU-491416",
    "referenceUrl": "",
    "price": 2000,
    "priceCny": 940,
    "currency": "GHS",
    "unit": "per piece",
    "stockQuantity": 50,
    "stockStatus": "IN_STOCK",
    "originCountry": "China",
    "moq": 10,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-432f8043-d714-4b61-be59-e76944c78855.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-432f8043-d714-4b61-be59-e76944c78855-0.jpg",
      "/uploads/prod-gallery-432f8043-d714-4b61-be59-e76944c78855-1.jpg",
      "/uploads/prod-gallery-432f8043-d714-4b61-be59-e76944c78855-2.jpg",
      "/uploads/prod-gallery-432f8043-d714-4b61-be59-e76944c78855-3.jpg"
    ],
    "createdAt": "2026-08-28T16:09:10.460Z",
    "updatedAt": "2026-08-28T16:09:10.460Z"
  },
  {
    "id": "e8a00233-eb8e-431e-80a1-cf4f5a784af0",
    "name": "700L Mobile Concrete Mixer – Heavy-Duty 4-Wheel Construction Mixer",
    "slug": "700l-mobile-concrete-mixer-heavy-duty-4-wheel-construction-mixer-7363",
    "description": "Heavy-duty vertical concrete and mortar mixer designed for construction sites and commercial projects.\nFeatures a large 700L mixing drum with a mobile four-wheel design for easy movement around the worksite.\nAvailable with gasoline or diesel engine options to suit different working conditions.\nIdeal for mixing concrete, cement, mortar and other construction materials.\nBuilt for reliable performance on building, masonry and general construction projects.",
    "categoryId": "873c6e30-96e5-4ef2-a100-d2e2c841a50a",
    "category": {
      "id": "873c6e30-96e5-4ef2-a100-d2e2c841a50a",
      "name": "Tools & Construction Equipment",
      "slug": "tools-equipment"
    },
    "sku": "SKU-941339",
    "referenceUrl": "",
    "price": 10000,
    "priceCny": 4700,
    "currency": "GHS",
    "unit": "Per piece",
    "stockQuantity": 500,
    "stockStatus": "PRE_ORDER",
    "originCountry": "China",
    "moq": 1,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-e8a00233-eb8e-431e-80a1-cf4f5a784af0.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-e8a00233-eb8e-431e-80a1-cf4f5a784af0-0.jpg",
      "/uploads/prod-gallery-e8a00233-eb8e-431e-80a1-cf4f5a784af0-1.jpg",
      "/uploads/prod-gallery-e8a00233-eb8e-431e-80a1-cf4f5a784af0-2.jpg",
      "/uploads/prod-gallery-e8a00233-eb8e-431e-80a1-cf4f5a784af0-3.jpg",
      "/uploads/prod-gallery-e8a00233-eb8e-431e-80a1-cf4f5a784af0-4.jpg",
      "/uploads/prod-gallery-e8a00233-eb8e-431e-80a1-cf4f5a784af0-5.jpg"
    ],
    "createdAt": "2026-08-28T15:37:38.093Z",
    "updatedAt": "2026-08-28T15:37:38.093Z"
  },
  {
    "id": "8f5509e4-2063-4f36-9bee-cfe7e2c4a860",
    "name": "Premium 3D Face Recognition Smart Door Lock – Waterproof & Keyless Security",
    "slug": "premium-3d-face-recognition-smart-door-lock-waterproof-keyless-security-3266",
    "description": "Advanced smart door lock designed for homes, villas, apartments, offices and entrance doors.\nSupports 3D face recognition, fingerprint, password and key access for secure everyday entry.\nBuilt with an IP66 waterproof design and engineered to operate in temperatures as low as -35°C.\nAvailable in matte black, silver grey, pink and blue, with single or dual-battery options.\nOptional remote control up to 200 m is also available for added convenience.",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Building Materials",
      "slug": "building-materials"
    },
    "sku": "SKU-197176",
    "referenceUrl": "",
    "price": 1200,
    "priceCny": 564,
    "currency": "GHS",
    "unit": "per piece",
    "stockQuantity": 500,
    "stockStatus": "PRE_ORDER",
    "originCountry": "China",
    "moq": 5,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-8f5509e4-2063-4f36-9bee-cfe7e2c4a860.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-8f5509e4-2063-4f36-9bee-cfe7e2c4a860-0.jpg",
      "/uploads/prod-gallery-8f5509e4-2063-4f36-9bee-cfe7e2c4a860-1.jpg",
      "/uploads/prod-gallery-8f5509e4-2063-4f36-9bee-cfe7e2c4a860-2.jpg",
      "/uploads/prod-gallery-8f5509e4-2063-4f36-9bee-cfe7e2c4a860-3.jpg"
    ],
    "createdAt": "2026-08-28T13:03:14.125Z",
    "updatedAt": "2026-08-28T13:04:11.998Z"
  },
  {
    "id": "57cf77ed-a982-4102-b01c-d281b1d4f662",
    "name": "Smart Wooden Door Lock – Fingerprint, Password, Card & App Access",
    "slug": "smart-wooden-door-lock-fingerprint-password-card-app-access-7757",
    "description": "Modern smart lock designed for wooden doors in homes, apartments, offices and rental properties.\nAvailable with fingerprint, password and card access, with Wi-Fi/App remote management on supported versions.\nBuilt with an aluminium-alloy body and available in multiple finishes including black, silver and gold.\nCompatible with 50/85 series lock bodies and offered in several configurations to suit different security needs.\nA practical keyless access solution for residential, commercial and property-management use.",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Building Materials",
      "slug": "building-materials"
    },
    "sku": "SKU-498793",
    "referenceUrl": "",
    "price": 400,
    "priceCny": 188,
    "currency": "GHS",
    "unit": "per piece",
    "stockQuantity": 5000,
    "stockStatus": "PRE_ORDER",
    "originCountry": "China",
    "moq": 20,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-57cf77ed-a982-4102-b01c-d281b1d4f662.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-57cf77ed-a982-4102-b01c-d281b1d4f662-0.jpg",
      "/uploads/prod-gallery-57cf77ed-a982-4102-b01c-d281b1d4f662-1.jpg",
      "/uploads/prod-gallery-57cf77ed-a982-4102-b01c-d281b1d4f662-2.jpg",
      "/uploads/prod-gallery-57cf77ed-a982-4102-b01c-d281b1d4f662-3.jpg"
    ],
    "createdAt": "2026-08-28T12:43:47.767Z",
    "updatedAt": "2026-08-28T13:04:32.138Z"
  },
  {
    "id": "864bf6e3-3976-4ee5-81bc-6d47da9803b8",
    "name": "Smart Glass Door Fingerprint Lock – Fast & Secure Access",
    "slug": "smart-glass-door-fingerprint-lock-fast-secure-access-5044",
    "description": "Smart Glass Door Fingerprint Lock – Fast & Secure Access\n\nModern smart lock for offices, shops, meeting rooms and commercial glass doors.\nSupports fingerprint, password, card and smart access control for convenient keyless entry.\n\nStores up to 100 fingerprints with recognition in under 0.5 seconds.\nDesigned for long-term use with over 100,000 unlock operations and a low false recognition rate.\nA sleek, reliable security upgrade for professional spaces.",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Building Materials",
      "slug": "building-materials"
    },
    "sku": "SKU-834138",
    "referenceUrl": "",
    "price": 199,
    "priceCny": 94,
    "currency": "GHS",
    "unit": "per piece",
    "stockQuantity": 100,
    "stockStatus": "PRE_ORDER",
    "originCountry": "China",
    "moq": 20,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-864bf6e3-3976-4ee5-81bc-6d47da9803b8.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-864bf6e3-3976-4ee5-81bc-6d47da9803b8-0.jpg",
      "/uploads/prod-gallery-864bf6e3-3976-4ee5-81bc-6d47da9803b8-1.jpg",
      "/uploads/prod-gallery-864bf6e3-3976-4ee5-81bc-6d47da9803b8-2.jpg",
      "/uploads/prod-gallery-864bf6e3-3976-4ee5-81bc-6d47da9803b8-3.jpg"
    ],
    "createdAt": "2026-08-28T12:03:25.905Z",
    "updatedAt": "2026-08-28T12:33:57.600Z"
  },
  {
    "id": "d894b2b1-e36a-4b9b-bafd-1f98418e9836",
    "name": "Luxury Cast Aluminium Entrance Door – Premium Double-Door Design",
    "slug": "industrial-portable-electric-concrete-mixer-350l",
    "description": "Premium cast aluminium entrance door designed for villas, luxury homes and modern residential properties.\nFeatures a bold double-door design with detailed decorative finishing for a high-end exterior look.\nMade from durable cast aluminium and available in multiple designs and finishes.\nSuitable for main entrances, villas, duplexes and custom-built homes.\nCan be custom-made to suit different entrance sizes and design requirements.",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Building Materials",
      "slug": "building-materials"
    },
    "sku": "EQP-MIXER-350L-ELE",
    "price": 5000,
    "priceCny": 2350,
    "currency": "GHS",
    "unit": "per unit",
    "stockQuantity": 1000,
    "stockStatus": "PRE_ORDER",
    "originCountry": "China",
    "moq": 10,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-d894b2b1-e36a-4b9b-bafd-1f98418e9836.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-d894b2b1-e36a-4b9b-bafd-1f98418e9836-0.jpg",
      "/uploads/prod-gallery-d894b2b1-e36a-4b9b-bafd-1f98418e9836-1.jpg",
      "/uploads/prod-gallery-d894b2b1-e36a-4b9b-bafd-1f98418e9836-2.jpg",
      "/uploads/prod-gallery-d894b2b1-e36a-4b9b-bafd-1f98418e9836-3.jpg",
      "/uploads/prod-gallery-d894b2b1-e36a-4b9b-bafd-1f98418e9836-4.jpg"
    ],
    "createdAt": "2026-08-09T04:32:09.393Z",
    "updatedAt": "2026-08-28T14:30:37.526Z",
    "referenceUrl": ""
  },
  {
    "id": "5272089b-6a02-4b39-be08-5ec5e3cd9855",
    "name": "Premium Thermal Break Pivot Entrance Door – Anti-Theft & Soundproof",
    "slug": "ultra-hd-outdoor-4k-solar-ai-security-camera-kit",
    "description": "Modern 100 Series thermal break aluminium entrance door designed for villas, apartments and premium homes.\nFeatures an offset-axis/pivot opening system with a strong 100 mm door frame profile for a solid, high-end finish.\nBuilt for improved security, sound insulation and everyday durability.\nIts thermal-break aluminium construction also helps reduce heat transfer for better indoor comfort.\nIdeal for main entrances, luxury residences and contemporary architectural projects.",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Building Materials",
      "slug": "building-materials"
    },
    "sku": "SEC-4K-SOLAR-CAM-KIT",
    "price": 599,
    "priceCny": 282,
    "currency": "GHS",
    "unit": "Per one",
    "stockQuantity": 3998,
    "stockStatus": "PRE_ORDER",
    "originCountry": "China",
    "moq": 10,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-5272089b-6a02-4b39-be08-5ec5e3cd9855.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-5272089b-6a02-4b39-be08-5ec5e3cd9855-0.jpg",
      "/uploads/prod-gallery-5272089b-6a02-4b39-be08-5ec5e3cd9855-1.jpg",
      "/uploads/prod-gallery-5272089b-6a02-4b39-be08-5ec5e3cd9855-2.jpg",
      "/uploads/prod-gallery-5272089b-6a02-4b39-be08-5ec5e3cd9855-3.jpg"
    ],
    "createdAt": "2026-08-09T04:32:07.938Z",
    "updatedAt": "2026-08-28T14:43:07.077Z",
    "referenceUrl": ""
  },
  {
    "id": "6715736b-7b9f-423d-ae36-9d96612ebc4f",
    "name": "100 Series Cast Aluminium Smart Entry Door – Anti-Theft, Waterproof & Soundproof",
    "slug": "turkish-engineered-natural-oak-hardwood-flooring",
    "description": "Premium cast aluminium entrance door designed for villas, modern homes and luxury residential projects.\nFeatures concealed hinges for a clean, seamless finish and a strong anti-theft structure for added security.\nBuilt with waterproof and soundproof performance for reliable everyday use.\nSupports OEM/ODM customization to suit different sizes, finishes and project requirements.\nIdeal for main entrances, villas, apartments and high-end residential properties.",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Building Materials",
      "slug": "building-materials"
    },
    "sku": "WOOD-TURK-OAK-15190",
    "price": 3600,
    "priceCny": 1692,
    "currency": "GHS",
    "unit": "Per Unit",
    "stockQuantity": 600,
    "stockStatus": "PRE_ORDER",
    "originCountry": "China",
    "moq": 5,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-6715736b-7b9f-423d-ae36-9d96612ebc4f.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-6715736b-7b9f-423d-ae36-9d96612ebc4f-0.jpg",
      "/uploads/prod-gallery-6715736b-7b9f-423d-ae36-9d96612ebc4f-1.jpg",
      "/uploads/prod-gallery-6715736b-7b9f-423d-ae36-9d96612ebc4f-2.jpg",
      "/uploads/prod-gallery-6715736b-7b9f-423d-ae36-9d96612ebc4f-3.jpg"
    ],
    "createdAt": "2026-08-09T04:32:06.288Z",
    "updatedAt": "2026-08-28T14:56:59.777Z",
    "referenceUrl": ""
  },
  {
    "id": "ee402e56-affb-452c-973c-a4de2bbc1ac2",
    "name": "Tuya WiFi Fingerprint Access Control – IP66 Smart Door Entry System",
    "slug": "commercial-automatic-hydraulic-swing-gate-opener",
    "description": "Smart access control system for offices, shops, apartments, gates and commercial entrances.\nSupports fingerprint and password access, with the WiFi version allowing convenient control through the Tuya mobile app.\nBuilt with an IP66 waterproof housing, making it suitable for both indoor and outdoor installation.\nCan be paired with magnetic locks, electric bolt locks and access-control accessories for a complete door security setup.\nA practical solution for modern keyless entry, staff access and property security.",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Building Materials",
      "slug": "building-materials"
    },
    "sku": "GATE-AUTO-HYD-500",
    "price": 79,
    "priceCny": 37,
    "currency": "GHS",
    "unit": "per set",
    "stockQuantity": 18000,
    "stockStatus": "PRE_ORDER",
    "originCountry": "China",
    "moq": 1000,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-ee402e56-affb-452c-973c-a4de2bbc1ac2.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-ee402e56-affb-452c-973c-a4de2bbc1ac2-0.jpg",
      "/uploads/prod-gallery-ee402e56-affb-452c-973c-a4de2bbc1ac2-1.jpg",
      "/uploads/prod-gallery-ee402e56-affb-452c-973c-a4de2bbc1ac2-2.jpg",
      "/uploads/prod-gallery-ee402e56-affb-452c-973c-a4de2bbc1ac2-3.jpg"
    ],
    "createdAt": "2026-08-09T04:32:04.575Z",
    "updatedAt": "2026-08-28T13:16:28.433Z",
    "referenceUrl": ""
  },
  {
    "id": "307aa031-d0c3-4fce-aec8-f6b8db9e287d",
    "name": "Automatic Aluminium Garage Door – Smart Remote Control & Modern Design",
    "slug": "luxury-brushed-gold-thermostatic-rain-shower-set",
    "description": "Modern aluminium alloy garage door designed for villas, homes and residential garages.\nFeatures electric automatic operation with remote control for convenient everyday access.\nBuilt with a durable aluminium structure and available in different finishes and customised sizes.\nSuitable for modern homes, private garages and villa projects requiring a clean, secure entrance.\nCombines practical automation, durability and contemporary exterior styling.",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Building Materials",
      "slug": "building-materials"
    },
    "sku": "BATH-GOLD-SHOWER-SET",
    "price": 599,
    "priceCny": 282,
    "currency": "GHS",
    "unit": "per sqm",
    "stockQuantity": 2800,
    "stockStatus": "PRE_ORDER",
    "originCountry": "China",
    "moq": 2,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-307aa031-d0c3-4fce-aec8-f6b8db9e287d.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-307aa031-d0c3-4fce-aec8-f6b8db9e287d-0.jpg",
      "/uploads/prod-gallery-307aa031-d0c3-4fce-aec8-f6b8db9e287d-1.jpg",
      "/uploads/prod-gallery-307aa031-d0c3-4fce-aec8-f6b8db9e287d-2.jpg",
      "/uploads/prod-gallery-307aa031-d0c3-4fce-aec8-f6b8db9e287d-3.jpg"
    ],
    "createdAt": "2026-08-09T04:32:03.009Z",
    "updatedAt": "2026-08-28T15:20:03.353Z",
    "referenceUrl": ""
  },
  {
    "id": "f11816a0-6425-4d30-aad9-e38cc76b0ac0",
    "name": "QT6-15 Fully Automatic Hydraulic Block & Paving Brick Machine",
    "slug": "5-5kva-hybrid-solar-inverter-lithium-battery-system",
    "description": "Heavy-duty automatic block-making machine designed for commercial concrete product manufacturing.\nProduces hollow blocks, cement bricks, paving blocks and curb stones using hydraulic forming technology.\nDesigned for high-volume production with consistent block size and compaction.\nSuitable for block factories, construction companies and large building-material projects.\nA practical solution for businesses looking to scale up cement block and paving stone production.",
    "categoryId": "873c6e30-96e5-4ef2-a100-d2e2c841a50a",
    "category": {
      "id": "873c6e30-96e5-4ef2-a100-d2e2c841a50a",
      "name": "Tools & Construction Equipment",
      "slug": "tools-equipment"
    },
    "sku": "SOLAR-HYBRID-55KVA-KIT",
    "price": 139000,
    "priceCny": 65330,
    "currency": "GHS",
    "unit": "Per complete system",
    "stockQuantity": 100,
    "stockStatus": "PRE_ORDER",
    "originCountry": "China",
    "moq": 1,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-f11816a0-6425-4d30-aad9-e38cc76b0ac0.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-f11816a0-6425-4d30-aad9-e38cc76b0ac0-0.jpg",
      "/uploads/prod-gallery-f11816a0-6425-4d30-aad9-e38cc76b0ac0-1.jpg",
      "/uploads/prod-gallery-f11816a0-6425-4d30-aad9-e38cc76b0ac0-2.jpg",
      "/uploads/prod-gallery-f11816a0-6425-4d30-aad9-e38cc76b0ac0-3.jpg"
    ],
    "createdAt": "2026-08-09T04:32:01.068Z",
    "updatedAt": "2026-08-28T15:50:40.785Z",
    "referenceUrl": ""
  },
  {
    "id": "5b6a6db9-e04b-452c-99dc-adfac6eb92a7",
    "name": "French-Style Aluminium Glass Door – Elegant, Rust-Resistant & Customizable",
    "slug": "spanish-calacatta-gold-porcelain-wall-tiles",
    "description": "Elegant French-style aluminium swing door designed for bathrooms, kitchens, washrooms and modern interior spaces.\nBuilt with corrosion-resistant, rust-proof aluminium alloy for reliable everyday use.\nFeatures decorative textured/oil-sand glass that adds privacy while keeping the space bright and stylish.\nAvailable in multiple designs, colours and single or double-door options.\nA refined interior door solution for homes, apartments, hotels and renovation projects.",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Building Materials",
      "slug": "building-materials"
    },
    "sku": "TILE-ESP-3090-CAL-GOLD",
    "price": 1200,
    "priceCny": 564,
    "currency": "GHS",
    "unit": "Per Unit",
    "stockQuantity": 320,
    "stockStatus": "PRE_ORDER",
    "originCountry": "China",
    "moq": 15,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-5b6a6db9-e04b-452c-99dc-adfac6eb92a7.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-5b6a6db9-e04b-452c-99dc-adfac6eb92a7-0.jpg",
      "/uploads/prod-gallery-5b6a6db9-e04b-452c-99dc-adfac6eb92a7-1.jpg",
      "/uploads/prod-gallery-5b6a6db9-e04b-452c-99dc-adfac6eb92a7-2.jpg",
      "/uploads/prod-gallery-5b6a6db9-e04b-452c-99dc-adfac6eb92a7-3.jpg",
      "/uploads/prod-gallery-5b6a6db9-e04b-452c-99dc-adfac6eb92a7-4.jpg"
    ],
    "createdAt": "2026-08-09T04:31:59.224Z",
    "updatedAt": "2026-08-28T16:58:32.297Z",
    "referenceUrl": ""
  },
  {
    "id": "4b85f698-af38-4bdf-b2e5-fed185a202b0",
    "name": "Smart Biometric Fingerprint & Keypad Front Door Lock",
    "slug": "smart-biometric-fingerprint-front-door-lock",
    "description": "High-security 5-in-1 smart lock. Unlocks via Fingerprint, Mobile App, Passcode, RFID Card, and Key.",
    "categoryId": "873c6e30-96e5-4ef2-a100-d2e2c841a50a",
    "category": {
      "id": "873c6e30-96e5-4ef2-a100-d2e2c841a50a",
      "name": "Tools & Construction Equipment",
      "slug": "tools-equipment"
    },
    "sku": "SEC-SMART-LOCK-01",
    "price": 1200,
    "priceCny": 564,
    "currency": "GHS",
    "unit": "per piece",
    "stockQuantity": 15,
    "stockStatus": "IN_STOCK",
    "originCountry": "China",
    "moq": 5,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/product_lock.png",
    "galleryUrls": [
      "/product_tiles.png"
    ],
    "createdAt": "2026-08-06T17:40:57.170Z",
    "updatedAt": "2026-08-10T21:22:46.928Z",
    "referenceUrl": ""
  },
  {
    "id": "104a26b0-e0e9-42e3-8ebc-461fe7730534",
    "name": "Industrial 20V Brushless Cordless Drill & Impact Driver Set",
    "slug": "industrial-20v-brushless-cordless-drill-kit",
    "description": "Heavy duty construction grade cordless power tool combo kit. Includes 2x 4.0Ah Lithium-ion batteries.",
    "categoryId": "873c6e30-96e5-4ef2-a100-d2e2c841a50a",
    "category": {
      "id": "873c6e30-96e5-4ef2-a100-d2e2c841a50a",
      "name": "Tools & Construction Equipment",
      "slug": "tools-equipment"
    },
    "sku": "TOOL-20V-DRILL-KIT",
    "price": 1850,
    "priceCny": 870,
    "currency": "GHS",
    "unit": "per set",
    "stockQuantity": 35,
    "stockStatus": "IN_STOCK",
    "originCountry": "China",
    "moq": 1,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/product_drill.png",
    "galleryUrls": [
      "/product_tiles.png"
    ],
    "createdAt": "2026-08-06T17:40:55.595Z",
    "updatedAt": "2026-08-10T21:22:46.026Z",
    "referenceUrl": ""
  },
  {
    "id": "6e2e6ead-ecb5-4e6e-a007-6a3d3cf695aa",
    "name": "Italian Carrara Porcelain Floor Tiles (60x120cm)",
    "slug": "italian-60x120-porcelain-floor-tiles",
    "description": "Premium nano-polished porcelain floor tiles with authentic Carrara marble pattern. High wear resistance.",
    "categoryId": "f651a8f7-cae2-4d29-a642-af09a8c9baaf",
    "category": {
      "id": "f651a8f7-cae2-4d29-a642-af09a8c9baaf",
      "name": "Tiles & Marble Slabs",
      "slug": "tiles-marble"
    },
    "sku": "TILE-ITA-60120-CAR",
    "price": 145,
    "priceCny": 68,
    "currency": "GHS",
    "unit": "per box (1.44 sqm)",
    "stockQuantity": 450,
    "stockStatus": "IN_STOCK",
    "originCountry": "Italy",
    "moq": 20,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/product_tiles.png",
    "galleryUrls": [
      "/product_tiles.png"
    ],
    "createdAt": "2026-08-06T17:40:54.076Z",
    "updatedAt": "2026-08-10T21:22:44.929Z",
    "referenceUrl": ""
  },
  {
    "id": "prod-1788298572593",
    "name": "Prmemium Solar light with Camera for Construction sites ",
    "slug": "prmemium-solar-light-with-camera-for-construction-sites--2593",
    "description": "Premium solar lights with camera ",
    "categoryId": "9f7fa387-f68b-4519-9aab-3a16a400713b",
    "category": {
      "id": "9f7fa387-f68b-4519-9aab-3a16a400713b",
      "name": "Tools & Construction"
    },
    "sku": "SKU-475218",
    "referenceUrl": "https://detail.1688.com/offer/694443923786.html?offerId=694443923786&spm=a260k.home2025/2026.recommendpart.6",
    "price": 299.99,
    "priceCny": 145,
    "currency": "GHS",
    "unit": "Per piece",
    "stockQuantity": 500,
    "stockStatus": "IN_STOCK",
    "originCountry": "China",
    "moq": 11,
    "status": "PUBLISHED",
    "featured": true,
    "imageUrl": "/uploads/prod-prod-1788298572593.jpg",
    "galleryUrls": [
      "/uploads/prod-gallery-prod-1788298572593-0.jpg",
      "/uploads/prod-gallery-prod-1788298572593-1.jpg",
      "/uploads/prod-gallery-prod-1788298572593-2.jpg",
      "/uploads/prod-gallery-prod-1788298572593-3.jpg"
    ],
    "createdAt": "2026-09-01T21:36:12.593Z",
    "updatedAt": "2026-09-01T21:36:12.593Z"
  }
];
