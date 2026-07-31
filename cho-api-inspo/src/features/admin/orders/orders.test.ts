import request from "supertest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../prisma.js";
import { hashPassword } from "../../../utils/password.js";
import { generateAccessToken, generateAdminAccessToken } from "../../../utils/tokens.js";

const app = createApp();

let adminToken: string;
let adminId: string;
let userId: string;
let restaurantId: string;
let foodId: string;

beforeAll(async () => {
  const password = await hashPassword("Admin@1234!");
  const ts = Date.now();

  const admin = await prisma.admin.create({
    data: {
      firstName: "Test",
      lastName: "Admin",
      email: `admin-orders-${ts}@test.com`,
      password,
      role: "SUPER_ADMIN",
    },
  });
  adminId = admin.id.toString();
  adminToken = generateAdminAccessToken(admin);

  const user = await prisma.user.create({
    data: { firstName: "Test", lastName: "User", phone: `+2350${ts.toString().slice(-8)}` },
  });
  userId = user.id.toString();

  const vendor = await prisma.vendor.create({
    data: {
      firstName: "Test",
      lastName: "Vendor",
      email: `vendor-orders-${ts}@test.com`,
      phone: `+2351${ts.toString().slice(-8)}`,
      password,
    },
  });

  const restaurant = await prisma.restaurant.create({
    data: {
      vendorId: vendor.id,
      name: "Admin Orders Test Restaurant",
      addressLine: "1 Admin St",
      latitude: 5.6037,
      longitude: -0.187,
      verificationStatus: "VERIFIED",
      status: "ACTIVE",
    },
  });
  restaurantId = restaurant.id.toString();

  const food = await prisma.food.create({
    data: {
      restaurantId: restaurant.id,
      name: "Test Burger",
      price: 20,
      isAvailable: true,
    },
  });
  foodId = food.id.toString();
});

afterAll(async () => {
  await prisma.order.deleteMany({ where: { restaurantId: BigInt(restaurantId) } });
  await prisma.food.deleteMany({ where: { restaurantId: BigInt(restaurantId) } });
  await prisma.restaurant.deleteMany({ where: { id: BigInt(restaurantId) } });
  await prisma.vendor.deleteMany({ where: { restaurants: { none: {} } } });
  await prisma.user.deleteMany({ where: { id: BigInt(userId) } });
  await prisma.adminAuditLog.deleteMany({ where: { adminId: BigInt(adminId) } });
  await prisma.admin.deleteMany({ where: { id: BigInt(adminId) } });
  await prisma.$disconnect();
});

const createOrder = async (status = "PENDING", extra: any = {}) => {
  return prisma.order.create({
    data: {
      userId: BigInt(userId),
      restaurantId: BigInt(restaurantId),
      deliveryAddress: "Test Address",
      deliveryFee: 5,
      foodTotal: 20,
      serviceFee: 1,
      tax: 0,
      totalAmount: 26,
      status,
      paymentStatus: "PAID",
      orderPaymentMethod: "PREPAID",
      deliveryPin: "1234",
      ...extra,
      orderItems: {
        create: [{ foodId: BigInt(foodId), quantity: 1, price: 20 }],
      },
    },
  });
};

// ─── List orders ──────────────────────────────────────────────────────────────

describe("GET /admin/api/v1/orders", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).get("/admin/api/v1/orders");
    expect(res.status).toBe(401);
  });

  it("returns paginated order list", async () => {
    const res = await request(app)
      .get("/admin/api/v1/orders")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it("filters by status", async () => {
    const order = await createOrder("CANCELLED");
    const res = await request(app)
      .get("/admin/api/v1/orders?status=CANCELLED")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((o: any) => o.id === order.id.toString())).toBe(true);
    await prisma.order.delete({ where: { id: order.id } });
  });
});

// ─── Restaurant action chain ──────────────────────────────────────────────────

describe("Admin restaurant order actions (accept → prepare → ready → reject)", () => {
  let orderId: string;

  beforeEach(async () => {
    const order = await createOrder("PENDING");
    orderId = order.id.toString();
  });

  afterEach(async () => {
    await prisma.order.deleteMany({ where: { id: BigInt(orderId) } }).catch(() => {});
  });

  it("returns 404 for non-existent order on accept", async () => {
    const res = await request(app)
      .put("/admin/api/v1/orders/999999999/accept")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it("accepts a PENDING order", async () => {
    const res = await request(app)
      .put(`/admin/api/v1/orders/${orderId}/accept`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CONFIRMED");
  });

  it("returns 400 when accepting a non-PENDING order", async () => {
    // Already CONFIRMED from previous accept — but we create a fresh CONFIRMED order
    const confirmed = await createOrder("CONFIRMED");
    const res = await request(app)
      .put(`/admin/api/v1/orders/${confirmed.id}/accept`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    await prisma.order.delete({ where: { id: confirmed.id } });
  });

  it("rejects a PENDING order", async () => {
    const res = await request(app)
      .put(`/admin/api/v1/orders/${orderId}/reject`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CANCELLED");
  });
});

describe("Admin prepare → ready chain", () => {
  let confirmedId: string;

  beforeAll(async () => {
    const order = await createOrder("CONFIRMED");
    confirmedId = order.id.toString();
  });

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { id: BigInt(confirmedId) } }).catch(() => {});
  });

  it("marks a CONFIRMED order as PREPARING", async () => {
    const res = await request(app)
      .put(`/admin/api/v1/orders/${confirmedId}/prepare`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("PREPARING");
  });

  it("marks a PREPARING order as READY", async () => {
    const res = await request(app)
      .put(`/admin/api/v1/orders/${confirmedId}/ready`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("READY");
  });
});

// ─── Admin dispatch chain ─────────────────────────────────────────────────────

describe("Admin dispatch chain (dispatch → pickup → deliver)", () => {
  let readyOrderId: string;

  beforeAll(async () => {
    const order = await createOrder("READY");
    readyOrderId = order.id.toString();
  });

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { id: BigInt(readyOrderId) } }).catch(() => {});
  });

  it("returns 400 when dispatching a non-READY order", async () => {
    const pending = await createOrder("PENDING");
    const res = await request(app)
      .put(`/admin/api/v1/orders/${pending.id}/dispatch`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    await prisma.order.delete({ where: { id: pending.id } });
  });

  it("dispatches a READY order", async () => {
    const res = await request(app)
      .put(`/admin/api/v1/orders/${readyOrderId}/dispatch`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("RIDER_ASSIGNED");
    expect(res.body.data.adminDispatchedById).toBe(adminId);
  });

  it("picks up a RIDER_ASSIGNED order dispatched by this admin", async () => {
    const res = await request(app)
      .put(`/admin/api/v1/orders/${readyOrderId}/pickup`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("PICKED_UP");
  });

  it("returns 400 when delivering with wrong PIN", async () => {
    const res = await request(app)
      .put(`/admin/api/v1/orders/${readyOrderId}/deliver`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ pin: "0000" });

    expect(res.status).toBe(400);
  });

  it("delivers a PICKED_UP order with correct PIN", async () => {
    const res = await request(app)
      .put(`/admin/api/v1/orders/${readyOrderId}/deliver`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ pin: "1234" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("DELIVERED");
  });

  it("returns 400 when delivering without PIN", async () => {
    const order = await createOrder("PICKED_UP", { adminDispatchedById: BigInt(adminId) });
    const res = await request(app)
      .put(`/admin/api/v1/orders/${order.id}/deliver`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
    await prisma.order.delete({ where: { id: order.id } });
  });
});
