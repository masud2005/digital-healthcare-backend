import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.testimonial.count();
  console.log("Success");
}
main().catch(console.error).finally(() => prisma.$disconnect());
