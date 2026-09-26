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
const DELETED_PRODUCTS_FILE = path.join(process.cwd(), 'scratch', 'deleted-products.json');
const DELETED_PRODUCTS_SETTING_KEY = 'deleted_product_ids';
const CACHE_DURATION = 30000; // 30 seconds

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
    // Return empty on error
  }
  return [];
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

  // Try in-memory or store first
  const products = await getAllProducts();
  const found = products.find(
    (p) =>
      p.slug.toLowerCase() === cleanSlug ||
      p.id.toLowerCase() === cleanSlug
  );
  if (found) return found;

  // Direct database query fallback
  try {
    const dbProd = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: { equals: cleanSlug, mode: 'insensitive' } },
          { id: cleanSlug }
        ]
      },
      include: {
        category: true,
      }
    });
    if (dbProd) {
      const ghsPrice = dbProd.price || 0;
      const cnyPrice = Math.round(ghsPrice * 0.47);
      return {
        id: dbProd.id,
        name: dbProd.name,
        slug: dbProd.slug,
        description: dbProd.description || '',
        categoryId: dbProd.categoryId,
        category: {
          id: dbProd.category?.id || dbProd.categoryId,
          name: dbProd.category?.name || 'Building Materials',
          slug: dbProd.category?.slug || 'building-materials',
        },
        sku: dbProd.sku,
        price: ghsPrice,
        priceCny: cnyPrice,
        currency: dbProd.currency || 'GHS',
        unit: dbProd.unit || 'per piece',
        stockQuantity: dbProd.stockQuantity || 0,
        stockStatus: dbProd.stockStatus || 'IN_STOCK',
        originCountry: dbProd.originCountry || 'China',
        moq: dbProd.moq || 1,
        status: dbProd.status || 'PUBLISHED',
        featured: Boolean(dbProd.featured),
        isFavourite: Boolean(dbProd.featured),
        imageUrl: dbProd.imageUrl || '/product_tiles.webp',
        galleryUrls: Array.isArray(dbProd.galleryUrls) && dbProd.galleryUrls.length > 0 ? dbProd.galleryUrls : [dbProd.imageUrl || '/product_tiles.webp'],
        createdAt: dbProd.createdAt ? new Date(dbProd.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: dbProd.updatedAt ? new Date(dbProd.updatedAt).toISOString() : new Date().toISOString(),
      };
    }
  } catch (e) {
    console.error('Direct getProductBySlug DB lookup error:', e);
  }

  return null;
}

