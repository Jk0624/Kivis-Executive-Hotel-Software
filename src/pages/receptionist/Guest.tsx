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
      <h1 className="text-4xl font-bold text-slate-900">
        Guest Management
      </h1>

      <p className="mt-3 text-slate-600">
        View and manage all hotel guests.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-semibold">
          Filters
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
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
            <option>All Booking Status</option>
            <option>Checked In</option>
            <option>Checked Out</option>
          </select>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-8 py-6">
          <h2 className="text-2xl font-semibold">
            Guests
          </h2>
        </div>

        {loadingGuests ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

              <p className="text-slate-500">
                Loading guests...
              </p>
            </div>
          </div>
        ) : guests.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="text-xl font-semibold text-slate-700">
              No Guests Found
            </h3>

            <p className="mt-2 text-slate-500">
              There are currently no guest
              records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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

                    <td className="px-6 py-5">
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
        )}
      </div>
    </ReceptionistLayout>
  );
}

export default Guest;