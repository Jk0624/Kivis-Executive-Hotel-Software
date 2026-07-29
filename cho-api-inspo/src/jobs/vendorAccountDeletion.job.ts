import cron from "node-cron";
import { prisma } from "../prisma.js";

const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_BATCH_SIZE = 100;

function getCronSchedule(): string {
  const raw = process.env.VENDOR_ACCOUNT_DELETION_CRON?.trim();
  if (raw && cron.validate(raw)) return raw;
  if (raw) {
    console.warn(
      `[vendorAccountDeletion] invalid VENDOR_ACCOUNT_DELETION_CRON="${raw}", falling back to "0 0 * * *"`,
    );
  }
  return "0 0 * * *";
}

export async function purgeDeletedVendorAccounts(now = new Date()) {
  const cutoff = new Date(
    now.getTime() - DEFAULT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );

  const vendors = await prisma.vendor.findMany({
    where: {
      isActive: false,
      deletionRequestedAt: { lte: cutoff },
    },
    select: { id: true },
    take: DEFAULT_BATCH_SIZE,
  });

  if (vendors.length === 0) return { scanned: 0, deleted: 0 };

  const ids = vendors.map((vendor) => vendor.id);
  const result = await prisma.vendor.deleteMany({
    where: { id: { in: ids } },
  });

  return { scanned: vendors.length, deleted: result.count };
}

export function startVendorAccountDeletionJob() {
  const schedule = getCronSchedule();

  cron.schedule(schedule, async () => {
    try {
      const result = await purgeDeletedVendorAccounts();
      if (result.scanned > 0) {
        console.log(
          `[vendorAccountDeletion] hard-deleted ${result.deleted}/${result.scanned} vendor account(s)`,
        );
      }
    } catch (err) {
      console.error("[vendorAccountDeletion] sweep failed:", err);
    }
  });

  console.log(`[vendorAccountDeletion] scheduled "${schedule}"`);
}
