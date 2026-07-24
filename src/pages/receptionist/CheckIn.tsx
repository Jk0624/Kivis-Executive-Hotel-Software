import { useState } from "react";

import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import LoadingButton from "../../components/common/LoadingButton";
import api from "../../services/api";
import { notify } from "../../utils/notify";

function CheckIn() {
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<any | null>(null);

  const [searching, setSearching] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const [phoneError, setPhoneError] = useState("");

  const searchBooking = async () => {
    const trimmedPhone = phone.trim();

    setPhoneError("");

    if (!trimmedPhone) {
      setPhoneError("Phone number is required.");
      notify.error("Please enter a phone number.");
      return;
    }

    setSearching(true);

    const loadingToast = notify.loading("Searching booking...");

    try {
      const response = await api.get(
        `/reception/check-in/search?phone=${encodeURIComponent(trimmedPhone)}`
      );

      notify.dismiss(loadingToast);

      notify.success("Booking found.");

      setBooking(response.data.booking);
    } catch (error: any) {
      notify.dismiss(loadingToast);

      setBooking(null);

      notify.error(
        error.response?.data?.message ??
          "Booking not found."
      );
    } finally {
      setSearching(false);
    }
  };

  const checkInGuest = async () => {
    if (!booking) return;

    setCheckingIn(true);

    const loadingToast = notify.loading(
      "Checking in guest..."
    );

    try {
      const response = await api.post(
        "/reception/check-in",
        {
          bookingReference:
            booking.bookingReference,
        }
      );

      notify.dismiss(loadingToast);

      notify.success(response.data.message);

      setBooking(null);
      setPhone("");
    } catch (error: any) {
      notify.dismiss(loadingToast);

      notify.error(
        error.response?.data?.message ??
          "Failed to check in guest."
      );
    } finally {
      setCheckingIn(false);
    }
  };

  return (
  <ReceptionistLayout>
    <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
      Guest Check-In
    </h1>

    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
      Search for a booking using the guest's phone number, verify the
      details and complete the check-in process.
    </p>

    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <h2 className="mb-6 text-xl font-semibold sm:text-2xl">
        Guest Verification
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <input
            type="tel"
            autoComplete="tel"
            placeholder="Enter phone number"
            value={phone}
            disabled={searching || checkingIn}
            aria-invalid={!!phoneError}
            aria-describedby={
              phoneError ? "phone-error" : undefined
            }
            onChange={(e) => {
              setPhone(e.target.value);

              if (phoneError) {
                setPhoneError("");
              }
            }}
            className={`w-full rounded-lg px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
              phoneError
                ? "border border-red-500 focus:border-red-500"
                : "border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            }`}
          />

          {phoneError && (
            <p
              id="phone-error"
              className="mt-2 text-sm font-medium text-red-600"
            >
              {phoneError}
            </p>
          )}
        </div>

        <LoadingButton
          type="button"
          loading={searching}
          loadingText="Searching..."
          onClick={searchBooking}
          className="w-full rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800 sm:h-fit sm:w-auto"
        >
          Search
        </LoadingButton>
      </div>
    </div>

    {booking && (
      <>
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-semibold sm:text-2xl">
            Guest Details
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <p>
              <strong>Booking Reference:</strong>{" "}
              {booking.bookingReference}
            </p>

            <p>
              <strong>Name:</strong>{" "}
              {booking.guest.name}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {booking.guest.phone}
            </p>

            <p>
              <strong>Room:</strong>{" "}
              {booking.room.roomNo} - {booking.room.type}
            </p>

            <p>
              <strong>Payment Status:</strong>{" "}
              <span className="font-semibold text-green-600">
                {booking.paymentStatus}
              </span>
            </p>

            <p>
              <strong>Check-in Date:</strong>{" "}
              {new Date(
                booking.checkIn
              ).toLocaleDateString()}
            </p>

            <p>
              <strong>Check-out Date:</strong>{" "}
              {new Date(
                booking.checkOut
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-stretch sm:justify-end">
          <LoadingButton
            type="button"
            loading={checkingIn}
            loadingText="Checking In..."
            onClick={checkInGuest}
            className="w-full rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 sm:w-auto sm:px-10"
          >
            Check In Guest
          </LoadingButton>
        </div>
      </>
    )}
  </ReceptionistLayout>
);
}

export default CheckIn;