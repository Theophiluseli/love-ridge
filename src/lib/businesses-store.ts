import fs from 'fs';
import path from 'path';
import { getSystemSetting, setSystemSetting, invalidateSystemSetting } from './system-settings';
import { normalizeEntityImages } from './image-url-normalizer';
import {
  BusinessItem,
  INITIAL_BUSINESSES_STORE,
  sanitizeBusinessForPublic,
} from './businesses-constants';

export * from './businesses-constants';

const FILE_PATH = path.join(process.cwd(), 'scratch', 'businesses.json');
const DELETED_BUSINESSES_FILE = path.join(process.cwd(), 'scratch', 'deleted-businesses.json');
const BUSINESSES_SETTING_KEY = 'businesses_catalog';
const DELETED_BUSINESSES_SETTING_KEY = 'deleted_business_ids';
const CACHE_DURATION = 300000; // 5 minutes (invalidated instantly on mutation)

function ensureFile() {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_BUSINESSES_STORE, null, 2), 'utf-8');
    }
  } catch (err) {
    // Fail silently in read-only environments
  }
}

export function readBusinessesFromFile(): BusinessItem[] {
  ensureFile();
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((b) => normalizeEntityImages(b, 'biz').item);
      }
    }
  } catch (err) {
    // Return empty on error
  }
  return [];
}

