import "dotenv/config";
import request from "supertest";
import { createApp } from "../../src/createApp.js";
import { prisma } from "../../src/prisma.js";
import { generateAccessToken } from "../../src/utils/tokens.js";

(async () => {
  const app = createApp();
  // Need any FINANCE / SUPER_ADMIN admin token.
  const admin = await prisma.admin.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (!admin) throw new Error("No SUPER_ADMIN found");
  const token = generateAccessToken(admin.id, "admin");

  const res = await request(app)
    .get("/admin/api/v1/analytics/summary")
    .set("Authorization", `Bearer ${token}`);

  console.log("Status:", res.status);
  console.log("Revenue:", JSON.stringify(res.body.data?.revenue, null, 2));
  await prisma.$disconnect();
})();
