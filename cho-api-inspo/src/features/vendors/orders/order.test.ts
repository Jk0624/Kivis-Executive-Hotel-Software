import request from "supertest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../prisma.js";
import { hashPassword } from "../../../utils/password.js";
import { generateAccessToken } from "../../../utils/tokens.js";

const app = createApp();

// ─── Shared test state ────────────────────────────────────────────────────────
let vendorToken: string;
let otherVendorToken: string;
let restaurantId: string;
let userId: string;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Creates a fresh PENDING + PAID order for the test restaurant */
const createPendingOrder = async () => {
  const food = await prisma.food.findFirst({ where: { restaurantId: BigInt(restaurantId) } });
  if (!food) throw new Error("No food found for test restaurant");

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
      status: "PENDING",
      paymentStatus: "PAID",
      orderPaymentMethod: "PREPAID",
      orderItems: {
        create: [{ foodId: food.id, quantity: 1, price: food.price }],
      },
    },
  });
};

/** Creates a CONFIRMED order (past accept, ready for prepare) */
const createConfirmedOrder = async () => {
  const order = await createPendingOrder();
  return prisma.order.update({ where: { id: order.id }, data: { status: "CONFIRMED" } });
};

/** Creates a PREPARING order (ready to mark as ready) */
const createPreparingOrder = async () => {
  const order = await createPendingOrder();
  return prisma.order.update({ where: { id: order.id }, data: { status: "PREPARING" } });
};

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  const password = await hashPassword("Test1234!");

  const vendorA = await prisma.vendor.create({
    data: {
      firstName: "TestVendorA",
      lastName: "Orders",
      email: `vendor-orders-a-${Date.now()}@test.com`,
      phone: `+2336${Date.now().toString().slice(-8)}`,
      password,
      isPersonalInfoComplete: true,
    },
  });
  vendorToken = generateAccessToken(vendorA.id, "vendor");

  const vendorB = await prisma.vendor.create({
    data: {
      firstName: "TestVendorB",
      lastName: "Orders",
      email: `vendor-orders-b-${Date.now()}@test.com`,
      phone: `+2337${Date.now().toString().slice(-8)}`,
      password,
      isPersonalInfoComplete: true,
    },
  });
  otherVendorToken = generateAccessToken(vendorB.id, "vendor");

  const restaurant = await prisma.restaurant.create({
    data: {
      vendorId: vendorA.id,
      name: "Orders Restaurant",
      addressLine: "1 Order St",
      latitude: 5.6037,
      longitude: -0.187,
    },
  });
  restaurantId = restaurant.id.toString();

  // Seed a food item and a test user for orders
  await prisma.food.create({
    data: { restaurantId: restaurant.id, name: "Order Food", price: 20 },
  });

  const user = await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "User",
      phone: `+2338${Date.now().toString().slice(-8)}`,
    },
  });
  userId = user.id.toString();
});

afterAll(async () => {
  await prisma.orderItem.deleteMany({ where: { order: { restaurantId: BigInt(restaurantId) } } });
  await prisma.order.deleteMany({ where: { restaurantId: BigInt(restaurantId) } });
  await prisma.food.deleteMany({ where: { restaurantId: BigInt(restaurantId) } });
  await prisma.restaurant.deleteMany({ where: { id: BigInt(restaurantId) } });
  await prisma.vendor.deleteMany({ where: { email: { contains: "vendor-orders-" } } });
  await prisma.user.deleteMany({ where: { id: BigInt(userId) } });
  await prisma.$disconnect();
});

// ─── PUT /vendor/api/v1/orders/:id/accept ────────────────────────────────────
describe("PUT /vendor/api/v1/orders/:id/accept", () => {
  it("returns 401 with no token", async () => {
    const order = await createPendingOrder();
    const res = await request(app).put(`/vendor/api/v1/orders/${order.id}/accept`);
    expect(res.status).toBe(401);
  });

  it("accepts a PENDING order for the authenticated vendor", async () => {
    const order = await createPendingOrder();
    const res = await request(app)
      .put(`/vendor/api/v1/orders/${order.id}/accept`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("CONFIRMED");
  });

  it("returns 403 when another vendor tries to accept the order", async () => {
    const order = await createPendingOrder();
    const res = await request(app)
      .put(`/vendor/api/v1/orders/${order.id}/accept`)
      .set("Authorization", `Bearer ${otherVendorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when order is not in PENDING status", async () => {
    const order = await createConfirmedOrder();
    const res = await request(app)
      .put(`/vendor/api/v1/orders/${order.id}/accept`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for a non-existent order", async () => {
    const res = await request(app)
      .put(`/vendor/api/v1/orders/999999999/accept`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /vendor/api/v1/orders/:id/reject ────────────────────────────────────
describe("PUT /vendor/api/v1/orders/:id/reject", () => {
  it("returns 401 with no token", async () => {
    const order = await createPendingOrder();
    const res = await request(app).put(`/vendor/api/v1/orders/${order.id}/reject`);
    expect(res.status).toBe(401);
  });

  it("rejects a PENDING order for the authenticated vendor", async () => {
    const order = await createPendingOrder();
    const res = await request(app)
      .put(`/vendor/api/v1/orders/${order.id}/reject`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("CANCELLED");
  });

  it("returns 403 when another vendor tries to reject the order", async () => {
    const order = await createPendingOrder();
    const res = await request(app)
      .put(`/vendor/api/v1/orders/${order.id}/reject`)
      .set("Authorization", `Bearer ${otherVendorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when order is not in PENDING status", async () => {
    const order = await createConfirmedOrder();
    const res = await request(app)
      .put(`/vendor/api/v1/orders/${order.id}/reject`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /vendor/api/v1/orders/:id/prepare ───────────────────────────────────
describe("PUT /vendor/api/v1/orders/:id/prepare", () => {
  it("returns 401 with no token", async () => {
    const order = await createConfirmedOrder();
    const res = await request(app).put(`/vendor/api/v1/orders/${order.id}/prepare`);
    expect(res.status).toBe(401);
  });

  it("marks a CONFIRMED order as PREPARING", async () => {
    const order = await createConfirmedOrder();
    const res = await request(app)
      .put(`/vendor/api/v1/orders/${order.id}/prepare`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("PREPARING");
  });

  it("returns 403 when another vendor tries to prepare the order", async () => {
    const order = await createConfirmedOrder();
    const res = await request(app)
      .put(`/vendor/api/v1/orders/${order.id}/prepare`)
      .set("Authorization", `Bearer ${otherVendorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /vendor/api/v1/orders/:id/ready ─────────────────────────────────────
describe("PUT /vendor/api/v1/orders/:id/ready", () => {
  it("returns 401 with no token", async () => {
    const order = await createPreparingOrder();
    const res = await request(app).put(`/vendor/api/v1/orders/${order.id}/ready`);
    expect(res.status).toBe(401);
  });

  it("marks a PREPARING order as READY", async () => {
    const order = await createPreparingOrder();
    const res = await request(app)
      .put(`/vendor/api/v1/orders/${order.id}/ready`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("READY");
  });

  it("returns 403 when another vendor tries to mark order as ready", async () => {
    const order = await createPreparingOrder();
    const res = await request(app)
      .put(`/vendor/api/v1/orders/${order.id}/ready`)
      .set("Authorization", `Bearer ${otherVendorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
