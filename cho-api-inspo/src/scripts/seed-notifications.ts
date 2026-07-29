import "dotenv/config";
import { prisma } from "../prisma.js";

const USER_IDS = [1, 2, 3, 4, 5];

const buildNotifications = (userId: number) => [
  {
    userId: BigInt(userId),
    targetAudience: "USER" as const,
    title: "Order Update",
    message: "Your order is being prepared.",
    type: "order",
    metadata: { screen: "orders" },
  },
  {
    userId: BigInt(userId),
    targetAudience: "USER" as const,
    title: "Promo",
    message: "Enjoy 10% off your next order!",
    type: "promo",
    metadata: { screen: "home" },
  },
  {
    userId: BigInt(userId),
    targetAudience: "USER" as const,
    title: "Delivery Update",
    message: "Your rider is on the way.",
    type: "delivery",
    metadata: { screen: "orders/track" },
  },
];

async function main() {
  const existingUsers = await prisma.user.findMany({
    where: { id: { in: USER_IDS.map((id) => BigInt(id)) } },
    select: { id: true },
  });

  const existingIds = new Set(existingUsers.map((u) => Number(u.id)));
  const targetIds = USER_IDS.filter((id) => existingIds.has(id));

  if (targetIds.length === 0) {
    console.log("No matching users found for IDs 1-5. Nothing created.");
    return;
  }

  const data = targetIds.flatMap(buildNotifications);
  await prisma.notification.createMany({ data });

  console.log(`Created ${data.length} notifications for users: ${targetIds.join(", ")}`);
}

main()
  .catch((error) => {
    console.error("Error seeding notifications:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
