import "dotenv/config";
import { prisma } from "../../src/prisma.js";
import { seedAdmin } from "./admin.seed.js";
import { seedAppVersions } from "./app-versions.seed.js";
import { seedBanners } from "./banners.seed.js";

const seeds = {
  admin: seedAdmin,
  "app-versions": seedAppVersions,
  banners: seedBanners,
} as const;

const name = process.argv[2] as keyof typeof seeds | undefined;

if (!name || !(name in seeds)) {
  console.error(
    `Usage: tsx prisma/seeds/run.ts <${Object.keys(seeds).join(" | ")}>`,
  );
  process.exit(1);
}

seeds[name]()
  .catch((e) => {
    console.error(`❌ Seed "${name}" failed:`, e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
