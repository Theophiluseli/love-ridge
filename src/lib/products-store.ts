import fs from 'fs';
import path from 'path';
import { prisma } from './db';
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

// In-memory instant cache for blazing fast API responses (<10ms)
let cachedProducts: ProductItem[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export async function getAllProducts(): Promise<ProductItem[]> {
  const now = Date.now();
  if (cachedProducts && now - cacheTime < CACHE_DURATION) {
    return cachedProducts;
  }

  const fileProducts = readProductsFromFile();

  try {
    // Attempt database fetch with timeout to prevent slow cold starts
    const dbPromise = prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
    const dbProducts = await Promise.race([dbPromise, timeoutPromise]);

    if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
      const dbMapped: ProductItem[] = dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: p.categoryId,
        category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
        sku: p.sku,
        price: p.price,
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

      const dbIds = new Set(dbMapped.map((p) => p.id));
      const missing = fileProducts.filter((p) => !dbIds.has(p.id));
      const merged = [...dbMapped, ...missing];
      cachedProducts = merged;
      cacheTime = now;
      return merged;
    }
  } catch (err) {
    // Database slow or unavailable, proceed immediately with file/initial products
  }

  cachedProducts = fileProducts;
  cacheTime = now;
  return fileProducts;
}

export async function saveProduct(prodData: Partial<ProductItem>): Promise<ProductItem> {
  const fileProducts = readProductsFromFile();
  const now = new Date().toISOString();

  let existingIndex = -1;
  if (prodData.id) {
    existingIndex = fileProducts.findIndex((p) => p.id === prodData.id);
  }

  const categoryName = prodData.category?.name || 
    INITIAL_CATEGORIES_STORE.find(c => c.id === prodData.categoryId)?.name || 
    'Tools & Construction';

  const newProduct: ProductItem = {
    id: prodData.id || `prod-${Date.now()}`,
    name: prodData.name || 'Untitled Product',
    slug: prodData.slug || ((prodData.name || 'prod').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4)),
    description: prodData.description || '',
    categoryId: prodData.categoryId || 'cat-1',
    category: {
      id: prodData.categoryId || 'cat-1',
      name: categoryName,
    },
    sku: prodData.sku || `SKU-${Date.now().toString().slice(-6)}`,
    price: typeof prodData.price === 'number' ? prodData.price : parseFloat(prodData.price as any) || 0,
    currency: prodData.currency || 'GHS',
    unit: prodData.unit || 'per piece',
    stockQuantity: typeof prodData.stockQuantity === 'number' ? prodData.stockQuantity : parseInt(prodData.stockQuantity as any) || 0,
    stockStatus: prodData.stockStatus || 'IN_STOCK',
    originCountry: prodData.originCountry || 'China',
    moq: typeof prodData.moq === 'number' ? prodData.moq : parseInt(prodData.moq as any) || 1,
    status: prodData.status || 'PUBLISHED',
    featured: Boolean(prodData.featured),
    imageUrl: prodData.imageUrl || '/product_tiles.png',
    galleryUrls: Array.isArray(prodData.galleryUrls) ? prodData.galleryUrls : (prodData.imageUrl ? [prodData.imageUrl] : []),
    createdAt: existingIndex >= 0 ? fileProducts[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    fileProducts[existingIndex] = { ...fileProducts[existingIndex], ...newProduct };
  } else {
    fileProducts.unshift(newProduct);
  }

  writeProductsToFile(fileProducts);
  cachedProducts = fileProducts;
  cacheTime = Date.now();

  // Async Prisma save in background without blocking response
  (async () => {
    try {
      if (prodData.id) {
        await prisma.product.update({
          where: { id: prodData.id },
          data: {
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            stockQuantity: newProduct.stockQuantity,
            stockStatus: newProduct.stockStatus,
            status: newProduct.status,
            featured: newProduct.featured,
            imageUrl: newProduct.imageUrl,
          },
        }).catch(() => null);
      }
    } catch (e) {
      // Ignore background sync error
    }
  })();

  return newProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const fileProducts = readProductsFromFile();
  const updated = fileProducts.filter((p) => p.id !== id);
  writeProductsToFile(updated);
  cachedProducts = updated;
  cacheTime = Date.now();

  try {
    await prisma.product.delete({ where: { id } }).catch(() => null);
  } catch (e) {
    // Ignore error
  }
  return true;
}
