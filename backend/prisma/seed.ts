import { PrismaClient, RoomStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.room.create({
    data: {
      roomNo: 'K101',
      type: 'EXECUTIVE',
      price: 350,
      status: RoomStatus.AVAILABLE,
    },
  });

  console.log('✅ Demo room created.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });