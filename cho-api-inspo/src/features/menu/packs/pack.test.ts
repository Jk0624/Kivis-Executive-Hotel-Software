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
let otherRestaurantId: string;
let foodId: string;
let packId: string;

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  const password = await hashPassword("Test1234!");

  const vendorA = await prisma.vendor.create({
    data: {
      firstName: "TestVendorA",
      lastName: "Pack",
      email: `vendor-pack-a-${Date.now()}@test.com`,
      phone: `+2334${Date.now().toString().slice(-8)}`,
      password,
      isPersonalInfoComplete: true,
    },
  });
  vendorToken = generateAccessToken(vendorA.id, "vendor");

  const vendorB = await prisma.vendor.create({
    data: {
      firstName: "TestVendorB",
      lastName: "Pack",
      email: `vendor-pack-b-${Date.now()}@test.com`,
      phone: `+2335${Date.now().toString().slice(-8)}`,
      password,
      isPersonalInfoComplete: true,
    },
  });
  otherVendorToken = generateAccessToken(vendorB.id, "vendor");

  const restaurantA = await prisma.restaurant.create({
    data: {
      vendorId: vendorA.id,
      name: "Pack Restaurant A",
      addressLine: "123 Pack St",
      latitude: 5.6037,
      longitude: -0.187,
    },
  });
  restaurantId = restaurantA.id.toString();

  const restaurantB = await prisma.restaurant.create({
    data: {
      vendorId: vendorB.id,
      name: "Pack Restaurant B",
      addressLine: "456 Pack Ave",
      latitude: 5.6037,
      longitude: -0.187,
    },
  });
  otherRestaurantId = restaurantB.id.toString();

  // Pre-created food for pack tests
  const food = await prisma.food.create({
    data: {
      restaurantId: restaurantA.id,
      name: "Packable Food",
      price: 15,
    },
  });
  foodId = food.id.toString();

  // Pre-created pack for update/delete tests
  const pack = await prisma.foodPack.create({
    data: {
      foodId: food.id,
      name: "Medium",
      price: 18,
    },
  });
  packId = pack.id.toString();
});

afterAll(async () => {
  await prisma.foodPack.deleteMany({ where: { food: { restaurantId: { in: [BigInt(restaurantId), BigInt(otherRestaurantId)] } } } });
  await prisma.food.deleteMany({ where: { restaurantId: { in: [BigInt(restaurantId), BigInt(otherRestaurantId)] } } });
  await prisma.restaurant.deleteMany({ where: { id: { in: [BigInt(restaurantId), BigInt(otherRestaurantId)] } } });
  await prisma.vendor.deleteMany({ where: { email: { contains: "vendor-pack-" } } });
  await prisma.$disconnect();
});

// ─── POST /vendor/api/v1/packs ────────────────────────────────────────────────
describe("POST /vendor/api/v1/packs", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/packs")
      .send({ foodId, name: "Large", price: 22 });
    expect(res.status).toBe(401);
  });

  it("creates a pack for an authenticated vendor", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/packs")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ foodId, name: "Large", price: 22 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Large");
    expect(res.body.data.foodId).toBe(foodId);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/packs")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ foodId });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for invalid price", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/packs")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ foodId, name: "Bad Pack", price: -1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 when food does not exist", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/packs")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ foodId: "999999999", name: "Ghost Pack", price: 10 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /vendor/api/v1/packs/:id ────────────────────────────────────────────
describe("PUT /vendor/api/v1/packs/:id", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app)
      .put(`/vendor/api/v1/packs/${packId}`)
      .send({ name: "Updated Pack" });
    expect(res.status).toBe(401);
  });

  it("updates a pack for the authenticated vendor", async () => {
    const res = await request(app)
      .put(`/vendor/api/v1/packs/${packId}`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ name: "Updated Medium", price: 19 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Updated Medium");
  });

  it("returns 404 for a non-existent pack", async () => {
    const res = await request(app)
      .put(`/vendor/api/v1/packs/999999999`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /vendor/api/v1/packs/:id ─────────────────────────────────────────
describe("DELETE /vendor/api/v1/packs/:id", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).delete(`/vendor/api/v1/packs/${packId}`);
    expect(res.status).toBe(401);
  });

  it("deletes a pack for the authenticated vendor", async () => {
    const pack = await prisma.foodPack.create({
      data: { foodId: BigInt(foodId), name: "To Delete Pack", price: 5 },
    });

    const res = await request(app)
      .delete(`/vendor/api/v1/packs/${pack.id.toString()}`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 for a non-existent pack", async () => {
    const res = await request(app)
      .delete(`/vendor/api/v1/packs/999999999`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
