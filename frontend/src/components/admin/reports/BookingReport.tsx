import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

interface BookingStatistics {
  totalBookings: number;
  pendingBookings: number;
  paidBookings: number;
  checkedInBookings: number;
  checkedOutBookings: number;
  cancelledBookings: number;
}

interface Booking {
  id: string;
  bookingId: string;
  guestName: string;
  guestPhone: string;
  roomNo: string;
  roomType: string;
  status: string;
  paymentStatus: string | null;
  checkIn: string;
  checkOut: string;
  createdAt: string;
}

export default function BookingReport() {
  const [statistics, setStatistics] =
    useState<BookingStatistics | null>(null);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);

      const [statsResponse, bookingsResponse] =
        await Promise.all([
          api.get("/admin/bookings/statistics"),
          api.get("/admin/bookings"),
        ]);

      setStatistics(statsResponse.data);

      setBookings(
        bookingsResponse.data.bookings ??
          bookingsResponse.data
      );
    } catch (error) {
      console.error(error);
      alert("Failed to load booking report.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const keyword = search.toLowerCase();

    return bookings.filter((booking) => {
      return (
        booking.bookingId
          .toLowerCase()
          .includes(keyword) ||

        booking.guestName
          .toLowerCase()
          .includes(keyword) ||

        booking.roomNo
          .toLowerCase()
          .includes(keyword) ||

        booking.status
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [bookings, search]);

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "PAID":
        return "bg-green-100 text-green-700";

      case "CHECKED_IN":
        return "bg-blue-100 text-blue-700";

      case "CHECKED_OUT":
        return "bg-slate-200 text-slate-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusClass = (
  status: string | null
) => {
  switch (status) {
    case "SUCCESS":
      return "bg-green-100 text-green-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "FAILED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        Loading booking report...
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-red-500">
        Unable to load booking report.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <StatCard
          title="Total Bookings"
          value={statistics.totalBookings}
        />

        <StatCard
          title="Pending"
          value={statistics.pendingBookings}
          color="text-yellow-600"
        />

        <StatCard
          title="Paid"
          value={statistics.paidBookings}
          color="text-green-600"
        />

        <StatCard
          title="Checked In"
          value={statistics.checkedInBookings}
          color="text-blue-600"
        />

        <StatCard
          title="Checked Out"
          value={statistics.checkedOutBookings}
          color="text-slate-700"
        />

        <StatCard
          title="Cancelled"
          value={statistics.cancelledBookings}
          color="text-red-600"
        />

      </div>

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b p-6">

          <h2 className="text-xl font-semibold">
            Booking Records
          </h2>

          <input
            type="text"
            placeholder="Search booking, guest, room or status..."
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
                  Booking
                </th>

                <th className="px-4 py-3 text-left">
                  Guest
                </th>

                <th className="px-4 py-3 text-left">
                  Room
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-left">
                Payment
                </th>

                <th className="px-4 py-3 text-left">
                  Check-In
                </th>

                <th className="px-4 py-3 text-left">
                  Check-Out
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredBookings.length === 0 ? (
                <tr>

                  <td
                    colSpan={7}
                    className="py-10 text-center text-slate-500"
                  >
                    No bookings found.
                  </td>

                </tr>
              ) : (
                filteredBookings.map(
                  (booking) => (
                    <tr
                      key={booking.id}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="px-4 py-4 font-medium">
                        {booking.bookingId}
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">
                            {booking.guestName}
                          </p>

                          <p className="text-sm text-slate-500">
                            {booking.guestPhone}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {booking.roomNo}
                      </td>

                      <td className="px-4 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {booking.status.replace(
                            /_/g,
                            " "
                          )}
                        </span>

                      </td>

                      <td className="px-4 py-4">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClass(
                            booking.paymentStatus
                            )}`}
                        >
                            {booking.paymentStatus ?? "UNPAID"}
                        </span>
                        </td>

                      <td className="px-4 py-4">
                        {new Date(
                          booking.checkIn
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4">
                        {new Date(
                          booking.checkOut
                        ).toLocaleDateString()}
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
  value: number;
  color?: string;
}

function StatCard({
  title,
  value,
  color = "text-slate-900",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className={`mt-3 text-4xl font-bold ${color}`}>
        {value}
      </h2>

    </div>
  );
}