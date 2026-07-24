import { useEffect, useState } from "react";
import { CalendarClock, ChevronRight, DoorOpen } from "lucide-react";
import api from "../../services/api";

interface PendingCheckIn {
  bookingReference: string;
  guestName: string;
  roomNumber: string;
  status: string;
}

export default function PendingCheckIns() {
  const [pendingCheckIns, setPendingCheckIns] = useState<
    PendingCheckIn[]
  >([]);

  const [loading, setLoading] = useState(true);

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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
            <CalendarClock size={18} />
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
          className="text-slate-400"
        />

      </div>

      {loading ? (
        <div className="px-6 py-8 text-center text-slate-500">
          Loading...
        </div>
      ) : pendingCheckIns.length === 0 ? (
        <div className="px-6 py-10 text-center">

          <DoorOpen
            size={36}
            className="mx-auto mb-3 text-slate-300"
          />

          <p className="font-medium text-slate-700">
            No pending check-ins
          </p>

          <p className="mt-1 text-sm text-slate-500">
            All arriving guests have been checked in.
          </p>

        </div>
      ) : (
        <div className="divide-y divide-slate-100">

          {pendingCheckIns.map((guest) => (

            <div
              key={guest.bookingReference}
              className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50"
            >

              <div>

                <p className="font-semibold text-slate-900">
                  {guest.guestName}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Booking: {guest.bookingReference}
                </p>

              </div>

              <div className="text-right">

                <p className="font-semibold text-blue-700">
                  Room {guest.roomNumber}
                </p>

                <span className="mt-1 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {guest.status}
                </span>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}