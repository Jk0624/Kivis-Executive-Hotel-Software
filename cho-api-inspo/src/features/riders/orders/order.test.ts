import request from "supertest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../prisma.js";
import { hashPassword } from "../../../utils/password.js";
import { generateAccessToken } from "../../../utils/tokens.js";

const app = createApp();

// ─── Shared test state ────────────────────────────────────────────────────────
let riderToken: string;
let riderId: string;
let restaurantId: string;
let userId: string;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Creates a READY order (status that rider can accept) */
const createReadyOrder = async () => {
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
      status: "READY",
      paymentStatus: "PAID",
      orderPaymentMethod: "PREPAID",
      orderItems: {
        create: [{ foodId: food.id, quantity: 1, price: food.price }],
      },
    },
  });
};

/** Creates a RIDER_ASSIGNED order (ready to be picked up by this rider) */
const createAssignedOrder = async () => {
  const order = await createReadyOrder();
  return prisma.order.update({
    where: { id: order.id },
    data: { status: "RIDER_ASSIGNED", riderId: BigInt(riderId) },
  });
};

/** Creates a PICKED_UP order (ready to be delivered) */
const createPickedUpOrder = async () => {
  const order = await createReadyOrder();
  return prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PICKED_UP",
      riderId: BigInt(riderId),
      deliveryPin: "1234",
    },
  });
};

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  const password = await hashPassword("Test1234!");

  // Rider must be VERIFIED to manage orders
  const rider = await prisma.rider.create({
    data: {
      firstName: "TestRider",
      lastName: "Orders",
      email: `rider-orders-${Date.now()}@test.com`,
      phone: `+2339${Date.now().toString().slice(-8)}`,
      password,
      verificationStatus: "VERIFIED",
      isPersonalInfoComplete: true,
    },
  });
  riderId = rider.id.toString();
  riderToken = generateAccessToken(rider.id, "rider");

  // Seed a test vendor, restaurant, food, and user
  const vendor = await prisma.vendor.create({
    data: {
      firstName: "RiderTestVendor",
      lastName: "Orders",
      email: `vendor-for-rider-orders-${Date.now()}@test.com`,
      phone: `+2340${Date.now().toString().slice(-8)}`,
      password,
      isPersonalInfoComplete: true,
    },
  });

  const restaurant = await prisma.restaurant.create({
    data: {
      vendorId: vendor.id,
      name: "Rider Test Restaurant",
      addressLine: "1 Rider St",
      latitude: 5.6037,
      longitude: -0.187,
    },
  });
  restaurantId = restaurant.id.toString();

  await prisma.food.create({
    data: { restaurantId: restaurant.id, name: "Rider Test Food", price: 20 },
  });

  const user = await prisma.user.create({
    data: {
      firstName: "RiderTest",
      lastName: "User",
      phone: `+2341${Date.now().toString().slice(-8)}`,
    },
  });
  userId = user.id.toString();
});

afterAll(async () => {
  await prisma.orderItem.deleteMany({ where: { order: { restaurantId: BigInt(restaurantId) } } });
  await prisma.order.deleteMany({ where: { restaurantId: BigInt(restaurantId) } });
  await prisma.food.deleteMany({ where: { restaurantId: BigInt(restaurantId) } });
  await prisma.restaurant.deleteMany({ where: { id: BigInt(restaurantId) } });
  await prisma.vendor.deleteMany({ where: { email: { contains: "vendor-for-rider-orders-" } } });
  await prisma.rider.deleteMany({ where: { email: { contains: "rider-orders-" } } });
  await prisma.user.deleteMany({ where: { id: BigInt(userId) } });
  await prisma.$disconnect();
});

// ─── PUT /rider/api/v1/orders/:id/accept ─────────────────────────────────────
describe("PUT /rider/api/v1/orders/:id/accept", () => {
  it("returns 401 with no token", async () => {
    const order = await createReadyOrder();
    const res = await request(app).put(`/rider/api/v1/orders/${order.id}/accept`);
    expect(res.status).toBe(401);
  });

  it("accepts a READY order for a verified rider", async () => {
    const order = await createReadyOrder();
    const res = await request(app)
      .put(`/rider/api/v1/orders/${order.id}/accept`)
      .set("Authorization", `Bearer ${riderToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("RIDER_ASSIGNED");
  });

  it("returns 400 when order is not in READY status", async () => {
    const order = await createAssignedOrder();
    const res = await request(app)
      .put(`/rider/api/v1/orders/${order.id}/accept`)
      .set("Authorization", `Bearer ${riderToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for a non-existent order", async () => {
    const res = await request(app)
      .put(`/rider/api/v1/orders/999999999/accept`)
      .set("Authorization", `Bearer ${riderToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /rider/api/v1/orders/:id/pickup ─────────────────────────────────────
describe("PUT /rider/api/v1/orders/:id/pickup", () => {
  it("returns 401 with no token", async () => {
    const order = await createAssignedOrder();
    const res = await request(app).put(`/rider/api/v1/orders/${order.id}/pickup`);
    expect(res.status).toBe(401);
  });

  it("marks a RIDER_ASSIGNED order as PICKED_UP", async () => {
    const order = await createAssignedOrder();
    const res = await request(app)
      .put(`/rider/api/v1/orders/${order.id}/pickup`)
      .set("Authorization", `Bearer ${riderToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("PICKED_UP");
  });

  it("returns 400 when order is not RIDER_ASSIGNED", async () => {
    // Use a PICKED_UP order (owned by our rider, wrong status for pickup)
    const order = await createPickedUpOrder();
    const res = await request(app)
      .put(`/rider/api/v1/orders/${order.id}/pickup`)
      .set("Authorization", `Bearer ${riderToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /rider/api/v1/orders/:id/deliver ────────────────────────────────────
describe("PUT /rider/api/v1/orders/:id/deliver", () => {
  it("returns 401 with no token", async () => {
    const order = await createPickedUpOrder();
    const res = await request(app)
      .put(`/rider/api/v1/orders/${order.id}/deliver`)
      .send({ pin: "1234" });
    expect(res.status).toBe(401);
  });

  it("marks a PICKED_UP order as DELIVERED with correct pin", async () => {
    const order = await createPickedUpOrder();
    const res = await request(app)
      .put(`/rider/api/v1/orders/${order.id}/deliver`)
      .set("Authorization", `Bearer ${riderToken}`)
      .send({ pin: "1234" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("DELIVERED");
  });

  it("returns 400 when order is not PICKED_UP", async () => {
    const order = await createAssignedOrder();
    const res = await request(app)
      .put(`/rider/api/v1/orders/${order.id}/deliver`)
      .set("Authorization", `Bearer ${riderToken}`)
      .send({ pin: "1234" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
