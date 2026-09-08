import fs from "fs";
import path from "path";
import { prisma } from "./db";
import { getSystemSetting, setSystemSetting } from "./system-settings";
import {
  PropertyItem,
  sanitizePropertyForPublic,
  INITIAL_PROPERTIES_STORE,
} from "./properties-constants";

export * from "./properties-constants";

const FILE_PATH = path.join(process.cwd(), "scratch", "properties.json");

function ensureFile() {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_PROPERTIES_STORE, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error maintaining properties.json file:", err);
  }
}

export function readPropertiesFromFile(): PropertyItem[] {
  ensureFile();
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed reading properties from file:", err);
  }
  return INITIAL_PROPERTIES_STORE;
}

export function writePropertiesToFile(properties: PropertyItem[]) {
  ensureFile();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(properties, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing properties to file:", err);
  }
}

function getInitialWarmProperties(): PropertyItem[] {
  try {
    const file = readPropertiesFromFile();
    if (Array.isArray(file) && file.length > 0) return file;
  } catch (e) {}
  return INITIAL_PROPERTIES_STORE;
}

// In-memory instant cache for sub-second burst deduplication only (2 seconds max)
let cachedProperties: PropertyItem[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 2000; // 2 seconds max deduplication

export function invalidatePropertiesCache() {
  cachedProperties = null;
  cacheTime = 0;
}

export async function getPropertyBySlug(slug: string): Promise<PropertyItem | null> {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const properties = await getAllProperties();
  return (
    properties.find(
      (p) =>
        p.slug.toLowerCase() === cleanSlug ||
        p.id.toLowerCase() === cleanSlug
    ) || null
  );
}

export async function getAllProperties(): Promise<PropertyItem[]> {
  const now = Date.now();
  if (cachedProperties && cachedProperties.length > 0 && now - cacheTime < CACHE_DURATION) {
    return cachedProperties;
  }

  // 1. Read from system_settings (PostgreSQL) - primary persistent store
  let dbCatalog: PropertyItem[] = [];
  try {
    const { data, isDefault } = await getSystemSetting<PropertyItem[]>(
      "properties_catalog",
      INITIAL_PROPERTIES_STORE
    );
    if (Array.isArray(data) && data.length > 0) {
      dbCatalog = data;
    }
  } catch (e) {
    console.warn("Could not read properties from system_settings:", e);
  }

  // 2. Read directly from prisma.property to ensure all DB-stored items reflect
  let prismaProperties: PropertyItem[] = [];
  try {
    const dbPromise = prisma.property.findMany({
      orderBy: { createdAt: "desc" },
    });
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
    const rawDbProps = await Promise.race([dbPromise, timeoutPromise]);

    if (rawDbProps && Array.isArray(rawDbProps) && rawDbProps.length > 0) {
      prismaProperties = rawDbProps.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        listingType: p.listingType,
        propertyType: p.propertyType,
        status: p.status,
        price: p.price,
        currency: p.currency,
        pricePeriod: p.pricePeriod || (p.listingType === "RENT" ? "per month" : "outright purchase"),
        negotiable: p.negotiable ?? true,
        commission: p.commission || "",
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        guestRooms: p.guestRooms,
        boysQuarters: p.boysQuarters,
        garage: p.garage,
        sizeSqft: p.sizeSqft,
        livingAreaSqft: p.livingAreaSqft,
        locationAddress: p.locationAddress,
        city: p.city,
        region: p.region,
        country: p.country,
        featured: p.featured,
        imageUrl: p.imageUrl || "/property_villa.png",
        galleryUrls: p.galleryUrls || [],
        contactName: "Desmond Senanu",
        contactPhone: "+233 24 643 2493",
        contactEmail: "sales@loveridgeproperties.com",
        amenities: [],
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt || new Date().toISOString(),
      }));
    }
  } catch (err) {
    // Database transiently slow or unavailable
  }

  // 3. Read from local scratch file
  const fileProperties = readPropertiesFromFile();

  // 4. Merge all unique records across all sources (priority: dbCatalog > prismaProperties > file > initial)
  const map = new Map<string, PropertyItem>();

  for (const p of INITIAL_PROPERTIES_STORE) {
    if (p.id) map.set(p.id, p);
  }
  for (const p of fileProperties) {
    if (p.id) map.set(p.id, { ...map.get(p.id), ...p });
  }
  for (const p of dbCatalog) {
    if (p.id) map.set(p.id, { ...map.get(p.id), ...p });
  }
  for (const p of prismaProperties) {
    if (p.id) {
      const existing = map.get(p.id) || ({} as any);
      map.set(p.id, {
        ...existing,
        ...p,
        isFavourite: existing.isFavourite ?? (p as any).isFavourite ?? false,
        featured: p.featured !== undefined ? p.featured : (existing.featured ?? false),
        contactName: existing.contactName || p.contactName || "Desmond Senanu",
        contactPhone: existing.contactPhone || p.contactPhone || "+233 24 643 2493",
        contactEmail: existing.contactEmail || p.contactEmail || "sales@loveridgeproperties.com",
        ownerName: existing.ownerName || "",
        ownerPhone: existing.ownerPhone || "",
        ownerCompany: existing.ownerCompany || "",
        commission: existing.commission || "",
        amenities: existing.amenities && existing.amenities.length > 0 ? existing.amenities : p.amenities || [],
        imageUrl: p.imageUrl || existing.imageUrl || "/property_villa.png",
        galleryUrls: p.galleryUrls && p.galleryUrls.length > 0 ? p.galleryUrls : existing.galleryUrls || [],
      });
    }
  }

  const mergedList = Array.from(map.values());
  if (mergedList.length === 0) {
    return INITIAL_PROPERTIES_STORE;
  }

  // Sort: Favourites come first (positions 1, 2, 3), then by newest creation date
  mergedList.sort((a, b) => {
    const aFav = a.isFavourite ? 1 : 0;
    const bFav = b.isFavourite ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  cachedProperties = mergedList;
  cacheTime = now;

  // Background sync if sources differed
  if (mergedList.length > dbCatalog.length || mergedList.length > fileProperties.length) {
    setSystemSetting("properties_catalog", mergedList).catch(() => null);
    writePropertiesToFile(mergedList);
  }

  return mergedList;
}

export async function saveProperty(propData: Partial<PropertyItem>): Promise<PropertyItem> {
  invalidatePropertiesCache();
  const currentProps = await getAllProperties();
  const now = new Date().toISOString();

  let existingIndex = -1;
  if (propData.id) {
    existingIndex = currentProps.findIndex((p) => p.id === propData.id);
  }
  if (existingIndex === -1 && propData.slug) {
    existingIndex = currentProps.findIndex((p) => p.slug === propData.slug);
  }

  const existing = existingIndex >= 0 ? currentProps[existingIndex] : null;

  const requestedFav = propData.isFavourite !== undefined
    ? Boolean(propData.isFavourite)
    : (propData as any).favourite !== undefined
    ? Boolean((propData as any).favourite)
    : existing
    ? Boolean(existing.isFavourite)
    : false;

  // Enforce logical limit: maximum of 3 Favourite properties allowed
  let isFav = requestedFav;
  if (requestedFav) {
    const otherFavCount = currentProps.filter((p) => p.isFavourite && p.id !== (propData.id || existing?.id)).length;
    if (otherFavCount >= 3) {
      isFav = false;
    }
  }

  const newProperty: PropertyItem = {
    id: propData.id || existing?.id || `prop-${Date.now()}`,
    title: propData.title || existing?.title || "Untitled Property",
    slug: propData.slug || existing?.slug || ((propData.title || existing?.title || "prop").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4)),
    description: propData.description !== undefined ? propData.description : (existing?.description || "Property listing description."),
    listingType: propData.listingType || existing?.listingType || "SALE",
    propertyType: propData.propertyType || existing?.propertyType || "HOUSE",
    status: propData.status || existing?.status || "PUBLISHED",
    price: propData.price !== undefined
      ? (typeof propData.price === "number" ? propData.price : parseFloat(propData.price as any) || 0)
      : (existing?.price ?? 0),
    currency: propData.currency || existing?.currency || "USD",
    pricePeriod: propData.pricePeriod || existing?.pricePeriod || (propData.listingType === "RENT" ? "per month" : "outright purchase"),
    negotiable: propData.negotiable !== undefined ? Boolean(propData.negotiable) : (existing?.negotiable ?? true),
    commission: propData.commission !== undefined ? propData.commission : (existing?.commission || ""),
    bedrooms: propData.bedrooms !== undefined
      ? (typeof propData.bedrooms === "number" ? propData.bedrooms : parseInt(propData.bedrooms as any) || 0)
      : (existing?.bedrooms ?? 0),
    bathrooms: propData.bathrooms !== undefined
      ? (typeof propData.bathrooms === "number" ? propData.bathrooms : parseInt(propData.bathrooms as any) || 0)
      : (existing?.bathrooms ?? 0),
    guestRooms: propData.guestRooms !== undefined
      ? (typeof propData.guestRooms === "number" ? propData.guestRooms : parseInt(propData.guestRooms as any) || 0)
      : (existing?.guestRooms ?? 0),
    boysQuarters: propData.boysQuarters !== undefined
      ? (typeof propData.boysQuarters === "number" ? propData.boysQuarters : parseInt(propData.boysQuarters as any) || 0)
      : (existing?.boysQuarters ?? 0),
    garage: propData.garage !== undefined
      ? (typeof propData.garage === "number" ? propData.garage : parseInt(propData.garage as any) || 0)
      : (existing?.garage ?? 0),
    sizeSqft: propData.sizeSqft !== undefined
      ? (typeof propData.sizeSqft === "number" ? propData.sizeSqft : parseFloat(propData.sizeSqft as any))
      : (existing?.sizeSqft ?? null),
    livingAreaSqft: propData.livingAreaSqft !== undefined
      ? (typeof propData.livingAreaSqft === "number" ? propData.livingAreaSqft : parseFloat(propData.livingAreaSqft as any))
      : (existing?.livingAreaSqft ?? null),
    locationAddress: propData.locationAddress || existing?.locationAddress || "Accra",
    city: propData.city || existing?.city || "Accra",
    region: propData.region || existing?.region || "Greater Accra",
    country: propData.country || existing?.country || "Ghana",
    featured: propData.featured !== undefined ? Boolean(propData.featured) : Boolean(existing?.featured || isFav),
    isFavourite: isFav,
    imageUrl: propData.imageUrl || existing?.imageUrl || "/property_villa.png",
    galleryUrls: Array.isArray(propData.galleryUrls)
      ? propData.galleryUrls
      : (existing?.galleryUrls || (propData.imageUrl ? [propData.imageUrl] : [])),
    contactName: propData.contactName || existing?.contactName || "Desmond Senanu",
    contactPhone: propData.contactPhone || existing?.contactPhone || "+233 24 643 2493",
    contactEmail: propData.contactEmail || existing?.contactEmail || "sales@loveridgeproperties.com",
    ownerName: propData.ownerName !== undefined ? propData.ownerName : (existing?.ownerName || ""),
    ownerPhone: propData.ownerPhone !== undefined ? propData.ownerPhone : (existing?.ownerPhone || ""),
    ownerCompany: propData.ownerCompany !== undefined ? propData.ownerCompany : (existing?.ownerCompany || ""),
    amenities: Array.isArray(propData.amenities)
      ? propData.amenities
      : (existing?.amenities || []),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  let updatedList = [...currentProps];
  if (existingIndex >= 0) {
    updatedList[existingIndex] = { ...updatedList[existingIndex], ...newProperty };
  } else {
    updatedList.unshift(newProperty);
  }

  // Sort updated list: Favourites first, then newest
  updatedList.sort((a, b) => {
    const aFav = a.isFavourite ? 1 : 0;
    const bFav = b.isFavourite ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // Update in-memory cache immediately
  cachedProperties = updatedList;
  cacheTime = Date.now();

  // Write to local scratch file synchronously
  writePropertiesToFile(updatedList);

  // Write to PostgreSQL system_settings immediately
  try {
    await setSystemSetting("properties_catalog", updatedList);
  } catch (err) {
    console.error("Failed writing properties to system_settings:", err);
  }

  // Synchronously upsert in Prisma database
  try {
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@loveridge.com" },
      select: { id: true },
    });
    const anyUser = await prisma.user.findFirst({ select: { id: true } });
    const defaultUserId = adminUser?.id || anyUser?.id || "1ee92fa7-a3b4-4841-bc10-22e26a3d9fef";

    await prisma.property.upsert({
      where: { id: newProperty.id },
      create: {
        id: newProperty.id,
        title: newProperty.title,
        slug: newProperty.slug,
        description: newProperty.description,
        listingType: newProperty.listingType,
        propertyType: newProperty.propertyType,
        status: newProperty.status,
        price: newProperty.price,
        currency: newProperty.currency,
        pricePeriod: newProperty.pricePeriod,
        bedrooms: newProperty.bedrooms,
        bathrooms: newProperty.bathrooms,
        guestRooms: newProperty.guestRooms || 0,
        boysQuarters: newProperty.boysQuarters || 0,
        garage: newProperty.garage || 0,
        sizeSqft: newProperty.sizeSqft,
        livingAreaSqft: newProperty.livingAreaSqft,
        locationAddress: newProperty.locationAddress,
        city: newProperty.city,
        region: newProperty.region,
        country: newProperty.country,
        featured: newProperty.featured,
        imageUrl: newProperty.imageUrl,
        galleryUrls: newProperty.galleryUrls,
        createdById: defaultUserId,
        agentId: defaultUserId,
        publishedAt: newProperty.status === "PUBLISHED" ? new Date() : null,
      },
      update: {
        title: newProperty.title,
        slug: newProperty.slug,
        description: newProperty.description,
        listingType: newProperty.listingType,
        propertyType: newProperty.propertyType,
        status: newProperty.status,
        price: newProperty.price,
        currency: newProperty.currency,
        pricePeriod: newProperty.pricePeriod,
        bedrooms: newProperty.bedrooms,
        bathrooms: newProperty.bathrooms,
        guestRooms: newProperty.guestRooms || 0,
        boysQuarters: newProperty.boysQuarters || 0,
        garage: newProperty.garage || 0,
        sizeSqft: newProperty.sizeSqft,
        livingAreaSqft: newProperty.livingAreaSqft,
        locationAddress: newProperty.locationAddress,
        city: newProperty.city,
        region: newProperty.region,
        country: newProperty.country,
        featured: newProperty.featured,
        imageUrl: newProperty.imageUrl,
        galleryUrls: newProperty.galleryUrls,
        publishedAt: newProperty.status === "PUBLISHED" ? new Date() : null,
      },
    }).catch((prismaErr) => {
      console.warn("Prisma property upsert note:", prismaErr?.message || prismaErr);
    });
  } catch (e) {
    // Database background sync note
  }

  // Clear memory cache so subsequent calls re-verify
  invalidatePropertiesCache();

  return newProperty;
}

export async function deleteProperty(id: string): Promise<boolean> {
  invalidatePropertiesCache();
  const currentProps = await getAllProperties();
  const updated = currentProps.filter((p) => p.id !== id);

  cachedProperties = updated;
  cacheTime = Date.now();

  writePropertiesToFile(updated);
  try {
    await setSystemSetting("properties_catalog", updated);
  } catch (err) {
    console.error("Failed writing updated catalog to system_settings:", err);
  }

  try {
    await prisma.property.delete({ where: { id } }).catch(() => null);
  } catch (e) {
    // ignore prisma delete error
  }

  invalidatePropertiesCache();
  return true;
}
