import "dotenv/config";
import { prisma } from "../../src/prisma.js";

const appVersions = [
  {
    app: "user",
    platform: "ios",
    storeUrl: "https://apps.apple.com/app/cho/id000000000",
  },
  {
    app: "user",
    platform: "android",
    storeUrl:
      "https://play.google.com/store/apps/details?id=com.charlesbihdev.cho",
  },
];

export async function seedAppVersions() {
  console.log("\n📱 Seeding app versions...");

  for (const v of appVersions) {
    await prisma.appVersion.upsert({
      where: { app_platform: { app: v.app, platform: v.platform } },
      update: {},
      create: {
        app: v.app,
        platform: v.platform,
        latestVersion: "1.0.0",
        minimumVersion: "1.0.0",
        storeUrl: v.storeUrl,
      },
    });
    console.log(`  ✓ ${v.app}/${v.platform}`);
  }
}
