import request from "supertest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../prisma.js";
import { hashPassword } from "../../../utils/password.js";
import { generateAccessToken, generateAdminAccessToken } from "../../../utils/tokens.js";

const app = createApp();

let adminToken: string;
let adminId: string;
let financeToken: string;
let financeAdminId: string;
let userId: string;

beforeAll(async () => {
  const password = await hashPassword("Admin@1234!");

  const admin = await prisma.admin.create({
    data: {
      firstName: "Test",
      lastName: "Admin",
      email: `admin-users-${Date.now()}@test.com`,
      password,
      role: "SUPER_ADMIN",
    },
  });
  adminId = admin.id.toString();
  adminToken = generateAdminAccessToken(admin);

  const finance = await prisma.admin.create({
    data: {
      firstName: "Fin",
      lastName: "Test",
      email: `admin-users-fin-${Date.now()}@test.com`,
      password,
      role: "FINANCE",
    },
  });
  financeAdminId = finance.id.toString();
  financeToken = generateAdminAccessToken(finance);

  const user = await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "User",
      phone: `+2350${Date.now().toString().slice(-8)}`,
    },
  });
  userId = user.id.toString();
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: BigInt(userId) } });
  await prisma.adminAuditLog.deleteMany({
    where: { adminId: { in: [BigInt(adminId), BigInt(financeAdminId)] } },
  });
  await prisma.admin.deleteMany({
    where: { id: { in: [BigInt(adminId), BigInt(financeAdminId)] } },
  });
  await prisma.$disconnect();
});

describe("GET /admin/api/v1/users", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).get("/admin/api/v1/users");
    expect(res.status).toBe(401);
  });

  it("returns 403 for FINANCE role", async () => {
    const res = await request(app)
      .get("/admin/api/v1/users")
      .set("Authorization", `Bearer ${financeToken}`);
    expect(res.status).toBe(403);
  });

  it("returns paginated user list", async () => {
    const res = await request(app)
      .get("/admin/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it("filters by search term", async () => {
    const res = await request(app)
      .get("/admin/api/v1/users?search=Test")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe("GET /admin/api/v1/users/:id", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).get(`/admin/api/v1/users/${userId}`);
    expect(res.status).toBe(401);
  });

  it("returns user profile", async () => {
    const res = await request(app)
      .get(`/admin/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userId);
  });

  it("returns 404 for non-existent user", async () => {
    const res = await request(app)
      .get("/admin/api/v1/users/999999999")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PATCH /admin/api/v1/users/:id/toggle-active", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).patch(`/admin/api/v1/users/${userId}/toggle-active`);
    expect(res.status).toBe(401);
  });

  it("blocks an active user", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/users/${userId}/toggle-active`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it("unblocks a blocked user", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/users/${userId}/toggle-active`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);
  });
});
