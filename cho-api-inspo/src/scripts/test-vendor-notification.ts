import "dotenv/config";
import { prisma } from "../prisma.js";
import { createVendorNotification } from "../features/vendors/notification/notification.service.js";

type EventType = "NEW_ORDER" | "ORDER_CANCELLED";

const parseArgs = () => {
  const args = process.argv.slice(2);
  const eventType = (args[0] || "NEW_ORDER").toUpperCase() as EventType;
  const vendorId = args[1] || process.env.VENDOR_ID || "21";
  const orderId = args[2] || process.env.ORDER_ID || "CHO-TEST-1";

  if (eventType !== "NEW_ORDER" && eventType !== "ORDER_CANCELLED") {
    console.error(
      "Invalid event type. Use NEW_ORDER or ORDER_CANCELLED as first argument.",
    );
    process.exit(1);
  }

  return { eventType, vendorId, orderId };
};

async function main() {
  const { eventType, vendorId, orderId } = parseArgs();

  const vendor = await prisma.vendor.findUnique({
    where: { id: BigInt(vendorId) },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!vendor) {
    console.error(`Vendor ${vendorId} not found.`);
    process.exit(1);
  }

  const tokenCount = await prisma.deviceToken.count({
    where: { vendorId: BigInt(vendorId) },
  });

  console.log("--- Vendor notification test ---");
  console.log("Vendor:", vendorId, `${vendor.firstName} ${vendor.lastName}`);
  console.log("Registered device tokens:", tokenCount);
  console.log("Event:", eventType);
  console.log("Order ID:", orderId);

  if (tokenCount === 0) {
    console.warn(
      "No device tokens found for this vendor. Notification will be saved in DB but no push will reach a device.",
    );
  }

  const title =
    eventType === "NEW_ORDER" ? "New Order Received" : "Order Cancelled";
  const message =
    eventType === "NEW_ORDER"
      ? `New order #${orderId}. Accept or reject now.`
      : `Order #${orderId} has been cancelled by the customer.`;

  const result = await createVendorNotification({
    vendorId,
    title,
    message,
    type: "order",
    metadata: {
      eventType,
      orderId,
      restaurantId: "test-restaurant",
      occurredAt: new Date().toISOString(),
    },
  });

  console.log("Notification stored:", {
    id: result.id,
    vendorId: result.vendorId,
    title: result.title,
    type: result.type,
  });
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("Error running vendor notification test:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
