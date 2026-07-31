import request from "supertest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../prisma.js";
import { hashPassword } from "../../../utils/password.js";
import { generateAccessToken, generateAdminAccessToken } from "../../../utils/tokens.js";

const app = createApp();

let adminToken: string;
let adminId: string;

beforeAll(async () => {
  const password = await hashPassword("Admin@1234!");

  const admin = await prisma.admin.create({
    data: {
      firstName: "Test",
      lastName: "Admin",
      email: `admin-analytics-${Date.now()}@test.com`,
      password,
      role: "SUPER_ADMIN",
    },
  });
  adminId = admin.id.toString();
  adminToken = generateAdminAccessToken(admin);
});

afterAll(async () => {
  await prisma.adminAuditLog.deleteMany({ where: { adminId: BigInt(adminId) } });
  await prisma.admin.deleteMany({ where: { id: BigInt(adminId) } });
  await prisma.$disconnect();
});

// ─── Financial summary ────────────────────────────────────────────────────────

describe("GET /admin/api/v1/analytics/summary", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).get("/admin/api/v1/analytics/summary");
    expect(res.status).toBe(401);
  });

  it("returns summary with default (last 30 days) range", async () => {
    const res = await request(app)
      .get("/admin/api/v1/analytics/summary")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.period).toBeDefined();
    expect(res.body.data.orders).toBeDefined();
    expect(res.body.data.revenue).toBeDefined();
    expect(res.body.data.payouts).toBeDefined();
    expect(res.body.data.newSignups).toBeDefined();
    expect(res.body.data.pendingWithdrawals).toBeDefined();
  });

  it("returns summary for preset=today", async () => {
    const res = await request(app)
      .get("/admin/api/v1/analytics/summary?preset=today")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.orders.total).toBeGreaterThanOrEqual(0);
  });

  it("returns summary for preset=this_month", async () => {
    const res = await request(app)
      .get("/admin/api/v1/analytics/summary?preset=this_month")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.data.orders.gmv).toBe("string");
  });

  it("returns summary for preset=this_year", async () => {
    const res = await request(app)
      .get("/admin/api/v1/analytics/summary?preset=this_year")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it("returns summary for custom dateFrom/dateTo range", async () => {
    const res = await request(app)
      .get("/admin/api/v1/analytics/summary?dateFrom=2025-01-01&dateTo=2025-12-31")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.period.from).toContain("2025-01-01");
  });

  it("returns correct shape for revenue and payouts fields", async () => {
    const res = await request(app)
      .get("/admin/api/v1/analytics/summary")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const { revenue, payouts, newSignups, pendingWithdrawals } = res.body.data;
    expect(revenue.serviceFees).toBeDefined();
    expect(revenue.deliveryFeesGross).toBeDefined();
    expect(revenue.choDeliveryShare).toBeDefined();
    expect(revenue.riderDeliveryShare).toBeDefined();
    expect(revenue.foodTotalGross).toBeDefined();
    expect(revenue.choVendorCommission).toBeDefined();
    expect(revenue.vendorFoodShare).toBeDefined();
    expect(payouts.riderPayoutsCompleted).toBeDefined();
    expect(payouts.vendorPayoutsCompleted).toBeDefined();
    expect(typeof newSignups.users).toBe("number");
    expect(typeof pendingWithdrawals.vendors).toBe("number");
    expect(typeof pendingWithdrawals.riders).toBe("number");
  });
});

// ─── Order trend ──────────────────────────────────────────────────────────────

describe("GET /admin/api/v1/analytics/order-trend", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).get("/admin/api/v1/analytics/order-trend");
    expect(res.status).toBe(401);
  });

  it("returns daily trend data as an array", async () => {
    const res = await request(app)
      .get("/admin/api/v1/analytics/order-trend")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("returns trend for preset=this_week", async () => {
    const res = await request(app)
      .get("/admin/api/v1/analytics/order-trend?preset=this_week")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    if (res.body.data.length > 0) {
      const entry = res.body.data[0];
      expect(entry.date).toBeDefined();
      expect(typeof entry.count).toBe("number");
      expect(entry.total).toBeDefined();
    }
  });

  it("returns trend for custom date range", async () => {
    const res = await request(app)
      .get("/admin/api/v1/analytics/order-trend?dateFrom=2025-01-01&dateTo=2025-12-31")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});
