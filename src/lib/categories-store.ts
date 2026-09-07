import fs from 'fs';
import path from 'path';
import { prisma } from './db';
import { getSystemSetting, setSystemSetting } from './system-settings';
import { ProductCategory, INITIAL_CATEGORIES_STORE } from './products-constants';
import { getAllProducts, saveProduct } from './products-store';

export type { ProductCategory };

export interface CategoryWithCount extends ProductCategory {
  productCount: number;
}

const FILE_PATH = path.join(process.cwd(), 'scratch', 'categories.json');

// Standard default categories with persistent IDs and slugs
export const DEFAULT_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-doors',
    name: 'Doors & Smart Locks',
    slug: 'doors-and-smart-locks',
    description: 'Smart locks, biometric systems, and luxury entrance doors',
  },
  {
    id: 'cat-lights',
    name: 'Solar Lighting & CCTV',
    slug: 'solar-lighting-and-cctv',
    description: 'Solar street lights, security floodlights, and CCTV monitoring',
  },
  {
    id: 'cat-machinery',
    name: 'Construction Equipment',
    slug: 'construction-equipment',
    description: 'Block machines, concrete mixers, and heavy site machinery',
  },
  {
    id: '9f7fa387-f68b-4519-9aab-3a16a400713b', // matches existing DB ID for Building Materials
    name: 'Building Materials',
    slug: 'building-materials',
    description: 'High-grade architectural, finishing, and structural building supplies',
  },
  {
    id: 'f651a8f7-cae2-4d29-a642-af09a8c9baaf', // matches existing DB ID for Tiles
    name: 'Tiles & Marble Slabs',
    slug: 'tiles-marble-slabs',
    description: 'Porcelain floor tiles, wall cladding, and natural stone marble slabs',
  },
  {
    id: '873c6e30-96e5-4ef2-a100-d2e2c841a50a', // matches existing DB ID for Tools
    name: 'Tools & Equipment',
    slug: 'tools-equipment',
    description: 'Professional power tools, cordless drills, and jobsite hardware',
  },
];

function ensureFile() {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_CATEGORIES, null, 2), 'utf-8');
    }
  } catch (err) {
    // Fail silently in read-only environments
  }
}

export function readCategoriesFromFile(): ProductCategory[] {
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
    // Return default on error
  }
  return DEFAULT_CATEGORIES;
}

export function writeCategoriesToFile(categories: ProductCategory[]) {
  ensureFile();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (err) {
    // Ignore error
  }
}

// In-memory instant cache for blazing fast reads (<2ms)
let cachedCategories: ProductCategory[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Retrieves all categories with live calculated product counts.
 */
export async function getAllCategories(includeCounts = false): Promise<CategoryWithCount[]> {
  const now = Date.now();
  let categories: ProductCategory[] = [];

  if (cachedCategories && now - cacheTime < CACHE_DURATION) {
    categories = cachedCategories;
  } else {
    // 1. Check PostgreSQL system_settings cloud catalog first
    try {
      const { data: dbCategories, isDefault } = await getSystemSetting<ProductCategory[]>(
        'categories_catalog',
        DEFAULT_CATEGORIES
      );
      if (!isDefault && Array.isArray(dbCategories) && dbCategories.length > 0) {
        categories = dbCategories;
      }
    } catch (e) {
      console.warn('Could not read categories from system_settings:', e);
    }

    // 2. Fall back to file/default if needed
    if (categories.length === 0) {
      categories = readCategoriesFromFile();
    }

    // 3. Sync to Prisma product_categories table in background
    (async () => {
      try {
        for (const cat of categories) {
          await prisma.productCategory.upsert({
            where: { id: cat.id },
            update: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description || null,
            },
            create: {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description || null,
            },
          }).catch(() => null);
        }
      } catch (err) {
        // Ignore background sync errors
      }
    })();

    cachedCategories = categories;
    cacheTime = now;
  }

  // Calculate live product counts for each category
  try {
    const products = await getAllProducts();
    const countMap: Record<string, number> = {};

    products.forEach((p) => {
      const catId = p.categoryId || '';
      const catSlug = p.category?.slug || '';
      const catName = p.category?.name?.toLowerCase() || '';

      countMap[catId] = (countMap[catId] || 0) + 1;
      if (catSlug) countMap[catSlug] = (countMap[catSlug] || 0) + 1;
      if (catName) countMap[catName] = (countMap[catName] || 0) + 1;
    });

    return categories.map((cat) => {
      const idCount = countMap[cat.id] || 0;
      const slugCount = countMap[cat.slug] || 0;
      const nameCount = countMap[cat.name.toLowerCase()] || 0;
      const productCount = Math.max(idCount, slugCount, nameCount);

      return {
        ...cat,
        productCount,
      };
    });
  } catch (err) {
    return categories.map((c) => ({ ...c, productCount: 0 }));
  }
}

