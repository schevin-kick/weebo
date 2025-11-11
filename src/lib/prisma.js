import { PrismaClient } from '@prisma/client';

// Prisma Client Singleton
// Prevents multiple instances in development (hot reloading) and serverless (warm starts)

const globalForPrisma = global;

// Create Prisma Client with optimal serverless configuration
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Cache the client in global scope to reuse across serverless function invocations
// This works in both dev and production
globalForPrisma.prisma = prisma;

export default prisma;
