import { useEffect, useState } from "react";
import {
  CalendarClock,
  ChevronRight,
  DoorOpen,
} from "lucide-react";
import api from "../../services/api";

interface PendingCheckIn {
  bookingReference: string;
  guestName: string;
  roomNumber: string;
  status: string;
}

export default function PendingCheckIns() {
  const [pendingCheckIns, setPendingCheckIns] =
    useState<PendingCheckIn[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchPendingCheckIns() {
      try {
        const response = await api.get(
          "/reception/dashboard/pending-checkins"
        );

        setPendingCheckIns(
          response.data.pendingCheckIns
        );
      } catch (error) {
        console.error(
          "Failed to fetch pending check-ins:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPendingCheckIns();
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

            <CalendarClock size={20} />

          </div>

          <div>

            <h2 className="text-lg font-semibold text-slate-900">
              Pending Check-ins
            </h2>

            <p className="text-sm text-slate-500">
              Guests arriving today
            </p>

          </div>

        </div>

        <ChevronRight
          size={18}
          className="hidden text-slate-400 sm:block"
        />

      </div>

      {/* Loading */}

      {loading ? (
        <div className="space-y-4 p-6">

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-slate-100 p-4"
            >
              <div className="h-4 w-40 rounded bg-slate-200" />

              <div className="mt-3 h-3 w-56 rounded bg-slate-100" />

            </div>
          ))}

        </div>
      ) : pendingCheckIns.length === 0 ? (

        <div className="px-6 py-12 text-center">

          <DoorOpen
            size={40}
            className="mx-auto mb-4 text-slate-300"
          />

          <p className="font-semibold text-slate-800">
            No pending check-ins
          </p>

          <p className="mt-2 text-sm text-slate-500">
            All arriving guests have already been checked in.
          </p>

        </div>

      ) : (

        <div className="divide-y divide-slate-100">

          {pendingCheckIns.map((guest) => (

            <div
              key={guest.bookingReference}
              className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >

              {/* Guest */}

              <div className="min-w-0">

                <p className="truncate font-semibold text-slate-900">

                  {guest.guestName}

                </p>

                <p className="mt-1 break-all text-sm text-slate-500">

                  Booking: {guest.bookingReference}

                </p>

              </div>

              {/* Room */}

              <div className="flex items-center justify-between gap-4 sm:block sm:text-right">

                <p className="font-semibold text-blue-700">

                  Room {guest.roomNumber}

                </p>

                <span className="mt-0 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 sm:mt-2">

                  {guest.status}

                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}