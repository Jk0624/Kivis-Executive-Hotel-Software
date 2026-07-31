import cron from "node-cron";
import { prisma } from "../prisma.js";

const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_BATCH_SIZE = 100;

function getCronSchedule(): string {
  const raw = process.env.RIDER_ACCOUNT_DELETION_CRON?.trim();
  if (raw && cron.validate(raw)) return raw;
  if (raw) {
    console.warn(
      `[riderAccountDeletion] invalid RIDER_ACCOUNT_DELETION_CRON="${raw}", falling back to "0 0 * * *"`,
    );
  }
  return "0 0 * * *";
}

export async function purgeDeletedRiderAccounts(now = new Date()) {
  const cutoff = new Date(
    now.getTime() - DEFAULT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );

  const riders = await prisma.rider.findMany({
    where: {
      isActive: false,
      deletionRequestedAt: { lte: cutoff },
    },
    select: { id: true },
    take: DEFAULT_BATCH_SIZE,
  });

  if (riders.length === 0) return { scanned: 0, deleted: 0 };

  const ids = riders.map((rider) => rider.id);
  const result = await prisma.rider.deleteMany({
    where: { id: { in: ids } },
  });

  return { scanned: riders.length, deleted: result.count };
}

export function startRiderAccountDeletionJob() {
  const schedule = getCronSchedule();

  cron.schedule(schedule, async () => {
    try {
      const result = await purgeDeletedRiderAccounts();
      if (result.scanned > 0) {
        console.log(
          `[riderAccountDeletion] hard-deleted ${result.deleted}/${result.scanned} rider account(s)`,
        );
      }
    } catch (err) {
      console.error("[riderAccountDeletion] sweep failed:", err);
    }
  });

  console.log(`[riderAccountDeletion] scheduled "${schedule}"`);
}
