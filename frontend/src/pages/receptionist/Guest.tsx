import { useEffect, useRef, useState } from "react";

import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import api from "../../services/api";
import { notify } from "../../utils/notify";

function Guest() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(true);

  // ==========================================
  // PIN VISIBILITY
  // ==========================================
  const [revealedPins, setRevealedPins] = useState<
    Record<string, string>
  >({});

  // ==========================================
  // BUTTON LOADING STATES
  // ==========================================
  const [revealingPin, setRevealingPin] =
    useState<string | null>(null);

  const [resendingPin, setResendingPin] =
    useState<string | null>(null);

  // ==========================================
  // ACTIVE TIMERS
  // ==========================================
  const hideTimers = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  // ==========================================
  // LOAD GUESTS
  // ==========================================
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

    return () => {
      Object.values(hideTimers.current).forEach(
        clearTimeout
      );
    };
  }, []);

  // ==========================================
  // BOOKING IS CHECKED IN
  // ==========================================
  const canUsePinActions = (guest: any) => {
    return (
      guest.bookingStatus?.toUpperCase() ===
        "CHECKED_IN" &&
      guest.hasAccessPin
    );
  };

  // ==========================================
  // RESEND ACCESS PIN
  // ==========================================
  const resendAccessPin = async (
    bookingId: string
  ) => {
    try {
      setResendingPin(bookingId);

      const response = await api.post(
        "/reception/resend-access-pin",
        {
          bookingId,
        }
      );

      notify.success(
        response.data.message ??
          "Access PIN sent successfully."
      );
    } catch (error: any) {
      console.error(error);

      notify.error(
        error?.response?.data?.message ??
          "Failed to resend access PIN."
      );
    } finally {
      setResendingPin(null);
    }
  };

  // ==========================================
  // REVEAL ACCESS PIN
  // ==========================================
  const revealAccessPin = async (
    bookingId: string
  ) => {
    try {
      setRevealingPin(bookingId);

      const response = await api.post(
        "/reception/reveal-access-pin",
        {
          bookingId,
        }
      );

      const accessPin =
        response.data.accessPin;

      setRevealedPins((previous) => ({
        ...previous,
        [bookingId]: accessPin,
      }));

      // Remove existing timer
      if (
        hideTimers.current[bookingId]
      ) {
        clearTimeout(
          hideTimers.current[bookingId]
        );
      }

      // Hide PIN after 5 seconds
      hideTimers.current[bookingId] =
        setTimeout(() => {
          setRevealedPins((previous) => {
            const copy = { ...previous };

            delete copy[bookingId];

            return copy;
          });
        }, 5000);

      notify.success(
        "Access PIN revealed for 5 seconds."
      );
    } catch (error: any) {
      console.error(error);

      notify.error(
        error?.response?.data?.message ??
          "Unable to reveal access PIN."
      );
    } finally {
      setRevealingPin(null);
    }
  };

  // ==========================================
  // PAYMENT BADGE
  // ==========================================
  const paymentBadge = (
    status: string
  ) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "SUCCESS":
        return "bg-green-100 text-green-700";

      case "PENDING":
        return "bg-amber-100 text-amber-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // ==========================================
  // BOOKING BADGE
  // ==========================================
  const bookingBadge = (
    status: string
  ) => {
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

  // ==========================================
  // ACCESS PIN DISPLAY
  // ==========================================
  const accessPinDisplay = (
    guest: any
  ) => {
    if (!guest.hasAccessPin) {
      return (
        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
          Unavailable
        </span>
      );
    }

    const revealed =
      revealedPins[guest.bookingId];

    if (revealed) {
      return (
        <span className="rounded-lg bg-green-100 px-3 py-1 font-mono text-sm font-bold tracking-widest text-green-700">
          {revealed}
        </span>
      );
    }

    return (
      <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-sm tracking-[0.3em] text-slate-700">
        ••••••
      </span>
    );
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

              {guests.map((guest) => {

                const canUseActions =
                  canUsePinActions(guest);

                return (

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

                      <div className="col-span-2">

                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Access PIN
                        </p>

                        <div className="mt-2">
                          {accessPinDisplay(guest)}
                        </div>

                      </div>

                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">

                      <button
                        type="button"
                        disabled={
                          !canUseActions ||
                          resendingPin === guest.bookingId
                        }
                        onClick={() =>
                          resendAccessPin(
                            guest.bookingId
                          )
                        }
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                          canUseActions
                            ? "bg-blue-700 hover:bg-blue-800"
                            : "cursor-not-allowed bg-slate-300"
                        }`}
                      >
                        {resendingPin === guest.bookingId
                          ? "Sending..."
                          : "Resend PIN"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          !canUseActions ||
                          revealingPin === guest.bookingId
                        }
                        onClick={() =>
                          revealAccessPin(
                            guest.bookingId
                          )
                        }
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                          canUseActions
                            ? "bg-green-700 hover:bg-green-800"
                            : "cursor-not-allowed bg-slate-300"
                        }`}
                      >
                        {revealingPin === guest.bookingId
                          ? "Revealing..."
                          : "Reveal PIN"}
                      </button>

                    </div>

                  </div>

                );

              })}

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

                  {guests.map((guest) => {

                    const canUseActions =
                      canUsePinActions(guest);

                    return (

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

                          {accessPinDisplay(guest)}

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex justify-center gap-2">

                            <button
                              type="button"
                              disabled={
                                !canUseActions ||
                                resendingPin ===
                                  guest.bookingId
                              }
                              onClick={() =>
                                resendAccessPin(
                                  guest.bookingId
                                )
                              }
                              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                                canUseActions
                                  ? "bg-blue-700 hover:bg-blue-800"
                                  : "cursor-not-allowed bg-slate-300"
                              }`}
                            >
                              {resendingPin ===
                              guest.bookingId
                                ? "Sending..."
                                : "Resend PIN"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                !canUseActions ||
                                revealingPin ===
                                  guest.bookingId
                              }
                              onClick={() =>
                                revealAccessPin(
                                  guest.bookingId
                                )
                              }
                              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                                canUseActions
                                  ? "bg-green-700 hover:bg-green-800"
                                  : "cursor-not-allowed bg-slate-300"
                              }`}
                            >
                              {revealingPin ===
                              guest.bookingId
                                ? "Revealing..."
                                : "Reveal PIN"}
                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  })}

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