export async function getRelatedProducts(product: ProductItem, limit = 3): Promise<ProductItem[]> {
  const products = await getAllProducts();
  const published = products.filter((p) => p.id !== product.id && p.status === 'PUBLISHED');

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
  if (
    globalThis.__cachedProducts &&
    globalThis.__cachedProducts.length > 0 &&
    now - (globalThis.__cachedProductsTime || 0) < CACHE_DURATION
  ) {
    return globalThis.__cachedProducts;
  }

  // 1. Authoritative primary source: Query Prisma PostgreSQL products table
  let prismaProducts: ProductItem[] = [];
  try {
    const pProds: any[] = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });

    if (pProds && pProds.length > 0) {
      prismaProducts = pProds.map((p: any) => {
        const ghsPrice = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
        const cnyPrice = Math.round(ghsPrice * 0.47);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          categoryId: p.categoryId,
          category: {
            id: p.category?.id || p.categoryId,
            name: p.category?.name || 'Building Materials',
            slug: p.category?.slug || 'building-materials',
          },
          sku: p.sku,
          price: ghsPrice,
          priceCny: cnyPrice,
          currency: p.currency || 'GHS',
          unit: p.unit || 'per piece',
          stockQuantity: p.stockQuantity || 0,
          stockStatus: p.stockStatus || 'IN_STOCK',
          originCountry: p.originCountry || 'China',
          moq: p.moq || 1,
          status: p.status || 'PUBLISHED',
          featured: Boolean(p.featured),
          isFavourite: Boolean(p.featured),
          imageUrl: p.imageUrl || '/product_tiles.webp',
          galleryUrls: Array.isArray(p.galleryUrls) && p.galleryUrls.length > 0 ? p.galleryUrls : [p.imageUrl || '/product_tiles.webp'],
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
        };
      });
    }
  } catch (err) {
    console.warn('Prisma product fetch notice, falling back to backup stores:', err);
  }

  // If Prisma successfully returned products, use them as authoritative
  if (prismaProducts.length > 0) {
    // Sort: Favourites first, then newest
    prismaProducts.sort((a, b) => {
      const aFav = a.isFavourite ? 1 : 0;
      const bFav = b.isFavourite ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    globalThis.__cachedProducts = prismaProducts;
    globalThis.__cachedProductsTime = now;
    writeProductsToFile(prismaProducts);
    setSystemSetting('products_catalog', prismaProducts).catch(() => null);
    return prismaProducts;
  }

  // 2. Backup source: system_settings table in PostgreSQL
  try {
    const settingRes = await getSystemSetting<ProductItem[]>('products_catalog', []);
    if (!settingRes.isDefault && Array.isArray(settingRes.data) && settingRes.data.length > 0) {
      globalThis.__cachedProducts = settingRes.data;
      globalThis.__cachedProductsTime = now;
      return settingRes.data;
    }
  } catch (e) {}

  // 3. Fallback: local scratch file or initial constant
  const fileProducts = readProductsFromFile();
  if (fileProducts.length > 0) {
    globalThis.__cachedProducts = fileProducts;
    globalThis.__cachedProductsTime = now;
    return fileProducts;
  }

  // 4. Default constant store
  globalThis.__cachedProducts = INITIAL_PRODUCTS_STORE;
  globalThis.__cachedProductsTime = now;
  return INITIAL_PRODUCTS_STORE;
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
    imageUrl: prodData.imageUrl || existing?.imageUrl || '/product_tiles.webp',
    galleryUrls: Array.isArray(prodData.galleryUrls) && prodData.galleryUrls.length > 0
      ? prodData.galleryUrls
      : (existing?.galleryUrls || (prodData.imageUrl ? [prodData.imageUrl] : ['/product_tiles.webp'])),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  // 1. Direct upsert into PostgreSQL via Prisma
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
        galleryUrls: newProduct.galleryUrls,
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
        galleryUrls: newProduct.galleryUrls,
      },
    });
  } catch (e) {
    console.warn("Prisma product upsert warning:", e);
  }

  // 2. Update memory cache and backup stores
  if (existingIndex >= 0) {
    fileProducts[existingIndex] = { ...fileProducts[existingIndex], ...newProduct };
  } else {
    fileProducts.unshift(newProduct);
  }

  fileProducts.sort((a, b) => {
    const aFav = a.isFavourite ? 1 : 0;
    const bFav = b.isFavourite ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  globalThis.__cachedProducts = fileProducts;
  globalThis.__cachedProductsTime = Date.now();
  writeProductsToFile(fileProducts);
  setSystemSetting('products_catalog', fileProducts).catch(() => null);

  if (newProduct.id) {
    await removeDeletedProductId(newProduct.id);
  }
  invalidateProductsCache();

  return newProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  invalidateProductsCache();

  // 1. Direct deletion from Prisma PostgreSQL tables
  try {
    await prisma.productMedia.deleteMany({ where: { productId: id } }).catch(() => null);
    await prisma.lead.updateMany({ where: { productId: id }, data: { productId: null } }).catch(() => null);
    await prisma.product.delete({ where: { id } }).catch(() => null);
  } catch (e) {
    console.warn("Prisma product delete notice:", e);
  }

  // 2. Remove from active memory list and backup stores
  const currentProducts = await getAllProducts();
  const updated = currentProducts.filter((p) => p.id !== id);

  globalThis.__cachedProducts = updated;
  globalThis.__cachedProductsTime = Date.now();
  writeProductsToFile(updated);
  setSystemSetting('products_catalog', updated).catch(() => null);

  invalidateProductsCache();
  return true;
}
