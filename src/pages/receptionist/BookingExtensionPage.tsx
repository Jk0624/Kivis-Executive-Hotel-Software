import { useState } from "react";

import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import LoadingButton from "../../components/common/LoadingButton";
import api from "../../services/api";
import { notify } from "../../utils/notify";

function BookingExtension() {
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<any | null>(null);
  const [newCheckOutDate, setNewCheckOutDate] = useState("");
  const [preview, setPreview] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [searching, setSearching] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [phoneError, setPhoneError] = useState("");
  const [checkOutDateError, setCheckOutDateError] =
    useState("");

  const searchBooking = async () => {
    const trimmedPhone = phone.trim();

    setPhoneError("");

    if (!trimmedPhone) {
      setPhoneError("Phone number is required.");
      notify.error("Please enter a phone number.");
      return;
    }

    setSearching(true);

    const loadingToast = notify.loading(
      "Searching booking..."
    );

    try {
      const response = await api.get(
        `/reception/booking-extension/search?phone=${encodeURIComponent(
          trimmedPhone
        )}`
      );

      notify.dismiss(loadingToast);

      notify.success("Booking found.");

      setBooking(response.data.booking);
      setPreview(null);
      setNewCheckOutDate("");
      setCheckOutDateError("");
    } catch (error: any) {
      notify.dismiss(loadingToast);

      setBooking(null);
      setPreview(null);
      setNewCheckOutDate("");

      notify.error(
        error.response?.data?.message ??
          "Booking not found."
      );
    } finally {
      setSearching(false);
    }
  };

  const previewExtension = async () => {
    if (!booking) return;

    setCheckOutDateError("");

    if (!newCheckOutDate) {
      setCheckOutDateError(
        "Please select a new check-out date."
      );

      notify.error(
        "Please select a new check-out date."
      );

      return;
    }

    setPreviewing(true);

    const loadingToast = notify.loading(
      "Calculating extension..."
    );

    try {
      const response = await api.post(
        "/reception/booking-extension/preview",
        {
          bookingReference:
            booking.bookingReference,
          newCheckOutDate,
        }
      );

      notify.dismiss(loadingToast);

      notify.success(
        "Extension preview generated."
      );

      setPreview(response.data.preview);
    } catch (error: any) {
      notify.dismiss(loadingToast);

      setPreview(null);

      notify.error(
        error.response?.data?.message ??
          "Failed to preview booking extension."
      );
    } finally {
      setPreviewing(false);
    }
  };

  const confirmExtension = async () => {
    if (!booking || !preview) return;

    setConfirming(true);

    const loadingToast = notify.loading(
      "Processing booking extension..."
    );

    try {
      const response = await api.post(
        "/reception/booking-extension/confirm",
        {
          bookingReference:
            booking.bookingReference,
          newCheckOutDate,
          amount: preview.additionalAmount,
        }
      );

      notify.dismiss(loadingToast);

      notify.success(response.data.message);

      setBooking(null);
      setPreview(null);
      setPhone("");
      setNewCheckOutDate("");
      setCheckOutDateError("");
      setPhoneError("");
      setPaymentMethod("Cash");
    } catch (error: any) {
      notify.dismiss(loadingToast);

      notify.error(
        error.response?.data?.message ??
          "Failed to confirm booking extension."
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
        <ReceptionistLayout>
      <h1 className="text-4xl font-bold text-slate-900">
        Booking Extension
      </h1>

      <p className="mt-3 text-gray-600">
        Extend the stay of a checked-in guest.
      </p>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-semibold">
          Search Checked-In Guest
        </h2>

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="tel"
              autoComplete="tel"
              placeholder="Enter guest's phone number"
              value={phone}
              disabled={
                searching ||
                previewing ||
                confirming
              }
              aria-invalid={!!phoneError}
              aria-describedby={
                phoneError
                  ? "phone-error"
                  : undefined
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
            className="h-fit rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Search
          </LoadingButton>
        </div>
      </div>

      {booking && (
        <div className="mt-8 rounded-xl bg-white p-8 shadow-md">
          <h2 className="mb-6 text-2xl font-semibold">
            Booking Details
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <p>
              <strong>Booking Reference:</strong>{" "}
              {booking.bookingReference}
            </p>

            <p>
              <strong>Guest Name:</strong>{" "}
              {booking.guest.name}
            </p>

            <p>
              <strong>Phone Number:</strong>{" "}
              {booking.guest.phone}
            </p>

            <p>
              <strong>Room:</strong>{" "}
              {booking.room.roomNo} -{" "}
              {booking.room.type}
            </p>

            <p>
              <strong>Current Check-in:</strong>{" "}
              {new Date(
                booking.checkIn
              ).toLocaleDateString()}
            </p>

            <p>
              <strong>Current Check-out:</strong>{" "}
              {new Date(
                booking.checkOut
              ).toLocaleDateString()}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className="font-semibold text-green-600">
                Checked In
              </span>
            </p>
          </div>
        </div>
      )}

      {booking && (
        <div className="mt-8 rounded-xl bg-white p-8 shadow-md">
          <h2 className="mb-6 text-2xl font-semibold">
            Extension Details
          </h2>

          <div>
            <label
              htmlFor="new-checkout-date"
              className="mb-2 block font-medium"
            >
              New Check-out Date
            </label>

            <div className="flex items-end gap-4">
              <div className="flex-1">
                <input
                  id="new-checkout-date"
                  type="date"
                  value={newCheckOutDate}
                  disabled={
                    previewing ||
                    confirming
                  }
                  aria-invalid={
                    !!checkOutDateError
                  }
                  aria-describedby={
                    checkOutDateError
                      ? "checkout-error"
                      : undefined
                  }
                  onChange={(e) => {
                    setNewCheckOutDate(
                      e.target.value
                    );

                    if (checkOutDateError) {
                      setCheckOutDateError("");
                    }
                  }}
                  className={`w-full rounded-lg px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    checkOutDateError
                      ? "border border-red-500 focus:border-red-500"
                      : "border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  }`}
                />

                {checkOutDateError && (
                  <p
                    id="checkout-error"
                    className="mt-2 text-sm font-medium text-red-600"
                  >
                    {checkOutDateError}
                  </p>
                )}
              </div>

              <LoadingButton
                type="button"
                loading={previewing}
                loadingText="Calculating..."
                onClick={previewExtension}
                className="rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Preview Extension
              </LoadingButton>
            </div>
          </div>
        </div>
      )}


            {preview && (
        <div className="mt-8 rounded-xl bg-white p-8 shadow-md">
          <h2 className="mb-6 text-2xl font-semibold">
            Extension Preview
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-slate-100 p-6 text-center">
              <h3 className="text-lg font-semibold">
                Nightly Rate
              </h3>

              <p className="mt-3 text-3xl font-bold text-blue-700">
                GHS {preview.nightlyRate}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-6 text-center">
              <h3 className="text-lg font-semibold">
                Additional Nights
              </h3>

              <p className="mt-3 text-3xl font-bold text-blue-700">
                {preview.additionalNights}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-6 text-center">
              <h3 className="text-lg font-semibold">
                Additional Amount
              </h3>

              <p className="mt-3 text-3xl font-bold text-green-700">
                GHS {preview.additionalAmount}
              </p>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="mt-8 rounded-xl bg-white p-8 shadow-md">
          <h2 className="mb-6 text-2xl font-semibold">
            Confirm Extension
          </h2>

          <div>
            <label
              htmlFor="payment-method"
              className="mb-2 block font-medium"
            >
              Payment Method
            </label>

            <div className="flex items-end gap-4">
              <select
                id="payment-method"
                value={paymentMethod}
                disabled={confirming}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="Cash">Cash</option>

                {/*
                  Future payment methods can be added here.

                  <option value="Mobile Money">
                    Mobile Money
                  </option>

                  <option value="Card">
                    Debit / Credit Card
                  </option>
                */}
              </select>

              <LoadingButton
                type="button"
                loading={confirming}
                loadingText="Processing..."
                onClick={confirmExtension}
                className="rounded-lg bg-green-700 px-8 py-3 font-semibold text-white hover:bg-green-800"
              >
                Confirm Extension
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </ReceptionistLayout>
  );
}

export default BookingExtension;