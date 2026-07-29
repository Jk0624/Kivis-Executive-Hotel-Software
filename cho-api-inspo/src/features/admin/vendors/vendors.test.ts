import request from "supertest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../prisma.js";
import { hashPassword } from "../../../utils/password.js";
import { generateAccessToken, generateAdminAccessToken } from "../../../utils/tokens.js";

const app = createApp();

let adminToken: string;
let adminId: string;
let vendorId: string;
let restaurantId: string;

beforeAll(async () => {
  const password = await hashPassword("Admin@1234!");

  const admin = await prisma.admin.create({
    data: {
      firstName: "Test",
      lastName: "Admin",
      email: `admin-vendors-${Date.now()}@test.com`,
      password,
      role: "SUPER_ADMIN",
    },
  });
  adminId = admin.id.toString();
  adminToken = generateAdminAccessToken(admin);

  const vendor = await prisma.vendor.create({
    data: {
      firstName: "Test",
      lastName: "Vendor",
      email: `vendor-admin-test-${Date.now()}@test.com`,
      phone: `+2351${Date.now().toString().slice(-8)}`,
      password,
      isPersonalInfoComplete: true,
    },
  });
  vendorId = vendor.id.toString();

  const restaurant = await prisma.restaurant.create({
    data: {
      vendorId: vendor.id,
      name: "Admin Test Restaurant",
      addressLine: "1 Admin St",
      latitude: 5.6037,
      longitude: -0.187,
      isInfoComplete: true,
      isPaymentInfoComplete: true,
      verificationStatus: "UNDER_REVIEW",
    },
  });
  restaurantId = restaurant.id.toString();
});

afterAll(async () => {
  await prisma.restaurant.deleteMany({ where: { id: BigInt(restaurantId) } });
  await prisma.vendor.deleteMany({ where: { id: BigInt(vendorId) } });
  await prisma.adminAuditLog.deleteMany({ where: { adminId: BigInt(adminId) } });
  await prisma.admin.deleteMany({ where: { id: BigInt(adminId) } });
  await prisma.$disconnect();
});

describe("GET /admin/api/v1/vendors", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).get("/admin/api/v1/vendors");
    expect(res.status).toBe(401);
  });

  it("returns paginated vendor list", async () => {
    const res = await request(app)
      .get("/admin/api/v1/vendors")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("GET /admin/api/v1/vendors/:id", () => {
  it("returns vendor profile with restaurants", async () => {
    const res = await request(app)
      .get(`/admin/api/v1/vendors/${vendorId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(vendorId);
    expect(Array.isArray(res.body.data.restaurants)).toBe(true);
  });

  it("returns 404 for non-existent vendor", async () => {
    const res = await request(app)
      .get("/admin/api/v1/vendors/999999999")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PATCH /admin/api/v1/vendors/:id/toggle-active", () => {
  it("blocks an active vendor", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/vendors/${vendorId}/toggle-active`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it("unblocks a blocked vendor", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/vendors/${vendorId}/toggle-active`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);
  });
});

describe("GET /admin/api/v1/vendors/verifications/pending", () => {
  it("returns restaurants under review", async () => {
    const res = await request(app)
      .get("/admin/api/v1/vendors/verifications/pending")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const found = res.body.data.find((r: any) => r.id === restaurantId);
    expect(found).toBeDefined();
  });
});

describe("POST /admin/api/v1/vendors/verifications/:id/review", () => {
  it("returns 400 for missing action", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/vendors/verifications/${restaurantId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 400 when rejecting without a reason", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/vendors/verifications/${restaurantId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "reject" });

    expect(res.status).toBe(400);
  });

  it("approves a restaurant under review", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/vendors/verifications/${restaurantId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "approve" });

    expect(res.status).toBe(200);
    expect(res.body.data.verificationStatus).toBe("VERIFIED");
  });

  it("returns 400 when reviewing an already-verified restaurant", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/vendors/verifications/${restaurantId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "approve" });

    expect(res.status).toBe(400);
  });
});
