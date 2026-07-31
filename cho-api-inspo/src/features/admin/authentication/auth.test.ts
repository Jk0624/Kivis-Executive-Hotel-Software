import request from "supertest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../prisma.js";
import { hashPassword } from "../../../utils/password.js";
import { generateAccessToken, generateAdminAccessToken } from "../../../utils/tokens.js";

const app = createApp();

let adminId: string;
let adminToken: string;

beforeAll(async () => {
  const password = await hashPassword("Admin@1234!");
  const admin = await prisma.admin.create({
    data: {
      firstName: "Test",
      lastName: "Admin",
      email: `admin-auth-${Date.now()}@test.com`,
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

describe("POST /admin/api/v1/auth/login", () => {
  it("returns 400 when fields are missing", async () => {
    const res = await request(app).post("/admin/api/v1/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/admin/api/v1/auth/login")
      .send({ email: `admin-auth-${adminId}@wrong.com`, password: "Wrong!" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 200 with tokens on valid credentials", async () => {
    const admin = await prisma.admin.findUnique({ where: { id: BigInt(adminId) } });
    const res = await request(app)
      .post("/admin/api/v1/auth/login")
      .send({ email: admin!.email, password: "Admin@1234!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
    expect(res.body.data.admin.role).toBe("SUPER_ADMIN");
  });
});

describe("POST /admin/api/v1/auth/refresh-token", () => {
  it("returns 400 when refresh token is missing", async () => {
    const res = await request(app).post("/admin/api/v1/auth/refresh-token").send({});
    expect(res.status).toBe(400);
  });

  it("returns 401 for a non-admin refresh token", async () => {
    const { generateRefreshToken } = await import("../../../utils/tokens.js");
    const userRefresh = generateRefreshToken(BigInt(1), "user");
    const res = await request(app)
      .post("/admin/api/v1/auth/refresh-token")
      .send({ refreshToken: userRefresh });
    expect(res.status).toBe(401);
  });

  it("returns new tokens for a valid admin refresh token", async () => {
    const { generateRefreshToken } = await import("../../../utils/tokens.js");
    const refresh = generateRefreshToken(BigInt(adminId), "admin");
    const res = await request(app)
      .post("/admin/api/v1/auth/refresh-token")
      .send({ refreshToken: refresh });
    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
  });
});

describe("GET /admin/api/v1/auth/me", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).get("/admin/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with a non-admin token", async () => {
    const userToken = generateAccessToken(BigInt(1), "user");
    const res = await request(app)
      .get("/admin/api/v1/auth/me")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(401);
  });

  it("returns admin profile with valid token", async () => {
    const res = await request(app)
      .get("/admin/api/v1/auth/me")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(adminId);
    expect(res.body.data.role).toBe("SUPER_ADMIN");
  });
});
