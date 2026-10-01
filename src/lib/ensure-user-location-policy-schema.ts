import { prisma } from '@/lib/prisma';

let schemaReady: Promise<void> | null = null;

export function ensureUserLocationPolicySchema() {
  if (!schemaReady) {
    schemaReady = prisma.$executeRaw`
      ALTER TABLE "User"
        ADD COLUMN IF NOT EXISTS "locationRequired" BOOLEAN NOT NULL DEFAULT FALSE
    `.then(() => undefined).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}
