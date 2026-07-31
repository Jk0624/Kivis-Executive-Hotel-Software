import "dotenv/config";
import { prisma } from "../src/prisma.js";
import { seedAppVersions } from "./seeds/app-versions.seed.js";
import { seedAdmin } from "./seeds/admin.seed.js";
import { seedBanners } from "./seeds/banners.seed.js";

async function main() {
  console.log("🌱 Starting seed...");

  await seedAppVersions();
  await seedAdmin();
  await seedBanners();

  console.log("\n✅ Seed completed");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
