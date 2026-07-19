import { useState } from "react";
import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import api from "../../services/api";

function CheckIn() {

  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<any | null>(null);


  const searchBooking = async () => {
    try {
      const response = await api.get(
        `/reception/check-in/search?phone=${encodeURIComponent(phone)}`
      );

      setBooking(response.data.booking);
    } catch (error: any) {
      setBooking(null);

      alert(
        error.response?.data?.message ||
        "Booking not found."
      );
    }
  };


const checkInGuest = async () => {
  if (!booking) return;

  try {
    const response = await api.post("/reception/check-in", {
      bookingReference: booking.bookingReference,
    });

    alert(response.data.message);

    setBooking(null);
    setPhone("");
  } catch (error: any) {
    alert(
      error.response?.data?.message ||
      "Failed to check in guest."
    );
  }
};




  return (
    <ReceptionistLayout>
      <h1 className="text-4xl font-bold text-slate-900">
        Guest Check-In
      </h1>

      <p className="mt-3 text-gray-600">
        Search the booking using the phone number, verify and check the guest into the hotel.
      </p>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Guest Verification
        </h2>

        <div className="flex gap-4">

          <input
            type="text"
            placeholder="Enter phone number"
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

      {booking && (
  <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

    <h2 className="mb-6 text-2xl font-semibold">
      Guest Details
    </h2>

    <div className="grid gap-6 md:grid-cols-2">

      <p>
        <strong>Booking ID:</strong>{" "}
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
        <strong>Payment:</strong>{" "}
        <span className="font-semibold text-green-600">
          {booking.paymentStatus}
        </span>
      </p>

      <p>
        <strong>Check-in Date:</strong>{" "}
        {new Date(booking.checkIn).toLocaleDateString()}
      </p>

      <p>
        <strong>Check-out Date:</strong>{" "}
        {new Date(booking.checkOut).toLocaleDateString()}
      </p>

    </div>

  </div>
)}


<div className="mt-8 flex justify-end">

  {booking && (
  <div className="mt-8 flex justify-end">
    <button
      onClick={checkInGuest}
      className="rounded-lg bg-green-700 px-10 py-3 font-semibold text-white transition hover:bg-green-800"
    >
      Check In Guest
    </button>
  </div>
)}

</div>

    </ReceptionistLayout>
  );
}

export default CheckIn;