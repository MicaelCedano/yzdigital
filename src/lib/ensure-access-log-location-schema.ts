import { prisma } from '@/lib/prisma';

let schemaReady: Promise<void> | null = null;

export function ensureAccessLogLocationSchema() {
  if (!schemaReady) {
    schemaReady = prisma.$executeRaw`
      ALTER TABLE "AccessLog"
        ADD COLUMN IF NOT EXISTS "locationCity" TEXT,
        ADD COLUMN IF NOT EXISTS "locationRegion" TEXT,
        ADD COLUMN IF NOT EXISTS "locationCountry" TEXT,
        ADD COLUMN IF NOT EXISTS "locationLatitude" TEXT,
        ADD COLUMN IF NOT EXISTS "locationLongitude" TEXT
    `.then(() => undefined).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}
