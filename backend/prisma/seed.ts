import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = [];
  const passwordHash = bcrypt.hashSync('password123', 10);
  const totalData = 6000;

  await prisma.user.deleteMany();

  for (let i = 0; i < totalData; i++) {
    users.push({
      username: faker.internet.userName().toLowerCase() + i,
      name: faker.person.fullName(),
      passwordHash,
      role: faker.helpers.arrayElement(['admin', 'user', 'editor']),
      createdBy: null,
      updatedBy: null,
      deletedAt: null,
    });
  }

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`${totalData} users dengan password terenkripsi berhasil dibuat`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
