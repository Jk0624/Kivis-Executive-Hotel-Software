import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import { useEffect, useState } from "react";
import api from "../../services/api";

function Guest() {
  const [guests, setGuests] = useState<any[]>([]);
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await api.get("/reception/guests");
        setGuests(response.data.guests);
      } catch (error) {
        console.error("Failed to fetch guests:", error);
      }
    };

    fetchGuests();
  }, []);
  return (
    <ReceptionistLayout>

    <h1 className="text-4xl font-bold text-slate-900">
  Guest Management
</h1>

<p className="mt-3 text-gray-600">
  View and manage all hotel guests.
</p>

{/* Filters */}

<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Filter Guests
  </h2>

  <div className="grid gap-6 md:grid-cols-3">

    <input
      type="date"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <input
      type="text"
      placeholder="Guest Name"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <input
      type="text"
      placeholder="Phone Number"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <input
      type="text"
      placeholder="Room Number"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <input
      type="text"
      placeholder="Booking ID"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <select className="rounded-lg border border-gray-300 px-4 py-3">

      <option>All Booking Status</option>

      <option>Checked In</option>

      <option>Checked Out</option>

    </select>

  </div>

</div>

{/* Guests */}

<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Guests
  </h2>

  <div className="overflow-x-auto">

    <table className="w-full border-collapse">

      <thead>

        <tr className="border-b">

          <th className="p-3 text-left">Name</th>

          <th className="p-3 text-left">Phone</th>

          <th className="p-3 text-left">Room</th>

          <th className="p-3 text-left">Booking ID</th>

          <th className="p-3 text-left">Payment Status</th>

          <th className="p-3 text-left">Status</th>

          <th className="p-3 text-left">PIN</th>

          <th className="p-3 text-left">Actions</th>

        </tr>

      </thead>

      <tbody>
  {guests.map((guest) => (
    <tr key={guest.bookingId}>
      <td className="p-3">{guest.guestName}</td>

      <td className="p-3">{guest.phoneNumber}</td>

      <td className="p-3">{guest.roomNumber}</td>

      <td className="p-3">{guest.bookingId}</td>

      <td className="p-3 font-semibold">
        {guest.paymentStatus}
      </td>

      <td className="p-3 font-semibold">
        {guest.bookingStatus}
      </td>

      <td className="p-3">
        {guest.hasAccessPin ? "Available" : "Not Available"}
      </td>

      <td className="p-3">
        <div className="flex gap-2">
          <button className="rounded bg-blue-700 px-3 py-2 text-white">
            Resend PIN
          </button>

          <button className="rounded bg-green-700 px-3 py-2 text-white">
            Reveal PIN
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

    </table>

  </div>

</div>

     
    </ReceptionistLayout>
  );
}

export default Guest;