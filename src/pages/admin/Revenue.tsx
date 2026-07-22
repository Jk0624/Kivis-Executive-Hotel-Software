import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

function Revenue() {
  const [summary, setSummary] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([]);


  useEffect(() => {
  fetchRevenueSummary();
  fetchPayments();
}, []);

const fetchRevenueSummary = async () => {
  try {
    const response = await api.get(
      "/admin/payments/revenue-summary"
    );

    setSummary(response.data);
  } catch (error) {
    console.error("Failed to load revenue summary:", error);
  }
};


const fetchPayments = async () => {
  try {
    const response = await api.get("/admin/payments");

    setPayments(response.data);
  } catch (error) {
    console.error("Failed to load payments:", error);
  }
};

  return (
    <AdminLayout>
      <h1 className="text-4xl font-bold text-slate-900">
        Revenue & Payments
      </h1>

      <p className="mt-3 text-gray-600">
        View revenue summaries, payment transactions, and payment details.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">Total Revenue</p>
    <h2 className="mt-2 text-2xl font-bold">
      GHS {summary?.totalRevenue ?? 0}
    </h2>
  </div>

  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">Today's Revenue</p>
    <h2 className="mt-2 text-2xl font-bold">
      GHS {summary?.todayRevenue ?? 0}
    </h2>
  </div>

  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">This Month</p>
    <h2 className="mt-2 text-2xl font-bold">
      GHS {summary?.monthRevenue ?? 0}
    </h2>
  </div>

  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">Online Payments</p>
    <h2 className="mt-2 text-2xl font-bold">
      {summary?.onlinePayments ?? 0}
    </h2>
  </div>

  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">Cash Payments</p>
    <h2 className="mt-2 text-2xl font-bold">
      {summary?.cashPayments ?? 0}
    </h2>
  </div>

  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">Total Transactions</p>
    <h2 className="mt-2 text-2xl font-bold">
      {summary?.totalTransactions ?? 0}
    </h2>
  </div>
</div>


<div className="mt-10 rounded-xl border bg-white shadow-sm overflow-x-auto">
  <table className="min-w-full">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-4 py-3 text-left">Reference</th>
        <th className="px-4 py-3 text-left">Booking ID</th>
        <th className="px-4 py-3 text-left">Guest</th>
        <th className="px-4 py-3 text-left">Room</th>
        <th className="px-4 py-3 text-left">Amount</th>
        <th className="px-4 py-3 text-left">Method</th>
        <th className="px-4 py-3 text-left">Status</th>
        <th className="px-4 py-3 text-left">Action</th>
      </tr>
    </thead>

    <tbody>
      {payments.map((payment) => (
        <tr key={payment.id} className="border-t">
          <td className="px-4 py-3">{payment.reference}</td>
          <td className="px-4 py-3">{payment.bookingId}</td>
          <td className="px-4 py-3">{payment.guestName}</td>
          <td className="px-4 py-3">{payment.roomNo}</td>
          <td className="px-4 py-3">
            GHS {payment.amount}
          </td>
          <td className="px-4 py-3">{payment.method}</td>
          <td className="px-4 py-3">{payment.status}</td>
          <td className="px-4 py-3">
            <Link
                to={`/admin/payments/${payment.id}`}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
                View
            </Link>
        </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </AdminLayout>
  );
}

export default Revenue;