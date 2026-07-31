import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../../src/prisma.js";

export async function seedAdmin() {
  console.log("\n👤 Seeding super admin...");

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@chodelivery.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "@Sambo2000";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      firstName: "Cho",
      lastName: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`  ✓ Admin seeded: ${adminEmail}`);
  console.log(`  ⚠  Change the password after first login!`);
}
