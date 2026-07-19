import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

function BookingExtension() {
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<any | null>(null);
  const [newCheckOutDate, setNewCheckOutDate] = useState("");
  const [preview, setPreview] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

const searchBooking = async () => {
  try {
    const response = await api.get(
      `/reception/booking-extension/search?phone=${encodeURIComponent(phone)}`
    );

    setBooking(response.data.booking);
    setPreview(null);
    setNewCheckOutDate("");
  } catch (error: any) {
    setBooking(null);
    setPreview(null);
    setNewCheckOutDate("");
    alert(
      error.response?.data?.message ||
      "Booking not found."
    );
  }
};
const previewExtension = async () => {
  if (!booking) {
    return;
  }

  try {
    const response = await api.post(
      "/reception/booking-extension/preview",
      {
        bookingReference: booking.bookingReference,
        newCheckOutDate,
      }
    );

    setPreview(response.data.preview);
  } catch (error: any) {
    setPreview(null);

    alert(
      error.response?.data?.message ||
      "Failed to preview booking extension."
    );
  }
};

const confirmExtension = async () => {
  if (!booking || !preview) {
    return;
  }

  try {
    const response = await api.post(
      "/reception/booking-extension/confirm",
      {
        bookingReference: booking.bookingReference,
        newCheckOutDate,
        amount: preview.additionalAmount,
      }
    );

    toast.success(response.data.message);
  } catch (error: any) {
    toast.error(
      error.response?.data?.message ||
      "Failed to confirm booking extension."
    );
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

      {/* Search Card */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Search Checked-In Guest
        </h2>

        <div className="flex gap-4">

          <input
            type="text"
            placeholder="Enter guest's phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
          />

          <button
            onClick={searchBooking}
            className="rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Search
          </button>

        </div>

      </div>


      {/* Booking Details */}

      {booking && (
        <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
            Booking Details
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <p>
            <strong>Booking ID:</strong> {booking.bookingReference}
          </p>

          <p>
            <strong>Guest Name:</strong> {booking.guest.name}
          </p>

          <p>
            <strong>Phone Number:</strong> {booking.guest.phone}
          </p>

          <p>
            <strong>Room:</strong> {booking.room.roomNo} - {booking.room.type}
          </p>

          <p>
            <strong>Current Check-in:</strong>{" "}
            {new Date(booking.checkIn).toLocaleDateString()}
          </p>

          <p>
            <strong>Current Check-out:</strong>{" "}
            {new Date(booking.checkOut).toLocaleDateString()}
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



    {/* Extension Details */}

    {booking && (
      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

            <h2 className="mb-6 text-2xl font-semibold">
              Extension Details
            </h2>

            <div>
                  <label className="mb-2 block font-medium">
                    New Check-out Date
                  </label>

                  <div className="flex items-end gap-4">

                      <input
                        type="date"
                        value={newCheckOutDate}
                        onChange={(e) => setNewCheckOutDate(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <button
                        onClick={previewExtension}
                        className="rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800"
                      >
                        Preview Extension
                      </button>

                  </div>
            </div>

      </div>
    )}

    {/* Extension Preview */}

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


{/* Confirm Extension */}

{preview && (
    <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

    <h2 className="mb-6 text-2xl font-semibold">
      Confirm Extension
    </h2>

    <div>

      <label className="mb-2 block font-medium">
        Payment Method
      </label>

      <div className="flex items-end gap-4">

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
            >

              <option>Cash</option>

              {/* Future Payment Methods */}

              {/* <option>Mobile Money</option> */}

              {/* <option>Debit/Credit Card</option> */}

            </select>

            <button
              onClick={confirmExtension}
              className="rounded-lg bg-green-700 px-8 py-3 font-semibold text-white hover:bg-green-800"
            >
              Confirm Extension
            </button>

      </div>

  </div>
  </div>
)}

    </ReceptionistLayout>
  );
}

export default BookingExtension;