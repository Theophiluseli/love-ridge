import fs from 'fs';
import path from 'path';
import { prisma } from './db';
import { getSystemSetting, setSystemSetting } from './system-settings';
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

function getInitialWarmProducts(): ProductItem[] {
  try {
    const file = readProductsFromFile();
    if (Array.isArray(file) && file.length > 0) return file;
  } catch (e) {}
  return INITIAL_PRODUCTS_STORE;
}

// In-memory instant cache for high-speed page loads (30 seconds, invalidated instantly on mutations)
let cachedProducts: ProductItem[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds high-speed cache

export function invalidateProductsCache() {
  cachedProducts = null;
  cacheTime = 0;
}

export async function getProductBySlug(slug: string): Promise<ProductItem | null> {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const products = await getAllProducts();
  return (
    products.find(
      (p) =>
        p.slug.toLowerCase() === cleanSlug ||
        p.id.toLowerCase() === cleanSlug
    ) || null
  );
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
  if (cachedProducts && cachedProducts.length > 0 && now - cacheTime < CACHE_DURATION) {
    return cachedProducts;
  }

  // 1 & 2: Read from system_settings and prisma concurrently for 2x faster performance
  let dbCatalog: ProductItem[] = [];
  let prismaProducts: ProductItem[] = [];

  try {
    const [settingRes, rawDbProds] = await Promise.all([
      getSystemSetting<ProductItem[]>('products_catalog', INITIAL_PRODUCTS_STORE).catch((e) => {
        console.warn('Could not read products from system_settings:', e);
        return { data: [], isDefault: true };
      }),
      Promise.race([
        prisma.product.findMany({
          include: { category: true },
          orderBy: { createdAt: 'desc' },
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
      ]).catch((e) => {
        console.warn('Could not read products from prisma:', e);
        return null;
      }),
    ]);

    if (!settingRes.isDefault && Array.isArray(settingRes.data) && settingRes.data.length > 0) {
      dbCatalog = settingRes.data;
    }

    if (rawDbProds && Array.isArray(rawDbProds) && rawDbProds.length > 0) {
      prismaProducts = rawDbProds.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: p.categoryId,
        category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
        sku: p.sku,
        referenceUrl: (p as any).referenceUrl || '',
        price: p.price,
        priceCny: (p as any).priceCny || Math.round(p.price * 0.47),
        currency: p.currency,
        unit: p.unit,
        stockQuantity: p.stockQuantity,
        stockStatus: p.stockStatus,
        originCountry: p.originCountry,
        moq: p.moq,
        status: p.status,
        featured: p.featured,
        imageUrl: p.imageUrl || null,
        galleryUrls: (p as any).galleryUrls || (p.imageUrl ? [p.imageUrl] : []),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));
    }
  } catch (err) {
    // Database transiently slow or unavailable
  }

  // 3. Read from local scratch file
  const fileProducts = readProductsFromFile();

  // 4. Merge all sources
  const map = new Map<string, ProductItem>();
  for (const p of INITIAL_PRODUCTS_STORE) {
    if (p.id) map.set(p.id, p);
  }
  for (const p of fileProducts) {
    if (p.id) map.set(p.id, { ...map.get(p.id), ...p });
  }
  for (const p of dbCatalog) {
    if (p.id) map.set(p.id, { ...map.get(p.id), ...p });
  }
  for (const p of prismaProducts) {
    if (p.id) {
      const existing = map.get(p.id) || ({} as any);
      map.set(p.id, {
        ...existing,
        ...p,
        category: p.category || existing.category,
        galleryUrls: (p as any).galleryUrls && (p as any).galleryUrls.length > 0 ? (p as any).galleryUrls : existing.galleryUrls || (p.imageUrl ? [p.imageUrl] : []),
      });
    }
  }

  const mergedList = Array.from(map.values());
  if (mergedList.length === 0) {
    return INITIAL_PRODUCTS_STORE;
  }

  // Sort: Favourites come first (max 3), then by newest creation date
  mergedList.sort((a, b) => {
    const aFav = a.isFavourite ? 1 : 0;
    const bFav = b.isFavourite ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  cachedProducts = mergedList;
  cacheTime = now;

  // Background sync if sources differed
  if (mergedList.length > dbCatalog.length || mergedList.length > fileProducts.length) {
    setSystemSetting('products_catalog', mergedList).catch(() => null);
    writeProductsToFile(mergedList);
  }

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

  // 1. In-memory cache update immediately
  cachedProducts = fileProducts;
  cacheTime = Date.now();

  // 2. Local file write synchronously
  writeProductsToFile(fileProducts);

  // 3. Save to PostgreSQL system_settings table
  setSystemSetting('products_catalog', fileProducts).catch((err) => {
    console.error('Failed writing products to system_settings:', err);
  });

  // 4. Synchronously upsert in Prisma database
  try {
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@loveridge.com' },
      select: { id: true },
    });
    const defaultUserId = adminUser?.id || '1ee92fa7-a3b4-4841-bc10-22e26a3d9fef';

    // Verify category exists in DB, fallback to cat-doors if needed
    let dbCategoryId = categoryId;
    const catCheck = await prisma.productCategory.findUnique({ where: { id: categoryId } }).catch(() => null);
    if (!catCheck) {
      dbCategoryId = 'cat-doors';
    }

    await prisma.product.upsert({
      where: { id: newProduct.id },
      create: {
        id: newProduct.id,
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        category: { connect: { id: dbCategoryId } },
        createdBy: { connect: { id: defaultUserId } },
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
      update: {
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        category: { connect: { id: dbCategoryId } },
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
    }).catch((prismaErr) => {
      console.warn('Prisma product upsert note:', prismaErr?.message || prismaErr);
    });
  } catch (e) {
    // Database background sync note
  }

  return newProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const currentProducts = await getAllProducts();
  const updated = currentProducts.filter((p) => p.id !== id);

  cachedProducts = updated;
  cacheTime = Date.now();

  writeProductsToFile(updated);
  setSystemSetting('products_catalog', updated).catch(() => null);

  try {
    await prisma.product.delete({ where: { id } }).catch(() => null);
  } catch (e) {
    // Ignore error
  }
  return true;
}
