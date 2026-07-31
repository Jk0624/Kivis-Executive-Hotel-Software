import request from "supertest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../prisma.js";
import { hashPassword } from "../../../utils/password.js";
import { generateAccessToken, generateAdminAccessToken } from "../../../utils/tokens.js";

const app = createApp();

let supportAdminId: string;
let supportToken: string;
let financeToken: string;

beforeAll(async () => {
  const password = await hashPassword("Ops@1234!");

  const support = await prisma.admin.create({
    data: {
      firstName: "Sup",
      lastName: "Port",
      email: `ops-support-${Date.now()}@test.com`,
      password,
      role: "SUPPORT",
    },
  });
  supportAdminId = support.id.toString();
  supportToken = generateAdminAccessToken(support);

  const finance = await prisma.admin.create({
    data: {
      firstName: "Fin",
      lastName: "Ance",
      email: `ops-finance-${Date.now()}@test.com`,
      password,
      role: "FINANCE",
    },
  });
  financeToken = generateAdminAccessToken(finance);
});

afterAll(async () => {
  await prisma.admin.deleteMany({
    where: { email: { contains: "ops-" } },
  });
  await prisma.$disconnect();
});

describe("GET /admin/api/v1/operations/snapshot", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/admin/api/v1/operations/snapshot");
    expect(res.status).toBe(401);
  });

  it("returns 403 for FINANCE admin", async () => {
    const res = await request(app)
      .get("/admin/api/v1/operations/snapshot")
      .set("Authorization", `Bearer ${financeToken}`);
    expect(res.status).toBe(403);
  });

  it("returns the snapshot shape for SUPPORT admin", async () => {
    const res = await request(app)
      .get("/admin/api/v1/operations/snapshot")
      .set("Authorization", `Bearer ${supportToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { data } = res.body;
    expect(typeof data.pendingVerifications.vendors).toBe("number");
    expect(typeof data.pendingVerifications.riders).toBe("number");

    expect(typeof data.orders.awaitingAcceptance).toBe("number");
    expect(typeof data.orders.inPreparation).toBe("number");
    expect(typeof data.orders.awaitingDispatch).toBe("number");
    expect(typeof data.orders.outForDelivery).toBe("number");

    expect(typeof data.blocked.users).toBe("number");
    expect(typeof data.blocked.vendors).toBe("number");
    expect(typeof data.blocked.riders).toBe("number");
  });
});
