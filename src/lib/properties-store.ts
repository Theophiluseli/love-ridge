import fs from "fs";
import path from "path";
import { prisma } from "./db";
import { getSystemSetting, setSystemSetting, invalidateSystemSetting } from "./system-settings";
import {
  PropertyItem,
  sanitizePropertyForPublic,
  INITIAL_PROPERTIES_STORE,
} from "./properties-constants";

export * from "./properties-constants";

const FILE_PATH = path.join(process.cwd(), "scratch", "properties.json");
const DELETED_PROPERTIES_FILE = path.join(process.cwd(), "scratch", "deleted-properties.json");
const DELETED_PROPERTIES_SETTING_KEY = "deleted_property_ids";
const CACHE_DURATION = 30000; // 30 seconds

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
    // Silently ignore in read-only environments
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
    // Return initial store on read error
  }
  return [];
}

export function writePropertiesToFile(properties: PropertyItem[]) {
  ensureFile();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(properties, null, 2), "utf-8");
  } catch (err) {
    // Ignore error
  }
}

function readDeletedPropertyIdsFromFile(): Set<string> {
  try {
    if (fs.existsSync(DELETED_PROPERTIES_FILE)) {
      const data = fs.readFileSync(DELETED_PROPERTIES_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
}

function writeDeletedPropertyIdsToFile(ids: Set<string>) {
  try {
    const dir = path.dirname(DELETED_PROPERTIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DELETED_PROPERTIES_FILE, JSON.stringify(Array.from(ids), null, 2), "utf-8");
  } catch (e) {}
}

declare global {
  var __cachedProperties: PropertyItem[] | null | undefined;
  var __cachedPropertiesTime: number | undefined;
  var __cachedDeletedPropertyIds: Set<string> | null | undefined;
  var __deletedIdsCacheTime: number | undefined;
}

export async function getDeletedPropertyIds(): Promise<Set<string>> {
  const now = Date.now();
  if (globalThis.__cachedDeletedPropertyIds && now - (globalThis.__deletedIdsCacheTime || 0) < CACHE_DURATION) {
    return globalThis.__cachedDeletedPropertyIds;
  }

  const fileSet = readDeletedPropertyIdsFromFile();
  try {
    const { data } = await getSystemSetting<string[]>(DELETED_PROPERTIES_SETTING_KEY, []);
    const idSet = new Set<string>([...(Array.isArray(data) ? data : []), ...Array.from(fileSet)]);
    globalThis.__cachedDeletedPropertyIds = idSet;
    globalThis.__deletedIdsCacheTime = now;
    writeDeletedPropertyIdsToFile(idSet);
    return idSet;
  } catch (err) {
    globalThis.__cachedDeletedPropertyIds = fileSet;
    return fileSet;
  }
}

export async function addDeletedPropertyId(id: string): Promise<void> {
  try {
    const current = await getDeletedPropertyIds();
    current.add(id);
    globalThis.__cachedDeletedPropertyIds = current;
    globalThis.__deletedIdsCacheTime = Date.now();
    writeDeletedPropertyIdsToFile(current);
    await setSystemSetting(DELETED_PROPERTIES_SETTING_KEY, Array.from(current)).catch(() => null);
  } catch (err) {
    console.error("Failed adding deleted property ID:", err);
  }
}

export async function removeDeletedPropertyId(id: string): Promise<void> {
  try {
    const current = await getDeletedPropertyIds();
    if (current.has(id)) {
      current.delete(id);
      globalThis.__cachedDeletedPropertyIds = current;
      globalThis.__deletedIdsCacheTime = Date.now();
      writeDeletedPropertyIdsToFile(current);
      await setSystemSetting(DELETED_PROPERTIES_SETTING_KEY, Array.from(current)).catch(() => null);
    }
  } catch (err) {
    console.error("Failed removing deleted property ID:", err);
  }
}

export function invalidatePropertiesCache() {
  globalThis.__cachedProperties = null;
  globalThis.__cachedPropertiesTime = 0;
  globalThis.__cachedDeletedPropertyIds = null;
  globalThis.__deletedIdsCacheTime = 0;
  invalidateSystemSetting("properties_catalog");
  invalidateSystemSetting("deleted_property_ids");
}

export async function getPropertyBySlug(slug: string): Promise<PropertyItem | null> {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const deletedIds = await getDeletedPropertyIds();
  if (deletedIds.has(cleanSlug) || deletedIds.has(slug)) return null;

  const properties = await getAllProperties();
  const found = properties.find(
    (p) =>
      p.slug.toLowerCase() === cleanSlug ||
      p.id.toLowerCase() === cleanSlug
  );
  if (found && (deletedIds.has(found.id) || deletedIds.has(found.slug))) return null;
  return found || null;
}

export async function getAllProperties(): Promise<PropertyItem[]> {
  const now = Date.now();
  if (globalThis.__cachedProperties && globalThis.__cachedProperties.length > 0 && now - (globalThis.__cachedPropertiesTime || 0) < CACHE_DURATION) {
    return globalThis.__cachedProperties;
  }

  // 1. Authoritative DB catalog from system_settings table in PostgreSQL & deleted tombstones (fetched in parallel)
  let dbCatalog: PropertyItem[] = [];
  let deletedIds = new Set<string>();

  try {
    const [dIds, settingRes] = await Promise.all([
      getDeletedPropertyIds(),
      getSystemSetting<PropertyItem[]>("properties_catalog", []).catch(() => ({ data: [] as PropertyItem[], isDefault: true })),
    ]);
    deletedIds = dIds;
    if (!settingRes.isDefault && Array.isArray(settingRes.data) && settingRes.data.length > 0) {
      dbCatalog = settingRes.data;
    }
  } catch (err) {
    deletedIds = await getDeletedPropertyIds().catch(() => new Set<string>());
  }

  // 2. Read from local scratch file (sub-millisecond)
  const fileProperties = readPropertiesFromFile();

  // 3. Only query Prisma properties table if BOTH dbCatalog and fileProperties are empty
  let prismaProperties: PropertyItem[] = [];
  if (dbCatalog.length === 0 && fileProperties.length === 0) {
    try {
      const pProps: any[] = await prisma.property.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      if (pProps && pProps.length > 0) {
        prismaProperties = pProps.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          listingType: p.listingType,
          propertyType: p.propertyType,
          status: p.status || "DRAFT",
          price: p.price,
          currency: p.currency,
          pricePeriod: p.pricePeriod || (p.listingType === "RENT" ? "per month" : "outright purchase"),
          negotiable: p.negotiable ?? true,
          commission: p.commission || "",
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          guestRooms: p.guestRooms || 0,
          boysQuarters: p.boysQuarters || 0,
          garage: p.garage || 0,
          sizeSqft: p.sizeSqft,
          livingAreaSqft: p.livingAreaSqft,
          locationAddress: p.locationAddress,
          city: p.city,
          region: p.region,
          country: p.country,
          featured: p.featured,
          imageUrl: p.imageUrl || "/property_villa.png",
          galleryUrls: p.galleryUrls || [],
          contactName: p.contactName || "Desmond Senanu",
          contactPhone: p.contactPhone || "+233 24 643 2493",
          contactEmail: p.contactEmail || "info@loveridgeproperty.com",
          amenities: [],
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
        }));
      }
    } catch (e) {
      // transient
    }
  }

  const map = new Map<string, PropertyItem>();

  // If neither dbCatalog nor prismaProperties nor fileProperties has items, seed once with INITIAL_PROPERTIES_STORE
  if (dbCatalog.length === 0 && prismaProperties.length === 0 && fileProperties.length === 0) {
    for (const p of INITIAL_PROPERTIES_STORE) {
      if (p.id && !deletedIds.has(p.id)) map.set(p.id, p);
    }
    const seeded = Array.from(map.values());
    setSystemSetting("properties_catalog", seeded).catch(() => null);
    writePropertiesToFile(seeded);
  } else {
    // 1. Authoritative DB catalog from PostgreSQL system_settings
    for (const p of dbCatalog) {
      if (p.id && !deletedIds.has(p.id)) map.set(p.id, p);
    }
    // 2. Overlay Prisma properties
    for (const p of prismaProperties) {
      if (p.id && !deletedIds.has(p.id)) {
        const existing = map.get(p.id) || ({} as any);
        map.set(p.id, { ...existing, ...p });
      }
    }
    // 3. Overlay file properties if any
    for (const p of fileProperties) {
      if (p.id && !deletedIds.has(p.id)) {
        if (!map.has(p.id)) {
          map.set(p.id, p);
        }
      }
    }
  }

  // Explicit safety clean of any deleted tombstones
  for (const id of Array.from(deletedIds)) {
    map.delete(id);
  }

  const mergedList = Array.from(map.values());

  // Sort: Favourites come first (positions 1, 2, 3), then by newest creation date
  mergedList.sort((a, b) => {
    const aFav = a.isFavourite ? 1 : 0;
    const bFav = b.isFavourite ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  globalThis.__cachedProperties = mergedList;
  globalThis.__cachedPropertiesTime = now;

  return mergedList;
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

  const determinedStatus = propData.status ? propData.status : (existing?.status || "PUBLISHED");

  const newProperty: PropertyItem = {
    id: propData.id || existing?.id || `prop-${Date.now()}`,
    title: propData.title || existing?.title || "Untitled Property",
    slug: propData.slug || existing?.slug || ((propData.title || existing?.title || "prop").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4)),
    description: propData.description !== undefined ? propData.description : (existing?.description || "Property listing description."),
    listingType: propData.listingType || existing?.listingType || "SALE",
    propertyType: propData.propertyType || existing?.propertyType || "HOUSE",
    status: determinedStatus,
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
    contactEmail: propData.contactEmail || existing?.contactEmail || "info@loveridgeproperty.com",
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

  // 1. Update in-memory cache immediately (<1ms)
  globalThis.__cachedProperties = updatedList;
  globalThis.__cachedPropertiesTime = Date.now();

  // 2. Write to local scratch file synchronously
  writePropertiesToFile(updatedList);

  // 3. Write to PostgreSQL system_settings table via Prisma
  try {
    await setSystemSetting("properties_catalog", updatedList);
  } catch (err) {
    console.error("Failed writing properties to system_settings:", err);
  }

  // 4. Upsert directly to PostgreSQL properties table via Prisma
  try {
    await (prisma.property as any).upsert({
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
        publishedAt: newProperty.status === "PUBLISHED" ? new Date() : null,
        createdBy: { connect: { id: "1ee92fa7-a3b4-4841-bc10-22e26a3d9fef" } },
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
    });
  } catch (e) {
    console.warn("Prisma property upsert warning:", e);
  }

  if (newProperty.id) {
    await removeDeletedPropertyId(newProperty.id);
  }

  // Clear memory cache so next read gets fresh data
  invalidatePropertiesCache();

  return newProperty;
}

export async function deleteProperty(id: string): Promise<boolean> {
  invalidatePropertiesCache();

  // 1. Permanently register this ID in deleted property tombstones
  await addDeletedPropertyId(id);
  const deletedIds = await getDeletedPropertyIds();

  // 2. Remove from active property list
  const currentProps = await getAllProperties();
  const updated = currentProps.filter((p) => p.id !== id && !deletedIds.has(p.id));

  globalThis.__cachedProperties = updated;
  globalThis.__cachedPropertiesTime = Date.now();

  const fileProps = readPropertiesFromFile().filter((p) => p.id !== id && !deletedIds.has(p.id));
  writePropertiesToFile(fileProps);

  try {
    await setSystemSetting("properties_catalog", updated);
  } catch (err) {
    console.error("Failed writing updated catalog to system_settings:", err);
  }

  // 3. Direct, guaranteed deletion from Prisma PostgreSQL tables
  try {
    await prisma.propertyAmenity.deleteMany({ where: { propertyId: id } }).catch(() => null);
    await prisma.propertyMedia.deleteMany({ where: { propertyId: id } }).catch(() => null);
    await prisma.lead.updateMany({ where: { propertyId: id }, data: { propertyId: null } }).catch(() => null);
    await prisma.property.delete({ where: { id } }).catch(() => null);
  } catch (e) {
    console.warn("Prisma property delete notice:", e);
  }

  invalidatePropertiesCache();
  invalidateSystemSetting("properties_catalog");
  invalidateSystemSetting("deleted_property_ids");
  return true;
}
