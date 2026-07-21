import AdminLayout from "../../layouts/AdminLayout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";


function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [bookingId, setBookingId] = useState("");
  const [phone, setPhone] = useState("");

const fetchBookings = async () => {
  try {
    const response = await api.get("/admin/bookings");
    setBookings(response.data.bookings);
  } catch (error) {
    console.error(error);
  }
};

const fetchStatistics = async () => {
  try {
    const response = await api.get("/admin/bookings/statistics");
    
    setStatistics(response.data);
  } catch (error) {
    console.error(error);
  }
};

const searchBookings = async () => {
  try {
    if (!bookingId.trim() && !phone.trim()) {
      fetchBookings();
      return;
    }

    const response = await api.get("/admin/bookings/search", {
      params: {
        bookingId: bookingId || undefined,
        phone: phone || undefined,
      },
    });

    setBookings(response.data.bookings);
  } catch (error) {
    console.error(error);
  }
};


useEffect(() => {
  fetchBookings();
  fetchStatistics();
}, []);


  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Bookings
      </h1>

      <p className="mt-3 text-gray-600">
        View and monitor all hotel bookings.
      </p>

      {statistics && (
  <div className="mt-8 grid gap-6 md:grid-cols-3 lg:grid-cols-6">

    <div className="rounded-xl bg-white p-6 shadow-md">
      <p className="text-sm text-gray-500">Total</p>
      <h2 className="mt-2 text-3xl font-bold">
        {statistics.totalBookings}
      </h2>
    </div>

    <div className="rounded-xl bg-white p-6 shadow-md">
      <p className="text-sm text-gray-500">Pending</p>
      <h2 className="mt-2 text-3xl font-bold text-yellow-600">
        {statistics.pendingBookings}
      </h2>
    </div>

    <div className="rounded-xl bg-white p-6 shadow-md">
      <p className="text-sm text-gray-500">Paid</p>
      <h2 className="mt-2 text-3xl font-bold text-blue-600">
        {statistics.paidBookings}
      </h2>
    </div>

    <div className="rounded-xl bg-white p-6 shadow-md">
      <p className="text-sm text-gray-500">Checked In</p>
      <h2 className="mt-2 text-3xl font-bold text-green-600">
        {statistics.checkedInBookings}
      </h2>
    </div>

    <div className="rounded-xl bg-white p-6 shadow-md">
      <p className="text-sm text-gray-500">Checked Out</p>
      <h2 className="mt-2 text-3xl font-bold text-gray-600">
        {statistics.checkedOutBookings}
      </h2>
    </div>

    <div className="rounded-xl bg-white p-6 shadow-md">
      <p className="text-sm text-gray-500">Cancelled</p>
      <h2 className="mt-2 text-3xl font-bold text-red-600">
        {statistics.cancelledBookings}
      </h2>
    </div>

  </div>
)}

      {/* Search */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Search Bookings
        </h2>

        <div className="grid gap-6 md:grid-cols-3">

          <input
            type="text"
            placeholder="Booking ID"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3"
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3"
          />

          <button
            onClick={searchBookings}
            className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Search
          </button> 
          

        </div>

      </div>

      {/* Bookings Table */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Bookings
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

           <thead>
              <tr className="border-b bg-slate-100">
                <th className="p-3 text-left">Booking ID</th>
                <th className="p-3 text-left">Guest Name</th>
                <th className="p-3 text-left">Room Number</th>
                <th className="p-3 text-left">Check In</th>
                <th className="p-3 text-left">Check Out</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

<tbody>
  {bookings.map((booking) => (
    <tr key={booking.bookingId} className="border-b">

      <td className="p-3">{booking.bookingId}</td>

      <td className="p-3">
        {booking.user?.name || "Guest"}
      </td>

      <td className="p-3">
        {booking.room?.roomNo}
      </td>

      <td className="p-3">
        {new Date(booking.checkIn).toLocaleDateString()}
      </td>

      <td className="p-3">
        {new Date(booking.checkOut).toLocaleDateString()}
      </td>

      <td className="p-3">
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            booking.status === "CHECKED_IN"
              ? "bg-green-100 text-green-700"
              : booking.status === "PAID"
              ? "bg-blue-100 text-blue-700"
              : booking.status === "PENDING"
              ? "bg-yellow-100 text-yellow-700"
              : booking.status === "CHECKED_OUT"
              ? "bg-gray-100 text-gray-700"
              : booking.status === "CANCELLED"
              ? "bg-red-100 text-red-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {booking.status.replaceAll("_", " ")}
        </span>
      </td>

      <td className="p-3">
        <Link
          to={`/admin/bookings/${booking.bookingId}`}
          className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
        >
          View
        </Link>
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

export default Bookings;