export function writeBusinessesToFile(businesses: BusinessItem[]) {
  ensureFile();
  try {
    const normalized = businesses.map((b) => normalizeEntityImages(b, 'biz').item);
    fs.writeFileSync(FILE_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
  } catch (err) {
    // Ignore error
  }
}

declare global {
  var __cachedBusinessesV1: BusinessItem[] | null | undefined;
  var __cachedBusinessesV1Time: number | undefined;
  var __revalidatingBusinessesPromise: Promise<void> | null | undefined;
  var __cachedDeletedBusinessIds: Set<string> | null | undefined;
  var __deletedBusinessIdsCacheTime: number | undefined;
}

function readDeletedBusinessIdsFromFile(): Set<string> {
  try {
    if (fs.existsSync(DELETED_BUSINESSES_FILE)) {
      const data = fs.readFileSync(DELETED_BUSINESSES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
}

function writeDeletedBusinessIdsToFile(ids: Set<string>) {
  try {
    const dir = path.dirname(DELETED_BUSINESSES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DELETED_BUSINESSES_FILE, JSON.stringify(Array.from(ids), null, 2), 'utf-8');
  } catch (e) {}
}

export async function getDeletedBusinessIds(): Promise<Set<string>> {
  const now = Date.now();
  if (globalThis.__cachedDeletedBusinessIds && now - (globalThis.__deletedBusinessIdsCacheTime || 0) < CACHE_DURATION) {
    return globalThis.__cachedDeletedBusinessIds;
  }
  const fileSet = readDeletedBusinessIdsFromFile();
  try {
    const { data } = await getSystemSetting<string[]>(DELETED_BUSINESSES_SETTING_KEY, []);
    const idSet = new Set<string>([...(Array.isArray(data) ? data : []), ...Array.from(fileSet)]);
    globalThis.__cachedDeletedBusinessIds = idSet;
    globalThis.__deletedBusinessIdsCacheTime = now;
    return idSet;
  } catch (err) {
    globalThis.__cachedDeletedBusinessIds = fileSet;
    return fileSet;
  }
}

export async function addDeletedBusinessId(id: string): Promise<void> {
  try {
    const current = await getDeletedBusinessIds();
    current.add(id);
    globalThis.__cachedDeletedBusinessIds = current;
    globalThis.__deletedBusinessIdsCacheTime = Date.now();
    writeDeletedBusinessIdsToFile(current);
    await setSystemSetting(DELETED_BUSINESSES_SETTING_KEY, Array.from(current)).catch(() => null);
  } catch (err) {
    console.error('Failed adding deleted business ID:', err);
  }
}

export async function removeDeletedBusinessId(id: string): Promise<void> {
  try {
    const current = await getDeletedBusinessIds();
    if (current.has(id)) {
      current.delete(id);
      globalThis.__cachedDeletedBusinessIds = current;
      globalThis.__deletedBusinessIdsCacheTime = Date.now();
      writeDeletedBusinessIdsToFile(current);
      await setSystemSetting(DELETED_BUSINESSES_SETTING_KEY, Array.from(current)).catch(() => null);
    }
  } catch (err) {
    console.error('Failed removing deleted business ID:', err);
  }
}

export function invalidateBusinessesCache() {
  globalThis.__cachedBusinessesV1 = null;
  globalThis.__cachedBusinessesV1Time = 0;
  globalThis.__cachedDeletedBusinessIds = null;
  globalThis.__deletedBusinessIdsCacheTime = 0;
  invalidateSystemSetting(BUSINESSES_SETTING_KEY);
  invalidateSystemSetting(DELETED_BUSINESSES_SETTING_KEY);
}

function sortBusinesses(list: BusinessItem[]): BusinessItem[] {
  return [...list].sort((a, b) => {
    const aFav = a.isFavourite || a.featured ? 1 : 0;
    const bFav = b.isFavourite || b.featured ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

function revalidateBusinessesFromDb() {
  if (globalThis.__revalidatingBusinessesPromise) return;
  globalThis.__revalidatingBusinessesPromise = (async () => {
    try {
      const [settingRes, deletedIds] = await Promise.all([
        getSystemSetting<BusinessItem[]>(BUSINESSES_SETTING_KEY, []),
        getDeletedBusinessIds(),
      ]);

      if (!settingRes.isDefault && Array.isArray(settingRes.data) && settingRes.data.length > 0) {
        const normalized = settingRes.data
          .filter((b) => b && b.id && !deletedIds.has(b.id))
          .map((b) => normalizeEntityImages(b, 'biz').item);

        if (normalized.length > 0) {
          const sorted = sortBusinesses(normalized);
          globalThis.__cachedBusinessesV1 = sorted;
          globalThis.__cachedBusinessesV1Time = Date.now();
          writeBusinessesToFile(sorted);
        }
      }
    } catch (_) {
    } finally {
      globalThis.__revalidatingBusinessesPromise = null;
    }
  })();
}

export async function getAllBusinesses(forceFresh = false): Promise<BusinessItem[]> {
  const now = Date.now();
  if (
    !forceFresh &&
    globalThis.__cachedBusinessesV1 &&
    globalThis.__cachedBusinessesV1.length > 0 &&
    now - (globalThis.__cachedBusinessesV1Time || 0) < CACHE_DURATION
  ) {
    return globalThis.__cachedBusinessesV1;
  }

  // Serve stale-while-revalidate if memory exists
  if (!forceFresh && globalThis.__cachedBusinessesV1 && globalThis.__cachedBusinessesV1.length > 0) {
    globalThis.__cachedBusinessesV1Time = now;
    revalidateBusinessesFromDb();
    return globalThis.__cachedBusinessesV1;
  }

  // Fast-path: serve immediately from file cache (<1ms) while revalidating from PostgreSQL in background
  if (!forceFresh) {
    const fileBusinesses = readBusinessesFromFile();
    const deletedFileSet = readDeletedBusinessIdsFromFile();
    const filtered = fileBusinesses.filter((b) => !deletedFileSet.has(b.id));
    if (filtered.length > 0) {
      const sorted = sortBusinesses(filtered);
      globalThis.__cachedBusinessesV1 = sorted;
      globalThis.__cachedBusinessesV1Time = now;
      revalidateBusinessesFromDb();
      return sorted;
    }
  }

  const deletedIds = await getDeletedBusinessIds();

  // 1. Query PostgreSQL system_settings table
  try {
    const settingRes = await getSystemSetting<BusinessItem[]>(BUSINESSES_SETTING_KEY, []);
    if (!settingRes.isDefault && Array.isArray(settingRes.data) && settingRes.data.length > 0) {
      const normalized = settingRes.data
        .filter((b) => b && b.id && !deletedIds.has(b.id))
        .map((b) => normalizeEntityImages(b, 'biz').item);

      if (normalized.length > 0) {
        const sorted = sortBusinesses(normalized);
        globalThis.__cachedBusinessesV1 = sorted;
        globalThis.__cachedBusinessesV1Time = now;
        writeBusinessesToFile(sorted);
        return sorted;
      }
    }
  } catch (err) {
    console.warn('Businesses system_settings fetch fallback:', err);
  }

  // 2. Fallback: local scratch file
  const fileBusinesses = readBusinessesFromFile().filter((b) => !deletedIds.has(b.id));
  if (fileBusinesses.length > 0) {
    const sorted = sortBusinesses(fileBusinesses);
    globalThis.__cachedBusinessesV1 = sorted;
    globalThis.__cachedBusinessesV1Time = now;
    setSystemSetting(BUSINESSES_SETTING_KEY, sorted).catch(() => null);
    return sorted;
  }

  // 3. Default initial store
  const initialFiltered = INITIAL_BUSINESSES_STORE.filter((b) => !deletedIds.has(b.id));
  const sortedInitial = sortBusinesses(initialFiltered);
  globalThis.__cachedBusinessesV1 = sortedInitial;
  globalThis.__cachedBusinessesV1Time = now;
  writeBusinessesToFile(sortedInitial);
  setSystemSetting(BUSINESSES_SETTING_KEY, sortedInitial).catch(() => null);
  return sortedInitial;
}

export async function getBusinessBySlug(slug: string): Promise<BusinessItem | null> {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

  const businesses = await getAllBusinesses();
  const found = businesses.find(
    (b) =>
      b.slug.toLowerCase() === cleanSlug ||
      b.id.toLowerCase() === cleanSlug
  );
  return found || null;
}

export async function getRelatedBusinesses(business: BusinessItem, limit = 3): Promise<BusinessItem[]> {
  const businesses = await getAllBusinesses();
  const published = businesses.filter((b) => b.id !== business.id && b.status === 'PUBLISHED');

  const sameCategory = published.filter(
    (b) => b.category.toLowerCase() === business.category.toLowerCase()
  );
  const others = published.filter((b) => !sameCategory.some((sc) => sc.id === b.id));
  return [...sameCategory, ...others].slice(0, limit);
}

function parseNumericField(val: any, fallback: number | null = 0): number | null {
  if (val === undefined) return undefined as any;
  if (val === null || val === '') return fallback;
  if (typeof val === 'number') return Number.isFinite(val) ? val : fallback;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function saveBusiness(bizData: Partial<BusinessItem>): Promise<BusinessItem> {
  const currentBusinesses = await getAllBusinesses();
  const list = [...currentBusinesses];
  const now = new Date().toISOString();

  let existingIndex = -1;
  if (bizData.id) {
    existingIndex = list.findIndex((b) => b.id === bizData.id);
  }
  if (existingIndex === -1 && bizData.slug) {
    existingIndex = list.findIndex((b) => b.slug === bizData.slug);
  }

  const existing = existingIndex >= 0 ? list[existingIndex] : null;

  const title = (bizData.title || existing?.title || 'Untitled Business Listing').trim();
  const baseSlug =
    bizData.slug ||
    existing?.slug ||
    `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

  const askingPrice =
    bizData.askingPrice !== undefined
      ? (parseNumericField(bizData.askingPrice, 0) ?? 0)
      : (existing?.askingPrice ?? 0);

  const downPayment =
    bizData.downPayment !== undefined
      ? parseNumericField(bizData.downPayment, null)
      : (existing?.downPayment ?? null);

  const sellersDiscretionaryEarnings =
    bizData.sellersDiscretionaryEarnings !== undefined
      ? parseNumericField(bizData.sellersDiscretionaryEarnings, null)
      : (existing?.sellersDiscretionaryEarnings ?? null);

  const grossRevenue =
    bizData.grossRevenue !== undefined
      ? parseNumericField(bizData.grossRevenue, null)
      : (existing?.grossRevenue ?? null);

  const inventoryValue =
    bizData.inventoryValue !== undefined
      ? parseNumericField(bizData.inventoryValue, null)
      : (existing?.inventoryValue ?? null);

  let highlights: string[] = existing?.highlights || [];
  if (Array.isArray(bizData.highlights)) {
    highlights = bizData.highlights.map((h) => String(h).trim()).filter(Boolean);
  } else if (typeof (bizData as any).highlightsText === 'string') {
    highlights = (bizData as any).highlightsText
      .split('\n')
      .map((h: string) => h.trim())
      .filter(Boolean);
  }

  const imageUrl =
    bizData.imageUrl !== undefined
      ? bizData.imageUrl
      : (existing?.imageUrl || '');

  const galleryUrls =
    Array.isArray(bizData.galleryUrls)
      ? bizData.galleryUrls.filter(Boolean)
      : (existing?.galleryUrls || (imageUrl ? [imageUrl] : []));

  const isFav =
    bizData.isFavourite !== undefined
      ? Boolean(bizData.isFavourite)
      : (existing?.isFavourite ?? false);

  const featured =
    bizData.featured !== undefined
      ? Boolean(bizData.featured)
      : (existing?.featured ?? isFav);

  const newBusiness: BusinessItem = normalizeEntityImages(
    {
      id: bizData.id || existing?.id || `biz-${Date.now()}`,
      title,
      slug: baseSlug,
      category: (bizData.category || existing?.category || 'Real Property Rltd').trim(),
      summary:
        bizData.summary !== undefined
          ? bizData.summary
          : (existing?.summary || ''),
      description:
        bizData.description !== undefined
          ? bizData.description
          : (existing?.description || ''),
      location:
        bizData.location !== undefined
          ? bizData.location
          : (existing?.location || 'Accra Metropolitan, Greater Accra Region'),
      city:
        bizData.city !== undefined
          ? bizData.city
          : (existing?.city || 'Accra'),
      region:
        bizData.region !== undefined
          ? bizData.region
          : (existing?.region || 'Greater Accra Region'),
      askingPrice,
      downPayment,
      sellersDiscretionaryEarnings,
      grossRevenue,
      inventoryValue,
      currency: bizData.currency || existing?.currency || 'USD',
      establishedYear:
        bizData.establishedYear !== undefined
          ? bizData.establishedYear
          : (existing?.establishedYear || ''),
      employees:
        bizData.employees !== undefined
          ? bizData.employees
          : (existing?.employees || ''),
      realEstateIncluded:
        bizData.realEstateIncluded !== undefined
          ? bizData.realEstateIncluded
          : (existing?.realEstateIncluded || 'Real Property Included'),
      reasonForSelling:
        bizData.reasonForSelling !== undefined
          ? bizData.reasonForSelling
          : (existing?.reasonForSelling || ''),
      facilitiesOverview:
        bizData.facilitiesOverview !== undefined
          ? bizData.facilitiesOverview
          : (existing?.facilitiesOverview || ''),
      growthOpportunities:
        bizData.growthOpportunities !== undefined
          ? bizData.growthOpportunities
          : (existing?.growthOpportunities || ''),
      supportAndTraining:
        bizData.supportAndTraining !== undefined
          ? bizData.supportAndTraining
          : (existing?.supportAndTraining || ''),
      highlights,
      imageUrl,
      galleryUrls,
      status: bizData.status || existing?.status || 'PUBLISHED',
      featured,
      isFavourite: isFav,
      ownerName:
        bizData.ownerName !== undefined
          ? bizData.ownerName
          : (existing?.ownerName || ''),
      ownerPhone:
        bizData.ownerPhone !== undefined
          ? bizData.ownerPhone
          : (existing?.ownerPhone || ''),
      ownerEmail:
        bizData.ownerEmail !== undefined
          ? bizData.ownerEmail
          : (existing?.ownerEmail || ''),
      ownerNotes:
        bizData.ownerNotes !== undefined
          ? bizData.ownerNotes
          : (existing?.ownerNotes || ''),
      sourceUrl:
        bizData.sourceUrl !== undefined
          ? bizData.sourceUrl
          : (existing?.sourceUrl || ''),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    },
    'biz'
  ).item;

  if (existingIndex >= 0) {
    list[existingIndex] = { ...list[existingIndex], ...newBusiness };
  } else {
    list.unshift(newBusiness);
  }

  const sorted = sortBusinesses(list);
  globalThis.__cachedBusinessesV1 = sorted;
  globalThis.__cachedBusinessesV1Time = Date.now();
  writeBusinessesToFile(sorted);
  await setSystemSetting(BUSINESSES_SETTING_KEY, sorted).catch(() => null);

  if (newBusiness.id) {
    await removeDeletedBusinessId(newBusiness.id);
  }

  return newBusiness;
}

export async function deleteBusiness(id: string): Promise<boolean> {
  const currentBusinesses = await getAllBusinesses();
  const updated = currentBusinesses.filter((b) => b.id !== id);

  globalThis.__cachedBusinessesV1 = updated;
  globalThis.__cachedBusinessesV1Time = Date.now();
  writeBusinessesToFile(updated);

  await addDeletedBusinessId(id);
  await setSystemSetting(BUSINESSES_SETTING_KEY, updated).catch(() => null);
  return true;
}

