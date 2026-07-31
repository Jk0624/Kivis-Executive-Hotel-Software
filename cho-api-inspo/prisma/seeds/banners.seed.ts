import "dotenv/config";
import { prisma } from "../../src/prisma.js";

const banners = [
  {
    title: "Free delivery weekend",
    imageUrl: "https://picsum.photos/seed/cho-banner-1/900/330",
    link: "https://cho.delivery/promos/free-delivery",
    displayOrder: 0,
  },
  {
    title: "Try our new kitchens",
    imageUrl: "https://picsum.photos/seed/cho-banner-2/900/330",
    link: "/home/restaurants",
    displayOrder: 1,
  },
  {
    title: "20% off your first order",
    imageUrl: "https://picsum.photos/seed/cho-banner-3/900/330",
    link: null,
    displayOrder: 2,
  },
];

export async function seedBanners() {
  console.log("\n🖼  Seeding banners...");

  for (const b of banners) {
    const existing = await prisma.banner.findFirst({
      where: { title: b.title },
    });
    if (existing) {
      await prisma.banner.update({ where: { id: existing.id }, data: b });
    } else {
      await prisma.banner.create({ data: b });
    }
    console.log(`  ✓ ${b.title}`);
  }
}
