import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma Client connected!');
  } catch (e) {
    console.error('❌ Prisma Client failed to connect:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();