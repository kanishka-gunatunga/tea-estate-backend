import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';
import { env } from './env';
import { parseDatabaseUrl } from '../utils/database-url';

const dbConfig = parseDatabaseUrl(env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  ...dbConfig,
  connectionLimit: 5,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
