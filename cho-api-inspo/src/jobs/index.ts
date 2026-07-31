import { startOrderExpiryJob } from "./orderExpiry.job.js";
import { startDelayedOrderNotifyJob } from "./delayedOrder.job.js";
import { startRiderAccountDeletionJob } from "./riderAccountDeletion.job.js";
import { startVendorAccountDeletionJob } from "./vendorAccountDeletion.job.js";

export function startJobs() {
  startOrderExpiryJob();
  startDelayedOrderNotifyJob();
  startRiderAccountDeletionJob();
  startVendorAccountDeletionJob();
  console.log("✅ Background jobs started");
}
