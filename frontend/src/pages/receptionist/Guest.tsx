import { useEffect, useState } from "react";

import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import api from "../../services/api";
import { notify } from "../../utils/notify";

function Guest() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loadingGuests, setLoadingGuests] =
    useState(true);

  const loadGuests = async () => {
    try {
      setLoadingGuests(true);

      const response = await api.get(
        "/reception/guests"
      );

      setGuests(response.data.guests);
    } catch (error) {
      console.error(error);

      notify.error(
        "Failed to load guest records."
      );
    } finally {
      setLoadingGuests(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const paymentBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "PENDING":
        return "bg-amber-100 text-amber-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const bookingBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CHECKED IN":
      case "CHECKED_IN":
        return "bg-green-100 text-green-700";

      case "CHECKED OUT":
      case "CHECKED_OUT":
        return "bg-slate-200 text-slate-700";

      case "RESERVED":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
  <ReceptionistLayout>

    {/* Page Header */}

    <section className="sticky top-20 z-20 -mx-2 mb-8 rounded-2xl border border-slate-200 bg-white/95 px-4 py-5 backdrop-blur-md sm:px-6">

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Guest Management
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
        View and manage all hotel guests from a single dashboard.
      </p>

    </section>

    {/* Filters */}

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

      <div className="mb-6">

        <h2 className="text-xl font-semibold text-slate-900">
          Filters
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Narrow down guest records using the available criteria.
        </p>

      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

        <input
          type="date"
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="text"
          placeholder="Guest Name"
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="text"
          placeholder="Room Number"
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="text"
          placeholder="Booking ID"
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <select className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100">

          <option>
            All Booking Status
          </option>

          <option>
            Checked In
          </option>

          <option>
            Checked Out
          </option>

        </select>

      </div>

    </section>

          {/* Guests */}

    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

        <div>

          <h2 className="text-xl font-semibold text-slate-900">
            Guest Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View all registered guests and their booking information.
          </p>

        </div>

        <div className="self-start rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 sm:self-auto">

          {guests.length} Guest
          {guests.length !== 1 ? "s" : ""}

        </div>

      </div>

      {loadingGuests ? (

        <div className="flex items-center justify-center py-20">

          <div className="text-center">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

            <p className="text-sm text-slate-500">
              Loading guest records...
            </p>

          </div>

        </div>

      ) : guests.length === 0 ? (

        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

          <div className="mb-4 rounded-full bg-slate-100 p-5">

            <svg
              className="h-8 w-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5V4H2v16h5m10 0v-2a3 3 0 00-3-3H10a3 3 0 00-3 3v2m10 0H7m10-10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>

          </div>

          <h3 className="text-lg font-semibold text-slate-700">
            No Guests Found
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            Guest records will appear here after bookings are created and guests begin checking in.
          </p>

        </div>

      ) : (

          <>
  {/* Mobile & Tablet Cards */}

  <div className="divide-y divide-slate-100 lg:hidden">

    {guests.map((guest) => (

      <div
        key={guest.bookingId}
        className="space-y-5 p-5 transition hover:bg-slate-50"
      >

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <h3 className="truncate text-lg font-semibold text-slate-900">
              {guest.guestName}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {guest.phoneNumber}
            </p>

          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${bookingBadge(
              guest.bookingStatus
            )}`}
          >
            {guest.bookingStatus}
          </span>

        </div>

        <div className="grid grid-cols-2 gap-4">

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Room
            </p>

            <p className="mt-1 font-semibold text-blue-700">
              {guest.roomNumber}
            </p>

          </div>

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Payment
            </p>

            <span
              className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge(
                guest.paymentStatus
              )}`}
            >
              {guest.paymentStatus}
            </span>

          </div>

          <div className="col-span-2">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Booking ID
            </p>

            <p className="mt-1 break-all font-mono text-sm text-slate-700">
              {guest.bookingId}
            </p>

          </div>

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Access PIN
            </p>

            <span
              className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                guest.hasAccessPin
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {guest.hasAccessPin
                ? "Available"
                : "Unavailable"}
            </span>

          </div>

        </div>

        <div className="flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            disabled
            title="Backend endpoint not yet implemented"
            className="flex-1 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white opacity-50"
          >
            Resend PIN
          </button>

          <button
            type="button"
            disabled
            title="Backend endpoint not yet implemented"
            className="flex-1 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white opacity-50"
          >
            Reveal PIN
          </button>

        </div>

      </div>

    ))}

  </div>

  {/* Desktop Table */}

  <div className="hidden overflow-x-auto lg:block">

    <table className="min-w-full">

      <thead className="sticky top-0 bg-slate-50">

        <tr className="border-b border-slate-200">

          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
            Guest
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
            Phone
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
            Room
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
            Booking ID
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
            Payment
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
            Status
          </th>

          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
            Access PIN
          </th>

          <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
            Actions
          </th>

        </tr>

      </thead>

      <tbody>

        {guests.map((guest) => (

          <tr
            key={guest.bookingId}
            className="border-b border-slate-100 transition hover:bg-slate-50"
          >

            <td className="px-6 py-5 font-semibold text-slate-900">
              {guest.guestName}
            </td>

            <td className="px-6 py-5">
              {guest.phoneNumber}
            </td>

            <td className="px-6 py-5 font-semibold text-blue-700">
              {guest.roomNumber}
            </td>

            <td className="px-6 py-5 font-mono text-sm">
              {guest.bookingId}
            </td>

            <td className="px-6 py-5">

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge(
                  guest.paymentStatus
                )}`}
              >
                {guest.paymentStatus}
              </span>

            </td>

            <td className="px-6 py-5">

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${bookingBadge(
                  guest.bookingStatus
                )}`}
              >
                {guest.bookingStatus}
              </span>

            </td>

            <td className="px-6 py-5">

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  guest.hasAccessPin
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {guest.hasAccessPin
                  ? "Available"
                  : "Unavailable"}
              </span>

            </td>

            <td className="px-6 py-5">

              <div className="flex justify-center gap-2">

                <button
                  type="button"
                  disabled
                  title="Backend endpoint not yet implemented"
                  className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white opacity-50"
                >
                  Resend PIN
                </button>

                <button
                  type="button"
                  disabled
                  title="Backend endpoint not yet implemented"
                  className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white opacity-50"
                >
                  Reveal PIN
                </button>

              </div>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>
</>
        )}
      </section>
    </ReceptionistLayout>
  );
}

export default Guest;