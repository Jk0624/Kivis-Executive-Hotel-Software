import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import api from "../../../services/api";

interface VerificationResponse {
  message: string;
  bookingReference: string;
  paymentReference: string;
  paymentStatus: string;
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const reference =
    searchParams.get("reference");

  const [loading, setLoading] =
    useState(true);

  const [success, setSuccess] =
    useState(false);

  const [message, setMessage] =
    useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setLoading(false);
        setSuccess(false);
        setMessage(
          "Payment reference not found."
        );
        return;
      }

      try {
        const { data } =
          await api.get<VerificationResponse>(
            `/payments/verify/${reference}`
          );

        setSuccess(true);
        setMessage(data.message);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setMessage(
            error.response?.data?.message ??
              "Unable to verify payment."
          );
        } else {
          setMessage(
            "Unable to verify payment."
          );
        }

        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference]);

  return (
    <MainLayout>
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-xl">

          {loading ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-14 w-14 animate-spin text-yellow-500" />

              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                Verifying Payment
              </h2>

              <p className="mt-3 text-slate-600">
                Please wait while we confirm your payment.
              </p>
            </div>
          ) : success ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />

              <h2 className="mt-6 text-3xl font-bold text-slate-900">
                Payment Successful
              </h2>

              <p className="mt-4 text-slate-600">
                {message}
              </p>

              <button
                onClick={() =>
                  navigate("/guest/bookings")
                }
                className="mt-8 w-full rounded-xl bg-green-600 py-4 font-semibold text-white transition hover:bg-green-700"
              >
                Go to My Bookings
              </button>
            </div>
          ) : (
            <div className="text-center">
              <AlertCircle className="mx-auto h-16 w-16 text-red-600" />

              <h2 className="mt-6 text-3xl font-bold text-slate-900">
                Verification Failed
              </h2>

              <p className="mt-4 text-slate-600">
                {message}
              </p>

              <button
                onClick={() =>
                  navigate("/guest/bookings")
                }
                className="mt-8 w-full rounded-xl bg-slate-800 py-4 font-semibold text-white transition hover:bg-slate-900"
              >
                Return to My Bookings
              </button>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}