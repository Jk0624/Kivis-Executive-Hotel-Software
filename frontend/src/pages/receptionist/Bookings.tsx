import { BookOpen, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import api from "../../services/api";
import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import BookingDetails from "../../components/receptionist/BookingDetails";
import LoadingButton from "../../components/common/LoadingButton";

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

  const [loadingBookings, setLoadingBookings] = useState(true);
  const [searching, setSearching] = useState(false);

  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");

  const bookingsRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);

      const response = await api.get("/reception/bookings");

      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSearch = async () => {
    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      setSearchError(
        "Please enter a booking reference or phone number."
      );
      return;
    }

    setSearchError("");
    setSearching(true);

    try {
      const response = await api.get(
        `/reception/bookings/search?search=${encodeURIComponent(
          trimmedSearch
        )}`
      );

      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
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

    {/* Page Header */}

    <section className="sticky top-20 z-20 -mx-2 mb-8 rounded-2xl border border-slate-200 bg-white/95 px-4 py-5 backdrop-blur-md sm:px-6">

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Bookings
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
        Search, monitor and manage hotel reservations from one place.
      </p>

    </section>

    {/* Search */}

    <section
      ref={bookingsRef}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >

      <div className="mb-6 flex items-center gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

          <BookOpen
            size={20}
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

      <div className="flex flex-col gap-4 lg:flex-row">

        <div className="flex-1">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              disabled={searching}
              aria-invalid={!!searchError}
              aria-describedby={
                searchError
                  ? "search-error"
                  : undefined
              }
              placeholder="Search booking reference or phone number..."
              onChange={(e) => {
                const value = e.target.value;

                setSearch(value);

                if (searchError) {
                  setSearchError("");
                }

                if (value.trim() === "") {
                  fetchBookings();
                }
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !searching
                ) {
                  handleSearch();
                }
              }}
              className={`w-full rounded-xl py-3 pl-11 pr-4 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                searchError
                  ? "border border-red-500 focus:border-red-500"
                  : "border border-slate-300 focus:border-blue-700"
              }`}
            />

          </div>

          {searchError && (

            <p
              id="search-error"
              className="mt-2 text-sm font-medium text-red-600"
            >
              {searchError}
            </p>

          )}

        </div>

        <LoadingButton
          type="button"
          loading={searching}
          loadingText="Searching..."
          onClick={handleSearch}
          className="flex w-full items-center justify-center rounded-xl bg-blue-700 px-8 py-3 font-semibold text-white transition hover:bg-blue-800 lg:w-auto"
        >

          <>
            <Search size={18} />
            Search
          </>

        </LoadingButton>

      </div>

    </section>

    {/* Recent Reservations */}

    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

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

<>
  {/* Mobile & Tablet Cards */}

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
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
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
              {booking.user.name}
            </p>

          </div>

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Room
            </p>

            <p className="mt-1 font-semibold text-blue-700">
              {booking.room.roomNo}
            </p>

          </div>

          <div className="col-span-2">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Phone
            </p>

            <p className="mt-1 text-slate-700">
              {booking.user.phone}
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedBooking(booking);

            setTimeout(() => {
              detailsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }, 100);
          }}
          className="w-full rounded-xl border border-blue-700 py-3 font-semibold text-blue-700 transition hover:bg-blue-700 hover:text-white"
        >
          View Reservation
        </button>

      </div>

    ))}

  </div>

  {/* Desktop Table */}

  <div className="hidden max-h-[70vh] overflow-auto lg:block">

    <table className="min-w-full">

      <thead className="sticky top-0 bg-slate-50">

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
                type="button"
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
</>

        )}

            </section>

      {selectedBooking && (

        <div
          ref={detailsRef}
          className="mt-10"
        >

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