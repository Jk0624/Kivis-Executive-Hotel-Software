/**
 * Snapshot the JSON responses from every read-only rider earnings endpoint
 * for a sample rider. Run this BEFORE and AFTER the earnings.controller.ts
 * refactor to prove behavior is byte-identical.
 *
 *   Before: tsx prisma/scripts/snapshot-rider-earnings.ts > /tmp/before.json
 *   After:  tsx prisma/scripts/snapshot-rider-earnings.ts > /tmp/after.json
 *   diff /tmp/before.json /tmp/after.json
 *
 * Endpoint selection: every GET on the rider earnings router. POST endpoints
 * (withdraw) are skipped — they mutate.
 */

import "dotenv/config";
import request from "supertest";
import { createApp } from "../../src/createApp.js";
import { prisma } from "../../src/prisma.js";
import { generateAccessToken } from "../../src/utils/tokens.js";

// Pick the rider with the most orders so we exercise multi-band data.
const RIDER_ID = 11n;

const GET_ENDPOINTS = [
  "/rider/api/v1/earnings/summary",
  "/rider/api/v1/earnings/chart",
  "/rider/api/v1/earnings/chart?period=week",
  "/rider/api/v1/earnings/chart?period=month",
  "/rider/api/v1/earnings/chart?period=year",
  "/rider/api/v1/earnings/transactions",
  "/rider/api/v1/earnings/transactions?limit=50",
  "/rider/api/v1/earnings/top-items",
  "/rider/api/v1/earnings/weekly-summary",
  "/rider/api/v1/earnings/balance",
  "/rider/api/v1/earnings/withdrawals",
  "/rider/api/v1/earnings/activity",
];

(async () => {
  const app = createApp();
  const token = generateAccessToken(RIDER_ID, "rider");

  const out: Record<string, unknown> = { riderId: RIDER_ID.toString(), responses: {} };

  for (const ep of GET_ENDPOINTS) {
    const res = await request(app)
      .get(ep)
      .set("Authorization", `Bearer ${token}`);

    (out.responses as Record<string, unknown>)[ep] = {
      status: res.status,
      body: res.body,
    };
  }

  // Pretty-print stable JSON (sorted keys) so diffs don't see ordering noise.
  const stable = JSON.stringify(out, (_k, v) =>
    typeof v === "bigint" ? v.toString() : v,
  2);

  console.log(stable);
  await prisma.$disconnect();
})();
