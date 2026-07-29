import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarDays,
  BedDouble,
  CreditCard,
  Hash,
  AlertCircle,
  RefreshCw,
  Receipt,
  Plus,
  Smartphone,
} from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import api from "../../../services/api";
import LoadingButton from "../../../components/common/LoadingButton";

interface BookingPrice {
  nightlyRate: number;
  nights: number;
  totalAmount: number;
}

interface Booking {
  bookingId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  price: BookingPrice;
}

interface BookingResponse {
  message: string;
  bookings: Booking[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);
}

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";

    case "paid":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";

    case "checked in":
      return "bg-blue-100 text-blue-700 border-blue-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null); 

  const [bookingToCancel, setBookingToCancel] =
  useState<Booking | null>(null);

  const [cancelling, setCancelling] =
  useState(false);

  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<BookingResponse>(
          "/guest/bookings"
        );

      setBookings(response.data.bookings);
      console.log(response.data.bookings);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
            "Unable to load your bookings."
        );
      } else {
        setError(
          "Unable to load your bookings."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

 const initializePayment = async (
  bookingId: string
) => {
  try {
    setPayingBookingId(bookingId);

    const { data } = await api.post("/payments", {
      bookingId,
    });

    const authorizationUrl =
      data?.paystack?.authorization_url;

    if (!authorizationUrl) {
      throw new Error(
        "Unable to initialize payment."
      );
    }

    window.location.assign(authorizationUrl);
  } catch (error: unknown) {
    console.error(error);

    if (axios.isAxiosError(error)) {
      alert(
        error.response?.data?.message ??
          "Unable to initialize payment."
      );
    } else {
      alert("Unable to initialize payment.");
    }
  } finally {
    setPayingBookingId(null);
  }
};

const cancelBooking = async () => {
  if (!bookingToCancel) return;

  try {
    setCancelling(true);

    await api.patch(
      `/guest/bookings/${bookingToCancel.bookingId}/cancel`
    );

    setBookingToCancel(null);

    await fetchBookings();
  } catch (error: unknown) {
    console.error(error);

    if (axios.isAxiosError(error)) {
      alert(
        error.response?.data?.message ??
          "Unable to cancel booking."
      );
    } else {
      alert("Unable to cancel booking.");
    }
  } finally {
    setCancelling(false);
  }
};

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const totalBookings = useMemo(
  () => bookings.length,
  [bookings]
);

  const totalSpent = useMemo(() => {
    return bookings.reduce(
      (sum, booking) =>
        sum + booking.price.totalAmount,
      0
    );
  }, [bookings]);

  const totalNights = useMemo(() => {
    return bookings.reduce(
      (sum, booking) =>
        sum + booking.price.nights,
      0
    );
  }, [bookings]);

  return (
  <MainLayout>
    <div className="min-h-screen bg-slate-50">

        {/* Header */}

        <div className="border-b bg-white">
  <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">

    <div>

      <h1 className="text-4xl font-bold text-slate-900">
        My Bookings
      </h1>

      <p className="mt-3 max-w-2xl text-slate-600">
        View your active reservations, booking status and
        accommodation details for your stay at Kiviz Executive Lodge.
      </p>

    </div>

    <button
      onClick={() => navigate("/guest/rooms")}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-yellow-600 hover:shadow-lg md:w-auto"
    >
      <Plus className="h-5 w-5" />
      <BedDouble className="h-5 w-5" />
      Book a Room
    </button>

  </div>
</div>

        <div className="mx-auto max-w-7xl px-6 py-10">

                  {/* Summary Cards */}

          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Active Bookings
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {totalBookings}
                  </h2>

                </div>

                <div className="rounded-xl bg-blue-100 p-3">
                  <Receipt className="h-7 w-7 text-blue-600" />
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Nights Reserved
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {totalNights}
                  </h2>

                </div>

                <div className="rounded-xl bg-indigo-100 p-3">
                  <BedDouble className="h-7 w-7 text-indigo-600" />
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Spent
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(totalSpent)}
                  </h2>

                </div>

                <div className="rounded-xl bg-emerald-100 p-3">
                  <CreditCard className="h-7 w-7 text-emerald-600" />
                </div>

              </div>

            </div>

          </div>

          {/* Loading */}

          {loading && (
  <div className="mt-10">
    <LoadingButton
      loading
      loadingText="Loading your bookings..."
      className="w-full justify-center bg-slate-700 text-white py-4"
    >
      Loading
    </LoadingButton>
  </div>
)}

          {/* Error */}

          {!loading && error && (

            <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />

              <h2 className="mt-5 text-xl font-semibold text-red-700">
                Unable to Load Bookings
              </h2>

              <p className="mt-3 text-red-600">
                {error}
              </p>

              <button
                onClick={fetchBookings}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw className="h-5 w-5" />
                Retry
              </button>

            </div>

          )}

          {/* Empty State */}

{!loading &&
  !error &&
  bookings.length === 0 && (

    <div className="mt-10 overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white shadow-sm">

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-10 text-center">

        <CalendarDays className="mx-auto h-16 w-16 text-yellow-400" />

        <h2 className="mt-6 text-3xl font-bold text-white">
          No Active Bookings
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          You don't have any active reservations at the moment.
          Explore our available rooms and reserve your next stay
          at Kiviz Executive Lodge.
        </p>

      </div>

      <div className="px-8 py-10 text-center">

        <button
          onClick={() => navigate("/rooms")}
          className="inline-flex items-center gap-3 rounded-xl bg-yellow-500 px-8 py-4 text-base font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-600 hover:shadow-lg"
        >
          <BedDouble className="h-5 w-5" />
          Book Your Stay
        </button>

      </div>

    </div>

)}

          {/* Booking Cards */}

          {!loading &&
            !error &&
            bookings.length > 0 && (

              <div className="mt-10 space-y-8">

                              {bookings.map((booking) => (

                  <div
                    key={booking.bookingId}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* Card Header */}

                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>

                          <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
                            Booking Reference
                          </p>

                          <h2 className="mt-2 flex items-center gap-2 text-2xl font-bold text-white">

                            <Hash className="h-6 w-6 text-yellow-400" />

                            {booking.bookingId}

                          </h2>

                        </div>

                        <span
                          className={`inline-flex w-fit rounded-full border px-5 py-2 text-sm font-semibold ${getStatusClasses(
                            booking.status
                          )}`}
                        >
                          {booking.status.replaceAll("_", " ")}
                        </span>

                      </div>

                    </div>

                    {/* Card Body */}

                    <div className="grid gap-8 p-8 lg:grid-cols-2">

                      {/* Left Column */}

                      <div className="space-y-6">

                        <div>

                          <p className="text-sm font-medium uppercase tracking-widest text-slate-400">
                            Room
                          </p>

                          <h3 className="mt-2 text-2xl font-bold text-slate-900">
                            Room {booking.roomNumber}
                          </h3>

                          <p className="mt-1 text-slate-600">
                            {booking.roomType}
                          </p>

                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                          <div className="rounded-2xl bg-slate-50 p-5">

                            <div className="flex items-center gap-3">

                              <CalendarDays className="h-5 w-5 text-yellow-500" />

                              <span className="text-sm font-semibold text-slate-500">
                                Check-In
                              </span>

                            </div>

                            <p className="mt-3 font-semibold text-slate-900">
                              {formatDate(
                                booking.checkInDate
                              )}
                            </p>

                          </div>

                          <div className="rounded-2xl bg-slate-50 p-5">

                            <div className="flex items-center gap-3">

                              <CalendarDays className="h-5 w-5 text-yellow-500" />

                              <span className="text-sm font-semibold text-slate-500">
                                Check-Out
                              </span>

                            </div>

                            <p className="mt-3 font-semibold text-slate-900">
                              {formatDate(
                                booking.checkOutDate
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* Right Column */}

                      <div className="rounded-3xl bg-gradient-to-br from-yellow-50 to-white p-8">

                        <h3 className="text-xl font-bold text-slate-900">
                          Booking Summary
                        </h3>

                        <div className="mt-8 divide-y divide-slate-200">

                          <div className="flex items-center justify-between py-4">

                            <span className="text-slate-500">
                              Nightly Rate
                            </span>

                            <span className="font-semibold text-slate-900">
                              {formatCurrency(
                                booking.price.nightlyRate
                              )}
                            </span>

                          </div>

                          <div className="flex items-center justify-between border-b border-slate-200 pb-4">

                            <span className="text-slate-500">
                              Number of Nights
                            </span>

                            <span className="font-semibold text-slate-900">
                              {booking.price.nights}
                            </span>

                          </div>

                          <div className="flex items-center justify-between pt-2">

                            <span className="text-lg font-semibold text-slate-700">
                              Total Amount
                            </span>

                            <span className="text-3xl font-bold text-yellow-600">
                              {formatCurrency(
                                booking.price.totalAmount
                              )}
                            </span>

                          </div>

                          {booking.status.toUpperCase() === "PENDING" && (
  <LoadingButton
    loading={payingBookingId === booking.bookingId}
    loadingText="Redirecting to Paystack..."
    onClick={() =>
      initializePayment(booking.bookingId)
    }
    className="mt-8 w-full bg-green-600 py-4 text-white hover:bg-green-700"
  >
    <>
      <Smartphone className="h-5 w-5" />
      Pay with Mobile Money
    </>
  </LoadingButton>
)}

{["PENDING", "PAID"].includes(
  booking.status.toUpperCase()
) && (
  <button
    type="button"
    onClick={() => setBookingToCancel(booking)}
    className="mt-4 w-full rounded-xl border border-red-300 bg-red-50 py-4 font-semibold text-red-700 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
  >
    Cancel Booking
  </button>
)}

                        </div>

                      </div>

                    </div>

                  </div>

                ))}

                              </div>

            )}

        </div>
        

      </div>

      {bookingToCancel && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

      <h2 className="text-2xl font-bold text-slate-900">
        Cancel Booking
      </h2>

      <p className="mt-4 text-slate-600">
        Are you sure you want to cancel your reservation for{" "}
        <span className="font-semibold">
          Room {bookingToCancel.roomNumber}
        </span>
        ?
      </p>

      <p className="mt-2 text-sm text-red-600">
        This action cannot be undone.
      </p>

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={() => setBookingToCancel(null)}
          className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Keep Booking
        </button>

        <button
  type="button"
  onClick={cancelBooking}
  disabled={cancelling}
  className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
>
  {cancelling
    ? "Cancelling..."
    : "Yes, Cancel Booking"}
</button>
      </div>

    </div>
  </div>
)}
  
    </MainLayout>
  );
}
