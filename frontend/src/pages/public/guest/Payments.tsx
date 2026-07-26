import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CreditCard,
  Receipt,
  Wallet,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import api from "../../../services/api";

interface Payment {
  paymentId: string;
  paymentMethod: string;
  purpose: string;
  paymentStatus: string;
  amount: number;
}

interface PaymentHistoryResponse {
  message: string;
  payments: Payment[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);
}

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "successful":
      return "bg-emerald-100 border-emerald-200 text-emerald-700";

    case "pending":
      return "bg-yellow-100 border-yellow-200 text-yellow-700";

    case "failed":
      return "bg-red-100 border-red-200 text-red-700";

    default:
      return "bg-slate-100 border-slate-200 text-slate-700";
  }
}

function formatPaymentMethod(method: string) {
  switch (method.toUpperCase()) {
    case "PAYSTACK":
      return "Paystack";

    case "MANUAL":
      return "Cash";

    default:
      return method;
  }
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<PaymentHistoryResponse>(
          "/payments/history"
        );

      setPayments(response.data.payments);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
            "Unable to load payment history."
        );
      } else {
        setError("Unable to load payment history.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalAmount = useMemo(() => {
    return payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
  }, [payments]);

  const completedPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        payment.paymentStatus.toLowerCase() ===
        "successful"
    ).length;
  }, [payments]);

  const paymentMethods = useMemo(() => {
    return [
      ...new Set(
        payments.map((payment) =>
          formatPaymentMethod(payment.paymentMethod)
        )
      ),
    ].join(", ");
  }, [payments]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">

        {/* Header */}

        <div className="border-b bg-white">

          <div className="mx-auto max-w-7xl px-6 py-10">

            <h1 className="text-4xl font-bold text-slate-900">
              Payment History
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              View all payments you've made for your
              bookings at Kiviz Executive Lodge.
            </p>

          </div>

        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
                      {/* Summary Cards */}

          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Paid
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {formatCurrency(totalAmount)}
                  </h2>

                </div>

                <div className="rounded-xl bg-emerald-100 p-3">
                  <Wallet className="h-7 w-7 text-emerald-600" />
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Successful Payments
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {completedPayments}
                  </h2>

                </div>

                <div className="rounded-xl bg-blue-100 p-3">
                  <CheckCircle2 className="h-7 w-7 text-blue-600" />
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Payment Methods
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {paymentMethods || "—"}
                  </h2>

                </div>

                <div className="rounded-xl bg-yellow-100 p-3">
                  <CreditCard className="h-7 w-7 text-yellow-600" />
                </div>

              </div>

            </div>

          </div>

          {/* Loading */}

          {loading && (

            <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 shadow-sm">

              <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

              <p className="mt-6 text-lg font-medium text-slate-700">
                Loading your payment history...
              </p>

            </div>

          )}

          {/* Error */}

          {!loading && error && (

            <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />

              <h2 className="mt-5 text-xl font-semibold text-red-700">
                Unable to Load Payment History
              </h2>

              <p className="mt-3 text-red-600">
                {error}
              </p>

              <button
                onClick={fetchPayments}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw className="h-5 w-5" />
                Retry
              </button>

            </div>

          )}

          {/* Empty State */}

          {!loading &&
            !error &&
            payments.length === 0 && (

              <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white py-24 text-center shadow-sm">

                <Receipt className="mx-auto h-16 w-16 text-slate-300" />

                <h2 className="mt-6 text-2xl font-bold text-slate-800">
                  No Payment History
                </h2>

                <p className="mt-3 text-slate-500">
                  You haven't made any payments yet.
                </p>

              </div>

            )}

          {/* Payment Cards */}

          {!loading &&
            !error &&
            payments.length > 0 && (

              <div className="mt-10 space-y-8">
                                {payments.map((payment) => (

                  <div
                    key={payment.paymentId}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* Card Header */}

                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>

                          <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
                            Payment Reference
                          </p>

                          <h2 className="mt-2 flex items-center gap-2 text-2xl font-bold text-white">

                            <Receipt className="h-6 w-6 text-yellow-400" />

                            {payment.paymentId}

                          </h2>

                        </div>

                        <span
                          className={`inline-flex w-fit rounded-full border px-5 py-2 text-sm font-semibold ${getStatusClasses(
                            payment.paymentStatus
                          )}`}
                        >
                          {payment.paymentStatus}
                        </span>

                      </div>

                    </div>

                    {/* Card Body */}

                    <div className="grid gap-8 p-8 lg:grid-cols-2">

                      {/* Left Column */}

                      <div className="space-y-6">

                        <div>

                          <p className="text-sm font-medium uppercase tracking-widest text-slate-400">
                            Payment Purpose
                          </p>

                          <h3 className="mt-2 text-2xl font-bold text-slate-900">
                            {payment.purpose}
                          </h3>

                        </div>

                        <div className="rounded-2xl bg-slate-50 p-6">

                          <div className="flex items-center gap-3">

                            <CreditCard className="h-5 w-5 text-yellow-500" />

                            <span className="text-sm font-semibold text-slate-500">
                              Payment Method
                            </span>

                          </div>

                          <p className="mt-3 text-lg font-semibold text-slate-900">
                            {formatPaymentMethod(
                              payment.paymentMethod
                            )}
                          </p>

                        </div>

                      </div>

                      {/* Right Column */}

                      <div className="rounded-3xl bg-gradient-to-br from-yellow-50 to-white p-8">

                        <h3 className="text-xl font-bold text-slate-900">
                          Payment Summary
                        </h3>

                        <div className="mt-8 space-y-5">

                          <div className="flex items-center justify-between border-b border-slate-200 pb-4">

                            <span className="text-slate-500">
                              Amount Paid
                            </span>

                            <span className="font-semibold text-slate-900">
                              {formatCurrency(payment.amount)}
                            </span>

                          </div>

                          <div className="flex items-center justify-between border-b border-slate-200 pb-4">

                            <span className="text-slate-500">
                              Status
                            </span>

                            <span className="font-semibold text-slate-900">
                              {payment.paymentStatus}
                            </span>

                          </div>

                          <div className="flex items-center justify-between pt-2">

                            <span className="text-lg font-semibold text-slate-700">
                              Payment Method
                            </span>

                            <span className="text-xl font-bold text-yellow-600">
                              {formatPaymentMethod(
                                payment.paymentMethod
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                ))}
                              </div>

            )}

        </div>

      </div>

    </MainLayout>
  );
}