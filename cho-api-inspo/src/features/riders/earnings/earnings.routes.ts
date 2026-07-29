import { Router } from "express";
import {
  getEarningsSummary,
  getEarningsChart,
  getRecentTransactions,
  getTopSellingItems,
  getWeeklyEarningsSummary,
  getEarningsBalance,
  requestWithdrawal,
  getWithdrawalRequests,
  getActivity,
} from "./earnings.controller.js";

const router = Router();

router.get("/summary", getEarningsSummary);
router.get("/chart", getEarningsChart);
router.get("/transactions", getRecentTransactions);
router.get("/top-items", getTopSellingItems);
router.get("/weekly-summary", getWeeklyEarningsSummary);
router.get("/balance", getEarningsBalance);
router.post("/withdraw", requestWithdrawal);
router.get("/withdrawals", getWithdrawalRequests);
router.get("/activity", getActivity);

export default router;
