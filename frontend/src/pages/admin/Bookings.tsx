import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import LoadingButton from "../../components/common/LoadingButton";
import api from "../../services/api";
import { notify } from "../../utils/notify";

type Booking = {
  bookingId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  user?: {
    name: string;
  };
  room?: {
    roomNo: string;
  };
};

type BookingStatistics = {
  totalBookings: number;
  pendingBookings: number;
  paidBookings: number;
  checkedInBookings: number;
  checkedOutBookings: number;
  cancelledBookings: number;
};

function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statistics, setStatistics] =
    useState<BookingStatistics | null>(null);

  const [search, setSearch] = useState("");

  const [loadingBookings, setLoadingBookings] =
    useState(true);

  const [searching, setSearching] =
    useState(false);

  const fetchBookings = async () => {
    try {
      const response = await api.get(
        "/admin/bookings"
      );

      setBookings(response.data.bookings);
    } catch (error: any) {
      console.error(error);

      notify.error(
        error.response?.data?.message ??
          "Failed to load bookings."
      );
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get(
        "/admin/bookings/statistics"
      );

      setStatistics(response.data);
    } catch (error: any) {
      console.error(error);

      notify.error(
        error.response?.data?.message ??
          "Failed to load booking statistics."
      );
    }
  };

  const searchBookings = async () => {
    const value = search.trim();

    if (!value) {
      setSearching(true);

      try {
        await fetchBookings();
      } finally {
        setSearching(false);
      }

      return;
    }

    setSearching(true);

    try {
      const response = await api.get(
        "/admin/bookings/search",
        {
          params: {
            search: value,
          },
        }
      );

      setBookings(response.data.bookings);
    } catch (error: any) {
      console.error(error);

      notify.error(
        error.response?.data?.message ??
          "Failed to search bookings."
      );
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      setLoadingBookings(true);

      try {
        await Promise.all([
          fetchBookings(),
          fetchStatistics(),
        ]);
      } finally {
        setLoadingBookings(false);
      }
    };

    loadPage();
  }, []);

  return (

        <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Bookings
        </h1>

        <p className="mt-2 text-slate-600">
          View, search and monitor all hotel bookings.
        </p>
      </div>

      {statistics && (
        <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {statistics.totalBookings}
            </h2>
          </div>

          <div className="rounded-2xl border border-yellow-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending
            </p>

            <h2 className="mt-2 text-3xl font-bold text-yellow-600">
              {statistics.pendingBookings}
            </h2>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Paid
            </p>

            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {statistics.paidBookings}
            </h2>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Checked In
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {statistics.checkedInBookings}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Checked Out
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-600">
              {statistics.checkedOutBookings}
            </h2>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Cancelled
            </p>

            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {statistics.cancelledBookings}
            </h2>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">
          Search Bookings
        </h2>

        <div className="flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            aria-label="Search bookings"
            placeholder="Booking ID or Phone Number"
            value={search}
            disabled={searching}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void searchBookings();
              }
            }}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <LoadingButton
            type="button"
            onClick={searchBookings}
            loading={searching}
            loadingText="Searching..."
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Search
          </LoadingButton>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">
          Bookings
        </h2>

        {loadingBookings ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
            <h3 className="text-lg font-semibold text-slate-700">
              No bookings found
            </h3>

            <p className="mt-2 text-slate-500">
              Try another search or refresh the
              bookings list.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Booking ID
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Guest
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Room
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Check In
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Check Out
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.bookingId}
                    className="border-t border-slate-200 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 font-medium">
                      {booking.bookingId}
                    </td>

                    <td className="px-4 py-4">
                      {booking.user?.name ??
                        "Guest"}
                    </td>

                    <td className="px-4 py-4">
                      {booking.room?.roomNo ??
                        "-"}
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

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          booking.status ===
                          "CHECKED_IN"
                            ? "bg-green-100 text-green-700"
                            : booking.status ===
                              "PAID"
                            ? "bg-blue-100 text-blue-700"
                            : booking.status ===
                              "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : booking.status ===
                              "CHECKED_OUT"
                            ? "bg-slate-100 text-slate-700"
                            : booking.status ===
                              "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {booking.status.replaceAll(
                          "_",
                          " "
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        to={`/admin/bookings/${booking.bookingId}`}
                        className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default Bookings;