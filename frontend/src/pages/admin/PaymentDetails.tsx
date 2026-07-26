import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

function PaymentDetails() {
  const { paymentId } = useParams();

  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      const response = await api.get(
        `/admin/payments/${paymentId}`
      );

      setPayment(response.data);
    } catch (error) {
      console.error("Failed to load payment:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-slate-900">
          Payment Details
        </h1>

        <Link
          to="/admin/revenue"
          className="rounded-lg bg-slate-700 px-4 py-2 text-white transition hover:bg-slate-800"
        >
          ← Back to Revenue & Payments
        </Link>
      </div>

      {!payment ? (
        <p className="mt-3 text-gray-600">
          Loading payment details...
        </p>
      ) : (
        <>
          {/* Payment Information */}
          <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold">
              Payment Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Reference</p>
                <p className="font-medium">{payment.reference}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>

                <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    payment.status === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                    {payment.status}
                </span>
                </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  {payment.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Method</p>
                <p className="font-medium">
                  {payment.method}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium">
                  {payment.provider || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="font-medium">
                  {payment.purpose}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Paid At</p>
                <p className="font-medium">
                  {new Date(
                    payment.paidAt
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold">
              Guest Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Guest Name
                </p>
                <p className="font-medium">
                  {payment.guest.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Phone Number
                </p>
                <p className="font-medium">
                  {payment.guest.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold">
              Booking Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Booking ID
                </p>
                <p className="font-medium">
                  {payment.booking.bookingId}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Booking Status
                </p>
                <p className="font-medium">
                  {payment.booking.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Check-In
                </p>
                <p className="font-medium">
                  {new Date(
                    payment.booking.checkIn
                  ).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Check-Out
                </p>
                <p className="font-medium">
                  {new Date(
                    payment.booking.checkOut
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold">
              Room Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Room Number
                </p>
                <p className="font-medium">
                  {payment.room.roomNo}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Room Type
                </p>
                <p className="font-medium">
                  {payment.room.type}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Room Price
                </p>
                <p className="font-medium">
                  GHS {payment.room.price}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default PaymentDetails;