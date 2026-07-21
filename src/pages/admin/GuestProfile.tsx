import AdminLayout from "../../layouts/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

function GuestProfile() {
  const { guestId } = useParams();
  const navigate = useNavigate();

const [guest, setGuest] = useState<any>(null);
const [bookings, setBookings] = useState<any[]>([]);
const currentBooking = bookings.length > 0 ? bookings[0] : null;

const fetchGuest = async () => {
  try {
    const guestResponse = await api.get(
      `/admin/guests/${guestId}`
    );

    setGuest(guestResponse.data.guest);

    const bookingResponse = await api.get(
      `/admin/guests/${guestId}/bookings`
    );

    setBookings(bookingResponse.data.bookings);

  } catch (error) {
    console.error("Failed to fetch guest:", error);
  }
};


useEffect(() => {
  if (guestId) {
    fetchGuest();
  }
}, [guestId]);
  return (
    <AdminLayout>

      <button
  onClick={() => navigate("/admin/guests")}
  className="mb-6 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
>
  ← Back to Guests
</button>

      <h1 className="text-4xl font-bold text-slate-900">
        Guest Profile
      </h1>

      <p className="mt-3 text-gray-600">
        View detailed information about the selected guest.
      </p>

      {/* Guest Information */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Guest Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <p>
            <strong>Name:</strong> {guest?.name}
          </p>

          <p>
            <strong>Phone:</strong> {guest?.phone}
          </p>

          <p>
            <strong>Email:</strong> {guest?.email}
          </p>

          <p>
            <strong>Verified:</strong>{" "}
            <span
              className={
                guest?.isVerified
                  ? "font-semibold text-green-600"
                  : "font-semibold text-red-600"
              }
            >
              {guest?.isVerified ? "Verified" : "Not Verified"}
            </span>
          </p>

          <p>
            <strong>Total Bookings:</strong>{" "}
            {guest?._count?.bookings}
          </p>

          <p>
            <strong>Joined:</strong>{" "}
            {guest?.createdAt
              ? new Date(guest.createdAt).toLocaleDateString()
              : ""}
          </p>

        </div>

      </div>

      {/* Current Booking */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Current Booking
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

  <p>
    <strong>Booking ID:</strong>{" "}
    {currentBooking?.bookingId ?? "N/A"}
  </p>

  <p>
    <strong>Room:</strong>{" "}
    {currentBooking?.room?.roomNumber ?? "N/A"}
  </p>

  <p>
    <strong>Check In:</strong>{" "}
    {currentBooking?.checkIn
      ? new Date(currentBooking.checkIn).toLocaleDateString()
      : "N/A"}
  </p>

  <p>
    <strong>Check Out:</strong>{" "}
    {currentBooking?.checkOut
      ? new Date(currentBooking.checkOut).toLocaleDateString()
      : "N/A"}
  </p>

  <p>
    <strong>Status:</strong>{" "}
    <span className="font-semibold">
      {currentBooking?.status ?? "N/A"}
    </span>
  </p>

</div>

      </div>

      {/* Booking History */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Booking History
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">Booking ID</th>
                <th className="p-3 text-left">Room</th>
                <th className="p-3 text-left">Check In</th>
                <th className="p-3 text-left">Check Out</th>
                <th className="p-3 text-left">Status</th>

              </tr>

            </thead>

            <tbody>
  {bookings.map((booking) => (
    <tr key={booking.id} className="border-b">

      <td className="p-3">
        {booking.bookingId}
      </td>

      <td className="p-3">
        {booking.room?.roomNumber}
      </td>

      <td className="p-3">
        {new Date(booking.checkIn).toLocaleDateString()}
      </td>

      <td className="p-3">
        {new Date(booking.checkOut).toLocaleDateString()}
      </td>

      <td className="p-3">
        {booking.status}
      </td>

    </tr>
  ))}
</tbody>

          </table>

        </div>

      </div>

    </AdminLayout>
  );
}

export default GuestProfile;