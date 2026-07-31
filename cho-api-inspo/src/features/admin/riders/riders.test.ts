import request from "supertest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../prisma.js";
import { hashPassword } from "../../../utils/password.js";
import { generateAccessToken, generateAdminAccessToken } from "../../../utils/tokens.js";

const app = createApp();

let adminToken: string;
let adminId: string;
let riderId: string;
let riderForRejectId: string;

beforeAll(async () => {
  const password = await hashPassword("Admin@1234!");

  const admin = await prisma.admin.create({
    data: {
      firstName: "Test",
      lastName: "Admin",
      email: `admin-riders-${Date.now()}@test.com`,
      password,
      role: "SUPER_ADMIN",
    },
  });
  adminId = admin.id.toString();
  adminToken = generateAdminAccessToken(admin);

  const ts = Date.now();
  const rider = await prisma.rider.create({
    data: {
      firstName: "Test",
      lastName: "Rider",
      email: `rider-admin-a-${ts}@test.com`,
      phone: `+2352${ts.toString().slice(-8)}`,
      password,
      verificationStatus: "UNDER_REVIEW",
    },
  });
  riderId = rider.id.toString();

  const riderForReject = await prisma.rider.create({
    data: {
      firstName: "Reject",
      lastName: "Rider",
      email: `rider-admin-b-${ts}@test.com`,
      phone: `+2353${ts.toString().slice(-8)}`,
      password,
      verificationStatus: "UNDER_REVIEW",
    },
  });
  riderForRejectId = riderForReject.id.toString();
});

afterAll(async () => {
  await prisma.rider.deleteMany({ where: { id: { in: [BigInt(riderId), BigInt(riderForRejectId)] } } });
  await prisma.adminAuditLog.deleteMany({ where: { adminId: BigInt(adminId) } });
  await prisma.admin.deleteMany({ where: { id: BigInt(adminId) } });
  await prisma.$disconnect();
});

describe("GET /admin/api/v1/riders", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).get("/admin/api/v1/riders");
    expect(res.status).toBe(401);
  });

  it("returns paginated rider list", async () => {
    const res = await request(app)
      .get("/admin/api/v1/riders")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("filters by verificationStatus", async () => {
    const res = await request(app)
      .get("/admin/api/v1/riders?verificationStatus=UNDER_REVIEW")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((r: any) => r.verificationStatus === "UNDER_REVIEW")).toBe(true);
  });
});

describe("GET /admin/api/v1/riders/:id", () => {
  it("returns rider profile", async () => {
    const res = await request(app)
      .get(`/admin/api/v1/riders/${riderId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(riderId);
  });

  it("returns 404 for non-existent rider", async () => {
    const res = await request(app)
      .get("/admin/api/v1/riders/999999999")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PATCH /admin/api/v1/riders/:id/toggle-active", () => {
  it("blocks an active rider", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/riders/${riderId}/toggle-active`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it("unblocks a blocked rider", async () => {
    const res = await request(app)
      .patch(`/admin/api/v1/riders/${riderId}/toggle-active`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);
  });
});

describe("GET /admin/api/v1/riders/verifications/pending", () => {
  it("returns riders under review", async () => {
    const res = await request(app)
      .get("/admin/api/v1/riders/verifications/pending")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const found = res.body.data.find((r: any) => r.id === riderId);
    expect(found).toBeDefined();
  });
});

describe("POST /admin/api/v1/riders/verifications/:id/review", () => {
  it("returns 400 when rejecting without reason", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/riders/verifications/${riderId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "reject" });

    expect(res.status).toBe(400);
  });

  it("rejects a rider with a reason", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/riders/verifications/${riderForRejectId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "reject", reason: "Incomplete documents" });

    expect(res.status).toBe(200);
    expect(res.body.data.verificationStatus).toBe("REJECTED");
  });

  it("approves a rider under review", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/riders/verifications/${riderId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "approve" });

    expect(res.status).toBe(200);
    expect(res.body.data.verificationStatus).toBe("VERIFIED");
  });

  it("returns 400 when reviewing an already-processed rider", async () => {
    const res = await request(app)
      .post(`/admin/api/v1/riders/verifications/${riderId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ action: "approve" });

    expect(res.status).toBe(400);
  });
});
