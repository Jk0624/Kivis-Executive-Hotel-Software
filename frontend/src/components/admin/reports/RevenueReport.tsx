import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

interface RevenueSummary {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  onlinePayments: number;
  cashPayments: number;
  totalTransactions: number;
}

interface Payment {
  id: string;
  reference: string;
  bookingId: string;
  guestName: string;
  guestPhone: string;
  roomNo: string;
  purpose: string;
  method: string;
  provider: string;
  amount: number;
  status: string;
  paidAt: string;
}

export default function RevenueReport() {
  const [summary, setSummary] =
    useState<RevenueSummary | null>(null);

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchRevenueReport();
  }, []);

  const fetchRevenueReport = async () => {
    try {
      setLoading(true);

      const [summaryResponse, paymentsResponse] =
        await Promise.all([
          api.get("/admin/payments/revenue-summary"),
          api.get("/admin/reports/revenue"),
        ]);

      setSummary(summaryResponse.data);

      setPayments(
        paymentsResponse.data ?? []
      );
    } catch (error) {
      console.error(error);
      alert("Failed to load revenue report.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    const keyword = search.toLowerCase();

    return payments.filter((payment) => {
      return (
        payment.reference
          .toLowerCase()
          .includes(keyword) ||

        payment.bookingId
          .toLowerCase()
          .includes(keyword) ||

        payment.guestName
          .toLowerCase()
          .includes(keyword) ||

        payment.roomNo
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [payments, search]);

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getMethodClass = (
    method: string
  ) => {
    switch (method) {
      case "ONLINE":
        return "bg-blue-100 text-blue-700";

      case "CASH":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        Loading revenue report...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-red-500">
        Unable to load revenue report.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <StatCard
          title="Total Revenue"
          value={`GHS ${summary.totalRevenue.toFixed(2)}`}
        />

        <StatCard
          title="Today's Revenue"
          value={`GHS ${summary.todayRevenue.toFixed(2)}`}
        />

        <StatCard
          title="This Month"
          value={`GHS ${summary.monthRevenue.toFixed(2)}`}
        />

        <StatCard
          title="Online Payments"
          value={summary.onlinePayments}
        />

        <StatCard
          title="Cash Payments"
          value={summary.cashPayments}
        />

        <StatCard
          title="Transactions"
          value={summary.totalTransactions}
        />

      </div>

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b p-6">

          <h2 className="text-xl font-semibold">
            Payment Transactions
          </h2>

          <input
            type="text"
            placeholder="Search payment, booking, guest or room..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="mt-4 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          />

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-4 py-3 text-left">
                  Reference
                </th>

                <th className="px-4 py-3 text-left">
                  Guest
                </th>

                <th className="px-4 py-3 text-left">
                  Booking
                </th>

                <th className="px-4 py-3 text-left">
                  Room
                </th>

                <th className="px-4 py-3 text-left">
                  Amount
                </th>

                <th className="px-4 py-3 text-left">
                  Method
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-left">
                  Paid At
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredPayments.length === 0 ? (
                <tr>

                  <td
                    colSpan={8}
                    className="py-10 text-center text-slate-500"
                  >
                    No payment records found.
                  </td>

                </tr>
              ) : (
                filteredPayments.map(
                  (payment) => (
                    <tr
                      key={payment.id}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="px-4 py-4 font-medium">
                        {payment.reference}
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">
                            {payment.guestName}
                          </p>

                          <p className="text-sm text-slate-500">
                            {payment.guestPhone}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {payment.bookingId}
                      </td>

                      <td className="px-4 py-4">
                        {payment.roomNo}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        GHS {payment.amount.toFixed(2)}
                      </td>

                      <td className="px-4 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getMethodClass(
                            payment.method
                          )}`}
                        >
                          {payment.method}
                        </span>

                      </td>

                      <td className="px-4 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>

                      </td>

                      <td className="px-4 py-4">
                        {new Date(
                          payment.paidAt
                        ).toLocaleString()}
                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
}

function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </h2>

    </div>
  );
}