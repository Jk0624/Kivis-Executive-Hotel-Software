import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import { notify } from "../../utils/notify";

function Revenue() {
  const [summary, setSummary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRevenueData = async () => {
    try {
      setLoading(true);

      const [summaryResponse, paymentsResponse] =
        await Promise.all([
          api.get("/admin/payments/revenue-summary"),
          api.get("/admin/payments"),
        ]);

      setSummary(summaryResponse.data);
      setPayments(paymentsResponse.data);
    } catch (error) {
      console.error(error);

      notify.error(
        "Failed to load revenue information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, []);

  const formatCurrency = (amount: number) =>
    `GHS ${Number(amount ?? 0).toFixed(2)}`;

  const statusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "SUCCESS":
        return "bg-green-100 text-green-700";

      case "PENDING":
        return "bg-amber-100 text-amber-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-4xl font-bold text-slate-900">
        Revenue & Payments
      </h1>

      <p className="mt-3 text-slate-600">
        Monitor revenue performance and review
        all payment transactions.
      </p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

            <p className="text-slate-500">
              Loading revenue dashboard...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Revenue
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {formatCurrency(
                  summary?.totalRevenue
                )}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Today's Revenue
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {formatCurrency(
                  summary?.todayRevenue
                )}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                This Month
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {formatCurrency(
                  summary?.monthRevenue
                )}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Online Payments
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {summary?.onlinePayments ?? 0}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Cash Payments
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {summary?.cashPayments ?? 0}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Transactions
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {summary?.totalTransactions ??
                  0}
              </h2>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-8 py-6">
              <h2 className="text-2xl font-semibold text-slate-900">
                Payment Transactions
              </h2>
            </div>

            {payments.length === 0 ? (
              <div className="py-20 text-center">
                <h3 className="text-xl font-semibold text-slate-700">
                  No Payment Records
                </h3>

                <p className="mt-2 text-slate-500">
                  Payment transactions will
                  appear here once bookings are
                  paid.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Reference
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Booking ID
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Guest
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Room
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Method
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Status
                      </th>

                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5 font-mono text-sm">
                          {payment.reference}
                        </td>

                        <td className="px-6 py-5">
                          {payment.bookingId}
                        </td>

                        <td className="px-6 py-5 font-medium">
                          {payment.guestName}
                        </td>

                        <td className="px-6 py-5">
                          {payment.roomNo}
                        </td>

                        <td className="px-6 py-5 font-semibold">
                          {formatCurrency(
                            payment.amount
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {payment.method}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <Link
                            to={`/admin/payments/${payment.id}`}
                            className="inline-flex rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default Revenue;