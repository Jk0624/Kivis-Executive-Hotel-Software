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


  const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-blue-100 text-blue-700";

    case "PAID":
      return "bg-amber-100 text-amber-700";

    case "CHECKED_IN":
      return "bg-emerald-100 text-emerald-700";

    case "CHECKED_OUT":
      return "bg-slate-200 text-slate-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

  return (

        <AdminLayout>
      <section className="sticky top-20 z-20 -mx-2 mb-8 rounded-2xl border border-slate-200 bg-white/95 px-6 py-5 backdrop-blur-md">

  <div className="flex items-center justify-between">

    <div>

      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Bookings
      </h1>

      <p className="mt-2 text-slate-600">
        View, search and monitor all bookings from one place.
      </p>

    </div>

  </div>

</section>

      {statistics && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
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

      {/* ========================================== */}
{/* SEARCH BOOKINGS */}
{/* ========================================== */}

<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

  <div className="mb-6 flex items-center gap-3">

    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-blue-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
        />
      </svg>

    </div>

    <div>

      <h2 className="text-xl font-semibold text-slate-900">
        Find booking
      </h2>

      

    </div>

  </div>

  <div className="flex flex-col gap-4 lg:flex-row">

    <div className="flex-1">

      <div className="relative">

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
          />
        </svg>

        <input
          type="text"
          value={search}
          disabled={searching}
          placeholder="Search booking reference or phone number..."
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void searchBookings();
            }
          }}
          className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

      </div>

    </div>

    <LoadingButton
      type="button"
      loading={searching}
      loadingText="Searching..."
      onClick={searchBookings}
      className="flex w-full items-center justify-center rounded-xl bg-blue-700 px-8 py-3 font-semibold text-white transition hover:bg-blue-800 lg:w-auto"
    >
      Search
    </LoadingButton>

  </div>

</section>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
       <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">

  <div>

    <h2 className="text-xl font-semibold text-slate-900">
      Recent Reservations
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      View and manage all hotel reservations.
    </p>

  </div>

  <div className="self-start rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 sm:self-auto">

    {bookings.length} Reservation
    {bookings.length !== 1 ? "s" : ""}

  </div>

</div>

        {loadingBookings ? (
          <div className="flex items-center justify-center py-20">

  <div className="text-center">

    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

    <p className="text-sm text-slate-500">
      Loading reservations...
    </p>

  </div>

</div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">

  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="mb-4 h-14 w-14 text-slate-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7.5h18M6 3h12a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0118 21H6A2.25 2.25 0 013.75 18.75V5.25A2.25 2.25 0 016 3z"
    />
  </svg>

  <h3 className="text-lg font-semibold text-slate-700">
    No Reservations Found
  </h3>

  <p className="mt-2 text-sm text-slate-500">
    Try searching with another booking reference or phone number.
  </p>

</div>
        ) : (
          <>
  {/* ========================================== */}
  {/* MOBILE BOOKINGS */}
  {/* ========================================== */}

  <div className="divide-y divide-slate-100 lg:hidden">

    {bookings.map((booking) => (

      <div
        key={booking.bookingId}
        className="space-y-4 p-5 transition hover:bg-slate-50"
      >

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Booking Reference
            </p>

            <p className="mt-1 break-all font-semibold text-slate-900">
              {booking.bookingId}
            </p>

          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
              booking.status
            )}`}
          >
            {booking.status.replaceAll("_", " ")}
          </span>

        </div>

        <div className="grid grid-cols-2 gap-4">

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Guest
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {booking.user?.name ?? "Guest"}
            </p>

          </div>

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Room
            </p>

            <p className="mt-1 font-semibold text-blue-700">
              {booking.room?.roomNo ?? "-"}
            </p>

          </div>

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Check In
            </p>

            <p className="mt-1 text-slate-700">
              {new Date(
                booking.checkIn
              ).toLocaleDateString()}
            </p>

          </div>

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Check Out
            </p>

            <p className="mt-1 text-slate-700">
              {new Date(
                booking.checkOut
              ).toLocaleDateString()}
            </p>

          </div>

        </div>

        <Link
          to={`/admin/bookings/${booking.bookingId}`}
          className="flex w-full items-center justify-center rounded-xl border border-blue-700 py-3 font-semibold text-blue-700 transition hover:bg-blue-700 hover:text-white"
        >
          View Details
        </Link>

      </div>

    ))}

  </div>

  {/* ========================================== */}
  {/* DESKTOP TABLE */}
  {/* ========================================== */}

  <div className="hidden max-h-[70vh] overflow-auto lg:block">

    <table className="min-w-full">

      <thead className="sticky top-0 z-10 bg-slate-50">

        <tr>

          <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reference
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Guest
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Room
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Check In
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Check Out
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            Status
          </th>

          <th className="px-8 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
            Action
          </th>

        </tr>

      </thead>

      <tbody>

  {bookings.map((booking) => (

    <tr
      key={booking.bookingId}
      className="border-t border-slate-100 transition duration-200 hover:bg-blue-50/40"
    >

      {/* Booking Reference */}

      <td className="px-8 py-5">

        <div>

          <p className="font-semibold text-slate-900">
            {booking.bookingId}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Reservation Reference
          </p>

        </div>

      </td>

      {/* Guest */}

      <td className="px-6 py-5">

        <div>

          <p className="font-medium text-slate-900">
            {booking.user?.name ?? "Guest"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Registered Guest
          </p>

        </div>

      </td>

      {/* Room */}

      <td className="px-6 py-5">

        <span className="font-semibold text-blue-700">
          {booking.room?.roomNo ?? "-"}
        </span>

      </td>

      {/* Check In */}

      <td className="px-6 py-5 text-slate-700">

        {new Date(
          booking.checkIn
        ).toLocaleDateString()}

      </td>

      {/* Check Out */}

      <td className="px-6 py-5 text-slate-700">

        {new Date(
          booking.checkOut
        ).toLocaleDateString()}

      </td>

      {/* Status */}

      <td className="px-6 py-5">

        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
            booking.status
          )}`}
        >
          {booking.status.replaceAll("_", " ")}
        </span>

      </td>

      {/* Action */}

      <td className="px-8 py-5">

        <div className="flex justify-end">

          <Link
            to={`/admin/bookings/${booking.bookingId}`}
            className="rounded-lg border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-700 hover:text-white hover:shadow-md"
          >
            View Details
          </Link>

        </div>

      </td>

    </tr>

  ))}

</tbody>

    </table>

  </div>

</>
        )}
      </div>
    </AdminLayout>
  );
}

export default Bookings;