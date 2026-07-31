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
let addonId: string;

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  const password = await hashPassword("Test1234!");

  // Vendor A — owns the restaurant we test against
  const vendorA = await prisma.vendor.create({
    data: {
      firstName: "TestVendorA",
      lastName: "Food",
      email: `vendor-food-a-${Date.now()}@test.com`,
      phone: `+2330${Date.now().toString().slice(-8)}`,
      password,
      isPersonalInfoComplete: true,
    },
  });
  vendorToken = generateAccessToken(vendorA.id, "vendor");

  // Vendor B — should NOT be able to touch Vendor A's food
  const vendorB = await prisma.vendor.create({
    data: {
      firstName: "TestVendorB",
      lastName: "Food",
      email: `vendor-food-b-${Date.now()}@test.com`,
      phone: `+2331${Date.now().toString().slice(-8)}`,
      password,
      isPersonalInfoComplete: true,
    },
  });
  otherVendorToken = generateAccessToken(vendorB.id, "vendor");

  // Restaurant owned by Vendor A
  const restaurantA = await prisma.restaurant.create({
    data: {
      vendorId: vendorA.id,
      name: "Test Restaurant A",
      addressLine: "123 Test St",
      latitude: 5.6037,
      longitude: -0.187,
    },
  });
  restaurantId = restaurantA.id.toString();

  // Restaurant owned by Vendor B
  const restaurantB = await prisma.restaurant.create({
    data: {
      vendorId: vendorB.id,
      name: "Test Restaurant B",
      addressLine: "456 Test Ave",
      latitude: 5.6037,
      longitude: -0.187,
    },
  });
  otherRestaurantId = restaurantB.id.toString();

  // A food item pre-created for update/delete/addon tests
  const food = await prisma.food.create({
    data: {
      restaurantId: restaurantA.id,
      name: "Existing Food",
      price: 20,
    },
  });
  foodId = food.id.toString();

  // An addon pre-created for the link/unlink tests
  const addon = await prisma.addon.create({
    data: {
      restaurantId: restaurantA.id,
      name: "Test Sauce",
      price: 2,
      tag: "sauce",
      frontendComponent: "checkbox",
    },
  });
  addonId = addon.id.toString();
});

afterAll(async () => {
  // Clean up in reverse dependency order
  await prisma.foodAddon.deleteMany({ where: { food: { restaurantId: BigInt(restaurantId) } } });
  await prisma.food.deleteMany({ where: { restaurantId: { in: [BigInt(restaurantId), BigInt(otherRestaurantId)] } } });
  await prisma.addon.deleteMany({ where: { restaurantId: { in: [BigInt(restaurantId), BigInt(otherRestaurantId)] } } });
  await prisma.restaurant.deleteMany({ where: { id: { in: [BigInt(restaurantId), BigInt(otherRestaurantId)] } } });
  await prisma.vendor.deleteMany({ where: { email: { contains: "vendor-food-" } } });
  await prisma.$disconnect();
});

// ─── POST /vendor/api/v1/foods ────────────────────────────────────────────────
describe("POST /vendor/api/v1/foods", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/foods")
      .send({ restaurantId, name: "Jollof Rice", price: 25 });
    expect(res.status).toBe(401);
  });

  it("creates a food item for an authenticated vendor", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/foods")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ restaurantId, name: "Jollof Rice", price: 25 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Jollof Rice");
    expect(res.body.data.restaurantId).toBe(restaurantId);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/foods")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ restaurantId });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when price is invalid", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/foods")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ restaurantId, name: "Bad Food", price: -5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 when restaurant does not exist", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/foods")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ restaurantId: "999999999", name: "Ghost Food", price: 10 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /vendor/api/v1/foods/:id ────────────────────────────────────────────
describe("PUT /vendor/api/v1/foods/:id", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app)
      .put(`/vendor/api/v1/foods/${foodId}`)
      .send({ name: "Updated Name" });
    expect(res.status).toBe(401);
  });

  it("updates a food item for the authenticated vendor", async () => {
    const res = await request(app)
      .put(`/vendor/api/v1/foods/${foodId}`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ name: "Updated Jollof", price: 30 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Updated Jollof");
  });

  it("returns 404 for a non-existent food item", async () => {
    const res = await request(app)
      .put(`/vendor/api/v1/foods/999999999`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /vendor/api/v1/foods/:id ─────────────────────────────────────────
describe("DELETE /vendor/api/v1/foods/:id", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).delete(`/vendor/api/v1/foods/${foodId}`);
    expect(res.status).toBe(401);
  });

  it("deletes a food item for the authenticated vendor", async () => {
    // Create a food item specifically to delete so we don't affect other tests
    const food = await prisma.food.create({
      data: { restaurantId: BigInt(restaurantId), name: "To Delete", price: 10 },
    });

    const res = await request(app)
      .delete(`/vendor/api/v1/foods/${food.id.toString()}`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 for a non-existent food item", async () => {
    const res = await request(app)
      .delete(`/vendor/api/v1/foods/999999999`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /vendor/api/v1/foods/:foodId/addons ─────────────────────────────────
describe("POST /vendor/api/v1/foods/:foodId/addons", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app)
      .post(`/vendor/api/v1/foods/${foodId}/addons`)
      .send({ addonId });
    expect(res.status).toBe(401);
  });

  it("links an addon to a food item", async () => {
    const res = await request(app)
      .post(`/vendor/api/v1/foods/${foodId}/addons`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ addonId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("returns 400 when addonId is missing", async () => {
    const res = await request(app)
      .post(`/vendor/api/v1/foods/${foodId}/addons`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /vendor/api/v1/foods/:foodId/addons/:addonId ──────────────────────
describe("DELETE /vendor/api/v1/foods/:foodId/addons/:addonId", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app)
      .delete(`/vendor/api/v1/foods/${foodId}/addons/${addonId}`);
    expect(res.status).toBe(401);
  });

  it("unlinks an addon from a food item", async () => {
    // Ensure it is linked first
    await prisma.foodAddon.upsert({
      where: { foodId_addonId: { foodId: BigInt(foodId), addonId: BigInt(addonId) } },
      create: { foodId: BigInt(foodId), addonId: BigInt(addonId) },
      update: {},
    });

    const res = await request(app)
      .delete(`/vendor/api/v1/foods/${foodId}/addons/${addonId}`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
