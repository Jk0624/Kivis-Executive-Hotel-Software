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
let riderId: string;
let vendorWithdrawalId: string;
let riderWithdrawalId: string;

beforeAll(async () => {
  const password = await hashPassword("Admin@1234!");
  const ts = Date.now();

  const admin = await prisma.admin.create({
    data: {
      firstName: "Test",
      lastName: "Admin",
      email: `admin-payouts-${ts}@test.com`,
      password,
      role: "SUPER_ADMIN",
    },
  });
  adminId = admin.id.toString();
  adminToken = generateAdminAccessToken(admin);

  const vendor = await prisma.vendor.create({
    data: {
      firstName: "Payout",
      lastName: "Vendor",
      email: `vendor-payout-${ts}@test.com`,
      phone: `+2351${ts.toString().slice(-8)}`,
      password,
    },
  });
  vendorId = vendor.id.toString();

  const restaurant = await prisma.restaurant.create({
    data: {
      vendorId: vendor.id,
      name: "Payout Test Restaurant",
      addressLine: "1 Payout St",
      latitude: 5.6037,
      longitude: -0.187,
      verificationStatus: "VERIFIED",
    },
  });
  restaurantId = restaurant.id.toString();

  const rider = await prisma.rider.create({
    data: {
      firstName: "Payout",
      lastName: "Rider",
      email: `rider-payout-${ts}@test.com`,
      phone: `+2353${ts.toString().slice(-8)}`,
      password,
    },
  });
  riderId = rider.id.toString();

  const vendorWithdrawal = await prisma.vendorWithdrawalRequest.create({
    data: {
      restaurantId: restaurant.id,
      amount: 100,
      method: "BANK",
      accountName: "Test Vendor",
      accountNumber: "1234567890",
      bankName: "Test Bank",
    },
  });
  vendorWithdrawalId = vendorWithdrawal.id.toString();

  const riderWithdrawal = await prisma.riderWithdrawalRequest.create({
    data: {
      riderId: rider.id,
      amount: 50,
      method: "MOMO",
      accountName: "Test Rider",
      phone: `+2353${ts.toString().slice(-8)}`,
      network: "MTN",
    },
  });
  riderWithdrawalId = riderWithdrawal.id.toString();
});

afterAll(async () => {
  await prisma.vendorWithdrawalRequest.deleteMany({ where: { restaurantId: BigInt(restaurantId) } });
  await prisma.riderWithdrawalRequest.deleteMany({ where: { riderId: BigInt(riderId) } });
  await prisma.restaurant.deleteMany({ where: { id: BigInt(restaurantId) } });
  await prisma.vendor.deleteMany({ where: { id: BigInt(vendorId) } });
  await prisma.rider.deleteMany({ where: { id: BigInt(riderId) } });
  await prisma.adminAuditLog.deleteMany({ where: { adminId: BigInt(adminId) } });
  await prisma.admin.deleteMany({ where: { id: BigInt(adminId) } });
  await prisma.$disconnect();
});

// ─── Vendor withdrawals ───────────────────────────────────────────────────────

describe("GET /admin/api/v1/payouts/vendors", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).get("/admin/api/v1/payouts/vendors");
    expect(res.status).toBe(401);
  });

  it("returns paginated vendor withdrawal list", async () => {
    const res = await request(app)
      .get("/admin/api/v1/payouts/vendors")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find((w: any) => w.id === vendorWithdrawalId);
    expect(found).toBeDefined();
  });

  it("filters by status", async () => {
    const res = await request(app)
      .get("/admin/api/v1/payouts/vendors?status=PENDING")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((w: any) => w.status === "PENDING")).toBe(true);
  });
});

describe("POST /admin/api/v1/payouts/vendors/:id/review", () => {
  it("returns 400 for invalid action", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/payouts/vendors/${vendorWithdrawalId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "hold" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existent withdrawal", async () => {
    const res = await request(app)
      .post("/admin/api/v1/payouts/vendors/999999999/review")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "approve" });

    expect(res.status).toBe(404);
  });

  it("approves a PENDING vendor withdrawal", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/payouts/vendors/${vendorWithdrawalId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "approve" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("APPROVED");
  });

  it("returns 400 when reviewing an already-processed withdrawal", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/payouts/vendors/${vendorWithdrawalId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "approve" });

    expect(res.status).toBe(400);
  });
});

describe("POST /admin/api/v1/payouts/vendors/:id/process → complete", () => {
  it("marks an APPROVED withdrawal as PROCESSING", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/payouts/vendors/${vendorWithdrawalId}/process`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("PROCESSING");
  });

  it("returns 400 when processing a non-APPROVED withdrawal", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/payouts/vendors/${vendorWithdrawalId}/process`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });

  it("marks a PROCESSING withdrawal as COMPLETED", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/payouts/vendors/${vendorWithdrawalId}/complete`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("COMPLETED");
  });
});

// ─── Rider withdrawals ────────────────────────────────────────────────────────

describe("GET /admin/api/v1/payouts/riders", () => {
  it("returns paginated rider withdrawal list", async () => {
    const res = await request(app)
      .get("/admin/api/v1/payouts/riders")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find((w: any) => w.id === riderWithdrawalId);
    expect(found).toBeDefined();
  });
});

describe("POST /admin/api/v1/payouts/riders/:id/review → process → complete", () => {
  it("returns 400 for invalid action", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/payouts/riders/${riderWithdrawalId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "cancel" });

    expect(res.status).toBe(400);
  });

  it("approves a PENDING rider withdrawal", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/payouts/riders/${riderWithdrawalId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "approve" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("APPROVED");
  });

  it("marks an APPROVED rider withdrawal as PROCESSING", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/payouts/riders/${riderWithdrawalId}/process`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("PROCESSING");
  });

  it("completes a PROCESSING rider withdrawal", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/payouts/riders/${riderWithdrawalId}/complete`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("COMPLETED");
  });

  it("returns 400 after already completing a rider withdrawal", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/payouts/riders/${riderWithdrawalId}/complete`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});
