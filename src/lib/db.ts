import 'server-only';
import { PrismaClient } from '@prisma/client';

// The schema's directUrl (used by migrations) falls back to the main URL when it isn't set.
if (!process.env.DATABASE_URL_UNPOOLED && process.env.DATABASE_URL) process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
