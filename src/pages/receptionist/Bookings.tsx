import { useRef, useState } from "react";
import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import BookingDetails from "../../components/receptionist/BookingDetails";




const bookings = [
  {
    bookingId: "BK-100001",
    guest: "John Mensah",
    phone: "0241234567",
    room: "101",
    checkIn: "20 Jul 2026",
    status: "PAID",
  },
  {
    bookingId: "BK-100002",
    guest: "Mary Asante",
    phone: "0559876543",
    room: "203",
    checkIn: "22 Jul 2026",
    status: "CHECKED_IN",
  },
  {
    bookingId: "BK-100003",
    guest: "Daniel Owusu",
    phone: "0201112233",
    room: "104",
    checkIn: "25 Jul 2026",
    status: "PENDING",
  },
];

function Bookings() {

  const [selectedBooking, setSelectedBooking] =
    useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);  
  const bookingsRef = useRef<HTMLDivElement>(null);
  return (
    <ReceptionistLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Bookings
      </h1>

      <p className="mt-3 text-gray-600">
        Search and manage guest bookings using the booking ID or phone number.
      </p>

      <div className="mt-10 rounded-xl bg-white p-8 shadow-md">

        <h2 className="text-2xl font-semibold">
          Search Booking
        </h2>

        <div className="mt-6 flex gap-4">

          <input
            type="text"
            placeholder="Enter Booking ID..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
          />

          <button className="rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800">
            Search
          </button>

        </div>

      </div>

      <div
        ref={bookingsRef}
        className="mt-10 rounded-xl bg-white p-8 shadow-md"
      >

      <h2 className="text-2xl font-semibold">
        All Bookings
      </h2>

      <div className="mt-6 overflow-x-auto">

        <table className="min-w-full border-collapse">

          <thead>
            <tr className="border-b text-left">
              <th className="py-3">Booking ID</th>
              <th className="py-3">Guest</th>
              <th className="py-3">Phone</th>
              <th className="py-3">Room</th>
              <th className="py-3">Check-In</th>
              <th className="py-3">Status</th>
              <th className="py-3">Action</th>
            </tr>
          </thead>

          <tbody>

            {bookings.map((booking) => (

              <tr
                key={booking.bookingId}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-4">{booking.bookingId}</td>
                <td>{booking.guest}</td>
                <td>{booking.phone}</td>
                <td>{booking.room}</td>
                <td>{booking.checkIn}</td>
                <td>{booking.status}</td>

                <td>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking.bookingId);

                      setTimeout(() => {
                        detailsRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 100);
                    }}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    View Details
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

    {selectedBooking && (
      <div ref={detailsRef}>
        <BookingDetails
          bookingId={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      </div>
    )}
    </ReceptionistLayout>
  );
}

export default Bookings;