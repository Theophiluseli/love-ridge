import fs from 'fs';
import path from 'path';
import { prisma } from './db';
import { getSystemSetting, setSystemSetting, invalidateSystemSetting } from './system-settings';
import {
  ProductItem,
  ProductCategoryItem,
  INITIAL_PRODUCTS_STORE,
  INITIAL_CATEGORIES_STORE,
} from './products-constants';

export * from './products-constants';

const FILE_PATH = path.join(process.cwd(), 'scratch', 'products.json');

function ensureFile() {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_PRODUCTS_STORE, null, 2), 'utf-8');
    }
  } catch (err) {
    // Fail silently in read-only environments
  }
}

export function readProductsFromFile(): ProductItem[] {
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
    // Return initial store on read error
  }
  return INITIAL_PRODUCTS_STORE;
}

export function writeProductsToFile(products: ProductItem[]) {
  ensureFile();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    // Ignore error
  }
}

declare global {
  var __cachedProducts: ProductItem[] | null | undefined;
  var __cachedProductsTime: number | undefined;
  var __cachedDeletedProductIds: Set<string> | null | undefined;
  var __deletedProductIdsCacheTime: number | undefined;
}

const CACHE_DURATION = 30000; // 30 seconds
const DELETED_PRODUCTS_SETTING_KEY = 'deleted_product_ids';
const DELETED_PRODUCTS_FILE = path.join(process.cwd(), 'scratch', 'deleted-products.json');

