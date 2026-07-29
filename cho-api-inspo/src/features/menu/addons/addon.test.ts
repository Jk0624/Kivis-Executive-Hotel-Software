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
let addonId: string;

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  const password = await hashPassword("Test1234!");

  const vendorA = await prisma.vendor.create({
    data: {
      firstName: "TestVendorA",
      lastName: "Addon",
      email: `vendor-addon-a-${Date.now()}@test.com`,
      phone: `+2332${Date.now().toString().slice(-8)}`,
      password,
      isPersonalInfoComplete: true,
    },
  });
  vendorToken = generateAccessToken(vendorA.id, "vendor");

  const vendorB = await prisma.vendor.create({
    data: {
      firstName: "TestVendorB",
      lastName: "Addon",
      email: `vendor-addon-b-${Date.now()}@test.com`,
      phone: `+2333${Date.now().toString().slice(-8)}`,
      password,
      isPersonalInfoComplete: true,
    },
  });
  otherVendorToken = generateAccessToken(vendorB.id, "vendor");

  const restaurantA = await prisma.restaurant.create({
    data: {
      vendorId: vendorA.id,
      name: "Addon Restaurant A",
      addressLine: "123 Addon St",
      latitude: 5.6037,
      longitude: -0.187,
    },
  });
  restaurantId = restaurantA.id.toString();

  const restaurantB = await prisma.restaurant.create({
    data: {
      vendorId: vendorB.id,
      name: "Addon Restaurant B",
      addressLine: "456 Addon Ave",
      latitude: 5.6037,
      longitude: -0.187,
    },
  });
  otherRestaurantId = restaurantB.id.toString();

  // Pre-created addon for update/delete tests
  const addon = await prisma.addon.create({
    data: {
      restaurantId: restaurantA.id,
      name: "Existing Addon",
      price: 3,
      tag: "sauce",
      frontendComponent: "checkbox",
    },
  });
  addonId = addon.id.toString();
});

afterAll(async () => {
  await prisma.addon.deleteMany({
    where: { restaurantId: { in: [BigInt(restaurantId), BigInt(otherRestaurantId)] } },
  });
  await prisma.restaurant.deleteMany({
    where: { id: { in: [BigInt(restaurantId), BigInt(otherRestaurantId)] } },
  });
  await prisma.vendor.deleteMany({ where: { email: { contains: "vendor-addon-" } } });
  await prisma.$disconnect();
});

// ─── POST /vendor/api/v1/addons ───────────────────────────────────────────────
describe("POST /vendor/api/v1/addons", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/addons")
      .send({ restaurantId, name: "Extra Sauce", price: 2, tag: "sauce" });
    expect(res.status).toBe(401);
  });

  it("creates an addon for an authenticated vendor", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/addons")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ restaurantId, name: "Extra Sauce", price: 2, tag: "sauce" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Extra Sauce");
    expect(res.body.data.tag).toBe("sauce");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/addons")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ restaurantId, name: "Missing Tag" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for invalid addon tag", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/addons")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ restaurantId, name: "Bad Tag", price: 2, tag: "invalid_tag" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 403 when vendor tries to add addon to another vendor's restaurant", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/addons")
      .set("Authorization", `Bearer ${otherVendorToken}`)
      .send({ restaurantId, name: "Stolen Addon", price: 2, tag: "sauce" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /vendor/api/v1/addons/:id ────────────────────────────────────────────
describe("PUT /vendor/api/v1/addons/:id", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app)
      .put(`/vendor/api/v1/addons/${addonId}`)
      .send({ name: "Updated Addon" });
    expect(res.status).toBe(401);
  });

  it("updates an addon for the authenticated vendor", async () => {
    const res = await request(app)
      .put(`/vendor/api/v1/addons/${addonId}`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ name: "Updated Sauce", price: 4 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Updated Sauce");
  });

  it("returns 403 when another vendor tries to update the addon", async () => {
    const res = await request(app)
      .put(`/vendor/api/v1/addons/${addonId}`)
      .set("Authorization", `Bearer ${otherVendorToken}`)
      .send({ name: "Hijacked Addon" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for a non-existent addon", async () => {
    const res = await request(app)
      .put(`/vendor/api/v1/addons/999999999`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /vendor/api/v1/addons/:id ─────────────────────────────────────────
describe("DELETE /vendor/api/v1/addons/:id", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app).delete(`/vendor/api/v1/addons/${addonId}`);
    expect(res.status).toBe(401);
  });

  it("returns 403 when another vendor tries to delete the addon", async () => {
    const res = await request(app)
      .delete(`/vendor/api/v1/addons/${addonId}`)
      .set("Authorization", `Bearer ${otherVendorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("deletes an addon for the authenticated vendor", async () => {
    const addon = await prisma.addon.create({
      data: {
        restaurantId: BigInt(restaurantId),
        name: "To Delete Addon",
        price: 1,
        tag: "sides",
        frontendComponent: "checkbox",
      },
    });

    const res = await request(app)
      .delete(`/vendor/api/v1/addons/${addon.id.toString()}`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 for a non-existent addon", async () => {
    const res = await request(app)
      .delete(`/vendor/api/v1/addons/999999999`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
