import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function withPgbouncerIfNeeded(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const isSupabasePooler = url.includes("pooler.supabase.com");
  const hasPgbouncer = /(?:\?|&)pgbouncer=true(?:&|$)/i.test(url);
  if (!isSupabasePooler || hasPgbouncer) return url;
  return `${url}${url.includes("?") ? "&" : "?"}pgbouncer=true`;
}

const datasourceUrl = withPgbouncerIfNeeded(process.env.DATABASE_URL);

const prismaClient = new PrismaClient(
  datasourceUrl
    ? {
        datasources: {
          db: { url: datasourceUrl },
        },
      }
    : undefined
);

export const prisma = globalForPrisma.prisma || prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