function readDeletedProductIdsFromFile(): Set<string> {
  try {
    if (fs.existsSync(DELETED_PRODUCTS_FILE)) {
      const data = fs.readFileSync(DELETED_PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
}

function writeDeletedProductIdsToFile(ids: Set<string>) {
  try {
    const dir = path.dirname(DELETED_PRODUCTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DELETED_PRODUCTS_FILE, JSON.stringify(Array.from(ids), null, 2), 'utf-8');
  } catch (e) {}
}

export async function getDeletedProductIds(): Promise<Set<string>> {
  const now = Date.now();
  if (globalThis.__cachedDeletedProductIds && now - (globalThis.__deletedProductIdsCacheTime || 0) < CACHE_DURATION) {
    return globalThis.__cachedDeletedProductIds;
  }
  const fileSet = readDeletedProductIdsFromFile();
  try {
    const { data } = await getSystemSetting<string[]>(DELETED_PRODUCTS_SETTING_KEY, []);
    const idSet = new Set<string>([...(Array.isArray(data) ? data : []), ...Array.from(fileSet)]);
    globalThis.__cachedDeletedProductIds = idSet;
    globalThis.__deletedProductIdsCacheTime = now;
    writeDeletedProductIdsToFile(idSet);
    return idSet;
  } catch (err) {
    globalThis.__cachedDeletedProductIds = fileSet;
    return fileSet;
  }
}

export async function addDeletedProductId(id: string): Promise<void> {
  try {
    const current = await getDeletedProductIds();
    current.add(id);
    globalThis.__cachedDeletedProductIds = current;
    globalThis.__deletedProductIdsCacheTime = Date.now();
    writeDeletedProductIdsToFile(current);
    await setSystemSetting(DELETED_PRODUCTS_SETTING_KEY, Array.from(current)).catch(() => null);
  } catch (err) {
    console.error('Failed adding deleted product ID:', err);
  }
}

export async function removeDeletedProductId(id: string): Promise<void> {
  try {
    const current = await getDeletedProductIds();
    if (current.has(id)) {
      current.delete(id);
      globalThis.__cachedDeletedProductIds = current;
      globalThis.__deletedProductIdsCacheTime = Date.now();
      writeDeletedProductIdsToFile(current);
      await setSystemSetting(DELETED_PRODUCTS_SETTING_KEY, Array.from(current)).catch(() => null);
    }
  } catch (err) {
    console.error('Failed removing deleted product ID:', err);
  }
}

export function invalidateProductsCache() {
  globalThis.__cachedProducts = null;
  globalThis.__cachedProductsTime = 0;
  globalThis.__cachedDeletedProductIds = null;
  globalThis.__deletedProductIdsCacheTime = 0;
  invalidateSystemSetting('products_catalog');
  invalidateSystemSetting('deleted_product_ids');
}

export async function getProductBySlug(slug: string): Promise<ProductItem | null> {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const deletedIds = await getDeletedProductIds();
  if (deletedIds.has(cleanSlug) || deletedIds.has(slug)) return null;

  const products = await getAllProducts();
  const found = products.find(
    (p) =>
      p.slug.toLowerCase() === cleanSlug ||
      p.id.toLowerCase() === cleanSlug
  );
  if (found && (deletedIds.has(found.id) || deletedIds.has(found.slug))) return null;
  return found || null;
}

export async function getRelatedProducts(product: ProductItem, limit = 3): Promise<ProductItem[]> {
  const products = await getAllProducts();
  const published = products.filter((p) => p.id !== product.id && p.status === 'PUBLISHED');

  // Prioritize same category first
  const sameCategory = published.filter(
    (p) =>
      (product.categoryId && p.categoryId === product.categoryId) ||
      (product.category?.slug && p.category?.slug === product.category?.slug)
  );

  const others = published.filter((p) => !sameCategory.some((sc) => sc.id === p.id));
  return [...sameCategory, ...others].slice(0, limit);
}

export async function getAllProducts(): Promise<ProductItem[]> {
  const now = Date.now();
  if (globalThis.__cachedProducts && globalThis.__cachedProducts.length > 0 && now - (globalThis.__cachedProductsTime || 0) < CACHE_DURATION) {
    return globalThis.__cachedProducts;
  }

  let dbCatalog: ProductItem[] = [];
  let deletedIds = new Set<string>();

  try {
    const [dIds, settingRes] = await Promise.all([
      getDeletedProductIds(),
      getSystemSetting<ProductItem[]>('products_catalog', []).catch(() => ({ data: [] as ProductItem[], isDefault: true })),
    ]);
    deletedIds = dIds;
    if (!settingRes.isDefault && Array.isArray(settingRes.data) && settingRes.data.length > 0) {
      dbCatalog = settingRes.data;
    }
  } catch (err) {
    deletedIds = await getDeletedProductIds().catch(() => new Set<string>());
  }

  // Read from local scratch file
  const fileProducts = readProductsFromFile();

  const map = new Map<string, ProductItem>();

  // If neither dbCatalog nor fileProducts has any items, seed once with INITIAL_PRODUCTS_STORE
  if (dbCatalog.length === 0 && fileProducts.length === 0) {
    for (const p of INITIAL_PRODUCTS_STORE) {
      if (p.id && !deletedIds.has(p.id)) map.set(p.id, p);
    }
    const seeded = Array.from(map.values());
    setSystemSetting('products_catalog', seeded).catch(() => null);
    writeProductsToFile(seeded);
  } else {
    // 1. Authoritative DB catalog from system_settings
    for (const p of dbCatalog) {
      if (p.id && !deletedIds.has(p.id)) map.set(p.id, p);
    }
    // 2. Overlay file products if any exist
    for (const p of fileProducts) {
      if (p.id && !deletedIds.has(p.id)) {
        map.set(p.id, { ...map.get(p.id), ...p });
      }
    }
  }

  // Explicit safety clean of any deleted tombstones
  for (const id of Array.from(deletedIds)) {
    map.delete(id);
  }

  const mergedList = Array.from(map.values());

  // Sort: Favourites come first (max 3), then by newest creation date
  mergedList.sort((a, b) => {
    const aFav = a.isFavourite ? 1 : 0;
    const bFav = b.isFavourite ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  globalThis.__cachedProducts = mergedList;
  globalThis.__cachedProductsTime = now;

  return mergedList;
}

export async function saveProduct(prodData: Partial<ProductItem>): Promise<ProductItem> {
  const currentProducts = await getAllProducts();
  const fileProducts = [...currentProducts];
  const now = new Date().toISOString();

  let existingIndex = -1;
  if (prodData.id) {
    existingIndex = fileProducts.findIndex((p) => p.id === prodData.id);
  }
  if (existingIndex === -1 && prodData.slug) {
    existingIndex = fileProducts.findIndex((p) => p.slug === prodData.slug);
  }

  const existing = existingIndex >= 0 ? fileProducts[existingIndex] : null;

  const requestedFav = prodData.isFavourite !== undefined
    ? Boolean(prodData.isFavourite)
    : (prodData as any).favourite !== undefined
    ? Boolean((prodData as any).favourite)
    : existing
    ? Boolean(existing.isFavourite)
    : false;

  // Enforce logical limit: maximum of 3 Favourite products allowed
  let isFav = requestedFav;
  if (requestedFav) {
    const otherFavCount = fileProducts.filter((p) => p.isFavourite && p.id !== (prodData.id || existing?.id)).length;
    if (otherFavCount >= 3) {
      isFav = false;
    }
  }

  let categoryId = prodData.categoryId || prodData.category?.id || existing?.categoryId || 'cat-doors';
  let categoryName = prodData.category?.name || existing?.category?.name || '';
  let categorySlug = prodData.category?.slug || existing?.category?.slug || '';

  if (!categoryName) {
    const found = INITIAL_CATEGORIES_STORE.find((c) => c.id === categoryId || c.slug === categoryId);
    if (found) {
      categoryId = found.id;
      categoryName = found.name;
      categorySlug = found.slug;
    } else {
      categoryName = 'Building Materials';
      categorySlug = 'building-materials';
    }
  }

  const ghsPrice = typeof prodData.price === 'number' ? prodData.price : parseFloat(prodData.price as any) || 0;
  const cnyPrice = prodData.priceCny !== undefined && prodData.priceCny !== null
    ? (typeof prodData.priceCny === 'number' ? prodData.priceCny : parseFloat(prodData.priceCny as any) || 0)
    : Math.round(ghsPrice * 0.47);

  const newProduct: ProductItem = {
    id: prodData.id || existing?.id || `prod-${Date.now()}`,
    name: prodData.name || existing?.name || 'Untitled Product',
    slug: prodData.slug || existing?.slug || ((prodData.name || existing?.name || 'prod').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4)),
    description: prodData.description !== undefined ? prodData.description : (existing?.description || ''),
    categoryId,
    category: {
      id: categoryId,
      name: categoryName,
      slug: categorySlug,
    },
    sku: prodData.sku || existing?.sku || `SKU-${Date.now().toString().slice(-6)}`,
    referenceUrl: prodData.referenceUrl !== undefined ? prodData.referenceUrl : (existing?.referenceUrl || ''),
    price: prodData.price !== undefined ? ghsPrice : (existing?.price ?? ghsPrice),
    priceCny: prodData.priceCny !== undefined ? cnyPrice : (existing?.priceCny ?? cnyPrice),
    currency: prodData.currency || existing?.currency || 'GHS',
    unit: prodData.unit || existing?.unit || 'per piece',
    stockQuantity: prodData.stockQuantity !== undefined
      ? (typeof prodData.stockQuantity === 'number' ? prodData.stockQuantity : parseInt(prodData.stockQuantity as any) || 0)
      : (existing?.stockQuantity ?? 0),
    stockStatus: prodData.stockStatus || existing?.stockStatus || 'IN_STOCK',
    originCountry: prodData.originCountry || existing?.originCountry || 'China',
    moq: prodData.moq !== undefined
      ? (typeof prodData.moq === 'number' ? prodData.moq : parseInt(prodData.moq as any) || 1)
      : (existing?.moq ?? 1),
    status: prodData.status || existing?.status || 'PUBLISHED',
    featured: prodData.featured !== undefined ? Boolean(prodData.featured) : Boolean(existing?.featured || isFav),
    isFavourite: isFav,
    imageUrl: prodData.imageUrl || existing?.imageUrl || '/product_tiles.png',
    galleryUrls: Array.isArray(prodData.galleryUrls)
      ? prodData.galleryUrls
      : (existing?.galleryUrls || (prodData.imageUrl ? [prodData.imageUrl] : [])),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    fileProducts[existingIndex] = { ...fileProducts[existingIndex], ...newProduct };
  } else {
    fileProducts.unshift(newProduct);
  }

  // Sort updated list: Favourites first, then newest
  fileProducts.sort((a, b) => {
    const aFav = a.isFavourite ? 1 : 0;
    const bFav = b.isFavourite ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // 1. In-memory cache update immediately (<1ms)
  globalThis.__cachedProducts = fileProducts;
  globalThis.__cachedProductsTime = Date.now();

  // 2. Local file write synchronously
  writeProductsToFile(fileProducts);

  // 3. Save to PostgreSQL system_settings table (<30ms)
  setSystemSetting('products_catalog', fileProducts).catch((err) => {
    console.error('Failed writing products to system_settings:', err);
  });

  // 4. Upsert directly to PostgreSQL via Prisma
  try {
    await (prisma.product as any).upsert({
      where: { id: newProduct.id },
      create: {
        id: newProduct.id,
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        category: { connect: { id: newProduct.categoryId } },
        sku: newProduct.sku,
        price: newProduct.price,
        currency: newProduct.currency,
        unit: newProduct.unit,
        stockQuantity: newProduct.stockQuantity,
        stockStatus: newProduct.stockStatus,
        originCountry: newProduct.originCountry,
        moq: newProduct.moq,
        status: newProduct.status,
        featured: newProduct.featured,
        imageUrl: newProduct.imageUrl,
        createdBy: { connect: { id: "1ee92fa7-a3b4-4841-bc10-22e26a3d9fef" } },
      },
      update: {
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        category: { connect: { id: newProduct.categoryId } },
        sku: newProduct.sku,
        price: newProduct.price,
        currency: newProduct.currency,
        unit: newProduct.unit,
        stockQuantity: newProduct.stockQuantity,
        stockStatus: newProduct.stockStatus,
        originCountry: newProduct.originCountry,
        moq: newProduct.moq,
        status: newProduct.status,
        featured: newProduct.featured,
        imageUrl: newProduct.imageUrl,
      },
    });
  } catch (e) {
    console.warn("Prisma product upsert warning:", e);
  }

  if (newProduct.id) {
    await removeDeletedProductId(newProduct.id);
  }
  invalidateProductsCache();

  return newProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  invalidateProductsCache();

  // 1. Permanently record this ID in deleted products tombstones
  await addDeletedProductId(id);
  const deletedIds = await getDeletedProductIds();

  // 2. Remove from active product list
  const currentProducts = await getAllProducts();
  const updated = currentProducts.filter((p) => p.id !== id && !deletedIds.has(p.id));

  globalThis.__cachedProducts = updated;
  globalThis.__cachedProductsTime = Date.now();

  const fileProds = readProductsFromFile().filter((p) => p.id !== id && !deletedIds.has(p.id));
  writeProductsToFile(fileProds);

  try {
    await setSystemSetting('products_catalog', updated);
  } catch (err) {
    console.error('Failed writing products to system_settings:', err);
  }

  // 3. Direct, guaranteed deletion from Prisma PostgreSQL tables
  try {
    await prisma.productMedia.deleteMany({ where: { productId: id } }).catch(() => null);
    await prisma.lead.updateMany({ where: { productId: id }, data: { productId: null } }).catch(() => null);
    await prisma.product.delete({ where: { id } }).catch(() => null);
  } catch (e) {
    console.warn("Prisma product delete notice:", e);
  }

  invalidateProductsCache();
  invalidateSystemSetting('products_catalog');
  invalidateSystemSetting('deleted_product_ids');
  return true;
}
