import { PrismaClient } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });
}

export const prisma =
  globalForPrisma.prisma ??
  createPrisma();

if (process.env.NODE_ENV !== "production" && !globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
