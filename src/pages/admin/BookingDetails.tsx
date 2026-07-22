import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

function BookingDetails() {
    const { bookingId } = useParams();

const [booking, setBooking] = useState<any>(null);
const [timeline, setTimeline] = useState<any[]>([]);

const fetchBooking = async () => { 
  try {
    const response = await api.get(
      `/admin/bookings/${bookingId}`
    );

    setBooking(response.data.booking);
  } catch (error) {
    console.error(error);
  }
};

const fetchTimeline = async () => {
  try {
    const response = await api.get(
      `/admin/bookings/${bookingId}/timeline`
    );

    console.log("Timeline items:", response.data.timeline);

    setTimeline(response.data.timeline);
  } catch (error) {
    console.error("Timeline error:", error);
  }
};


const cancelBooking = async () => {
  if (!bookingId) return;

  const reason = window.prompt(
    "Enter a reason for cancelling this booking (optional):"
  );

  const confirmed = window.confirm(
    "Are you sure you want to cancel this booking?"
  );

  if (!confirmed) return;

  try {
    await api.patch(`/admin/bookings/${bookingId}/cancel`, {
      reason: reason || undefined,
    });

    await fetchBooking();
    await fetchTimeline();

    alert("Booking cancelled successfully.");
  } catch (error: any) {
    console.error(error);

    alert(
      error?.response?.data?.message ||
        "Failed to cancel booking."
    );
  }
};



useEffect(() => {
  if (bookingId) {
  fetchBooking();
  fetchTimeline();
}
}, [bookingId]);



  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
  <h1 className="text-4xl font-bold text-slate-900">
    Booking Details
  </h1>

  <Link
    to="/admin/bookings"
    className="rounded-lg bg-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-800"
  >
    ← Back to Bookings
  </Link>
</div>

{booking && (
  <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

    <div className="grid gap-6 md:grid-cols-2">

      <div>
        <p className="text-sm text-gray-500">
          Booking Reference
        </p>

        <p className="font-semibold">
          {booking.bookingId}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Status
        </p>
        <p className="font-semibold">
          {booking.status}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Guest
        </p>
        <p className="font-semibold">
          {booking.user?.name || "Guest"}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Phone
        </p>
        <p className="font-semibold">
          {booking.user?.phone}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Room
        </p>
        <p className="font-semibold">
          {booking.room?.roomNo}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Room Type
        </p>
        <p className="font-semibold">
          {booking.room?.type}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Check In
        </p>
        <p className="font-semibold">
          {new Date(
            booking.checkIn
          ).toLocaleDateString()}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Check Out
        </p>
        <p className="font-semibold">
          {new Date(
            booking.checkOut
          ).toLocaleDateString()}
        </p>
      </div>

    </div>

  </div>
)}

{booking &&
  (booking.status === "PENDING" ||
    booking.status === "PAID") && (
    <div className="mt-6">
      <button
  onClick={cancelBooking}
  className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
>
  Cancel Booking
</button>
    </div>
)}

{booking && (
  <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

    <h2 className="mb-6 text-2xl font-semibold">
      Payment History
    </h2>

    {booking.payments.length === 0 ? (
      <p className="text-gray-500">
        No payment records found.
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-left">Purpose</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {booking.payments.map((payment: any) => (
              <tr key={payment.id} className="border-b">

                <td className="p-3">
                  {payment.reference}
                </td>

                <td className="p-3">
                  {payment.purpose}
                </td>

                <td className="p-3">
                  GHS {payment.amount}
                </td>

                <td className="p-3">
                  {payment.method}
                </td>

                <td className="p-3">
                  {payment.status}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    )}

  </div>
)}

{timeline.length > 0 && (
  <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

    <h2 className="mb-6 text-2xl font-semibold">
      Booking Timeline
    </h2>

    <div className="space-y-4">

      {timeline.map((event: any, index: number) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 p-4"
        >
          <p className="font-semibold">
            {event.type.replaceAll("_", " ")}
            </p>

            <p className="text-gray-600">
            {event.details}
            </p>

            <p className="text-sm text-gray-500">
            {new Date(event.date).toLocaleString()}
            </p>
        </div>
      ))}

    </div>

  </div>
)}
    </AdminLayout>
  );
}

export default BookingDetails;