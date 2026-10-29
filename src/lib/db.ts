import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma_v2: PrismaClient | undefined;
};

function getOptimizedDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.searchParams.get('connection_limit') === '1') {
      parsed.searchParams.set('connection_limit', '10');
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '20');
    }
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

const datasourceUrl = getOptimizedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma_v2 ??
  new PrismaClient(datasourceUrl ? { datasources: { db: { url: datasourceUrl } } } : undefined);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma_v2 = prisma;
}
