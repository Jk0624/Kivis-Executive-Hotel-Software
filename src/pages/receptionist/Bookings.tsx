import { BookOpen, Search} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import BookingDetails from "../../components/receptionist/BookingDetails";

interface Booking {
  bookingId: string;
  bookingReference?: string;
  status: string;
  checkIn: string;

  user: {
    name: string;
    phone: string;
  };

  room: {
    roomNo: string;
  };
}

function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const bookingsRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response = await api.get("/reception/bookings");

      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);

      if (search.trim() === "") {
        await fetchBookings();
        return;
      }

      const response = await api.get(
        `/reception/bookings/search?search=${encodeURIComponent(search)}`
      );

      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

const getStatusColor = (status: string) => {
  switch (status) {
    case "PAID":
      return "text-amber-600";

    case "CHECKED_IN":
      return "text-emerald-600";

    case "CHECKED_OUT":
      return "text-slate-600";

    case "CANCELLED":
      return "text-red-600";

    default:
      return "text-blue-600";
  }
};

  return (
    <ReceptionistLayout>

      <div className="sticky top-20 z-20 -mx-2 mb-8 rounded-2xl border border-slate-200 bg-white/95 px-2 py-5 backdrop-blur-md">

        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Bookings
        </h1>

        <p className="mt-2 text-slate-600">
          Search, monitor and manage hotel reservations from one place.
        </p>

      </div>

      <div
        ref={bookingsRef}
        className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-lg bg-blue-50 p-2">

            <BookOpen
              size={18}
              className="text-blue-700"
            />

          </div>

          <div>

            <h2 className="text-xl font-semibold text-slate-900">
              Find Reservation
            </h2>

            <p className="text-sm text-slate-500">
              Search using the booking reference or guest phone number.
            </p>

          </div>

        </div>

        <div className="flex flex-col gap-4 md:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              placeholder="Search booking reference or phone number..."
              onChange={async (e) => {
                const value = e.target.value;

                setSearch(value);

                if (value.trim() === "") {
                  fetchBookings();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 transition outline-none focus:border-blue-700"
            />

          </div>

          <button
            onClick={handleSearch}
            className="rounded-xl bg-blue-700 px-8 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Search
          </button>

        </div>

      </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-5">

          <div>

            <h2 className="text-xl font-semibold text-slate-900">
              Recent Reservations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage all hotel reservations.
            </p>

          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
            {bookings.length} Reservation{bookings.length !== 1 ? "s" : ""}
          </div>

        </div>

        {loading ? (

          <div className="flex items-center justify-center py-20">

            <div className="text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700"></div>

              <p className="text-sm text-slate-500">
                Loading reservations...
              </p>

            </div>

          </div>

        ) : bookings.length === 0 ? (

          <div className="flex flex-col items-center justify-center py-20">

            <BookOpen
              size={52}
              className="mb-4 text-slate-300"
            />

            <h3 className="text-lg font-semibold text-slate-700">
              No Reservations Found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try searching with another booking reference or phone number.
            </p>

          </div>

        ) : (

          <div className="max-h-[70v] overflow-auto">

            <table className="min-w-[950px]">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Reference
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Guest
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Room
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
                    className="border-t border-slate-100 transition hover:bg-blue-50/40"
                  >

                    <td className="px-8 py-5 font-semibold text-slate-900">
                      {booking.bookingId}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 font-medium text-slate-900">
                      {booking.user.name}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {booking.user.phone}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 font-semibold text-blue-700">
                      {booking.room.roomNo}
                    </td>

                    <td className="px-6 py-5">

                      <span
  className={`whitespace-nowrap text-sm font-semibold ${getStatusColor(
    booking.status
  )}`}
>
                        {booking.status.replaceAll("_", " ")}
                      </span>

                    </td>

                    <td className="px-8 py-5 text-right">
  <button
    onClick={() => {
      setSelectedBooking(booking);

      setTimeout(() => {
        detailsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }}
    className="font-semibold text-blue-700 transition hover:text-blue-900"
  >
    View →
  </button>
</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


            {selectedBooking && (
        <div ref={detailsRef} className="mt-10">

          <BookingDetails
            booking={selectedBooking}
            onClose={() => {
              setSelectedBooking(null);

              setTimeout(() => {
                bookingsRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }, 150);
            }}
          />

        </div>
      )}

    </ReceptionistLayout>
  );
}

export default Bookings;