/**
 * Creates or updates a category.
 */
export async function saveCategory(categoryData: Partial<ProductCategory>): Promise<ProductCategory> {
  const currentCategories = await getAllCategories();
  const list: ProductCategory[] = currentCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.imageUrl,
  }));

  const now = new Date().toISOString();
  const name = (categoryData.name || '').trim();
  if (!name) {
    throw new Error('Category name is required.');
  }

  let slug = categoryData.slug ? slugify(categoryData.slug) : slugify(name);
  if (!slug) slug = `category-${Date.now()}`;

  let existingIndex = -1;
  if (categoryData.id) {
    existingIndex = list.findIndex((c) => c.id === categoryData.id);
  }
  if (existingIndex === -1) {
    existingIndex = list.findIndex((c) => c.slug === slug);
  }

  const id = categoryData.id || (existingIndex >= 0 ? list[existingIndex].id : `cat-${slug}`);

  const updatedCategory: ProductCategory = {
    id,
    name,
    slug,
    description: categoryData.description || '',
    imageUrl: categoryData.imageUrl || '',
  };

  const oldCategory = existingIndex >= 0 ? list[existingIndex] : null;

  if (existingIndex >= 0) {
    list[existingIndex] = updatedCategory;
  } else {
    list.push(updatedCategory);
  }

  // 1. Update in PostgreSQL system_settings
  await setSystemSetting('categories_catalog', list);

  // 2. Write to local file backup
  writeCategoriesToFile(list);

  // 3. Update in-memory cache
  cachedCategories = list;
  cacheTime = Date.now();

  // 4. Background sync to Prisma productCategory table
  (async () => {
    try {
      await prisma.productCategory.upsert({
        where: { id },
        update: {
          name: updatedCategory.name,
          slug: updatedCategory.slug,
          description: updatedCategory.description || null,
        },
        create: {
          id,
          name: updatedCategory.name,
          slug: updatedCategory.slug,
          description: updatedCategory.description || null,
        },
      }).catch(() => null);

      // If category name or slug changed, sync all products referencing this category
      if (oldCategory && (oldCategory.name !== updatedCategory.name || oldCategory.slug !== updatedCategory.slug)) {
        const products = await getAllProducts();
        let changed = false;
        for (const p of products) {
          if (p.categoryId === id || p.category?.slug === oldCategory.slug) {
            await saveProduct({
              ...p,
              categoryId: id,
              category: {
                id,
                name: updatedCategory.name,
                slug: updatedCategory.slug,
              },
            });
            changed = true;
          }
        }
      }
    } catch (e) {
      console.warn('Background category Prisma/product sync error:', e);
    }
  })();

  return updatedCategory;
}

/**
 * Deletes a category by id.
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; affectedProductsCount: number }> {
  const currentCategories = await getAllCategories();
  const list = currentCategories.filter((c) => c.id !== id);

  // Check how many products belong to this category
  let affectedProductsCount = 0;
  try {
    const products = await getAllProducts();
    const affected = products.filter((p) => p.categoryId === id);
    affectedProductsCount = affected.length;
  } catch (err) {
    // Ignore error
  }

  // 1. Update system_settings
  await setSystemSetting('categories_catalog', list);

  // 2. Update local file
  writeCategoriesToFile(list);

  // 3. Invalidate cache
  cachedCategories = list;
  cacheTime = Date.now();

  // 4. Background Prisma deletion
  (async () => {
    try {
      await prisma.productCategory.delete({ where: { id } }).catch(() => null);
    } catch (e) {
      // Ignore background delete errors
    }
  })();

  return { success: true, affectedProductsCount };
}
