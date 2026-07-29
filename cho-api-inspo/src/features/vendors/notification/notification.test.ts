import request from "supertest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../prisma.js";
import { hashPassword } from "../../../utils/password.js";
import { generateAccessToken } from "../../../utils/tokens.js";

const app = createApp();

describe("Vendor notification endpoints", () => {
  let vendorToken: string;
  let vendorId: bigint;
  let vendorEmail: string;

  beforeAll(async () => {
    const password = await hashPassword("Test1234!");
    vendorEmail = `vendor-notify-${Date.now()}@test.com`;

    const vendor = await prisma.vendor.create({
      data: {
        firstName: "Vendor",
        lastName: "Notify",
        email: vendorEmail,
        phone: `+2335${Date.now().toString().slice(-8)}`,
        password,
        isPersonalInfoComplete: true,
      },
    });

    vendorId = vendor.id;
    vendorToken = generateAccessToken(vendor.id, "vendor");
  });

  afterAll(async () => {
    await prisma.deviceToken.deleteMany({ where: { vendorId } });
    await prisma.notification.deleteMany({ where: { vendorId } });
    await prisma.vendor.deleteMany({ where: { email: vendorEmail } });
    await prisma.$disconnect();
  });

  it("registers vendor push token", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/notifications/push-token")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        pushToken: "ExponentPushToken[test-token-123]",
        platform: "android",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const tokenRow = await prisma.deviceToken.findFirst({
      where: { vendorId, pushToken: "ExponentPushToken[test-token-123]" },
    });
    expect(tokenRow).toBeTruthy();
  });

  it("send-test stores notification with vendor metadata contract", async () => {
    const res = await request(app)
      .post("/vendor/api/v1/notifications/send-test")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        title: "New Order Received",
        body: "New order #CHO-TEST. Accept or reject now.",
        metadata: {
          eventType: "NEW_ORDER",
          orderId: "12345",
          restaurantId: "999",
          occurredAt: "2026-01-01T00:00:00.000Z",
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe("general");

    const stored = await prisma.notification.findFirst({
      where: {
        vendorId,
        title: "New Order Received",
      },
      orderBy: { createdAt: "desc" },
    });

    expect(stored).toBeTruthy();
    expect(stored?.targetAudience).toBe("VENDOR");
    expect(stored?.metadata).toMatchObject({
      eventType: "NEW_ORDER",
      orderId: "12345",
      restaurantId: "999",
      occurredAt: "2026-01-01T00:00:00.000Z",
    });
  });
});
