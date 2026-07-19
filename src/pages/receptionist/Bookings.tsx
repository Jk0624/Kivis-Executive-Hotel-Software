import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import BookingDetails from "../../components/receptionist/BookingDetails";





function Bookings() {

  const [selectedBooking, setSelectedBooking] =
  useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const detailsRef = useRef<HTMLDivElement>(null);  
  const bookingsRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
  const fetchBookings = async () => {
    try {
      const response = await api.get("/reception/bookings");

      console.log(response.data);

      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchBookings();
}, []);

  return (
    <ReceptionistLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Bookings
      </h1>

      <p className="mt-3 text-gray-600">
        Search and manage guest bookings using the booking ID or phone number.
      </p>

      <div
        ref={bookingsRef}
        className="mt-10 rounded-xl bg-white p-8 shadow-md"
      >

        <h2 className="text-2xl font-semibold">
          Search Booking
        </h2>

        <div className="mt-6 flex gap-4">

          <input
            type="text"
            value={search}
            onChange={async (e) => {
              const value = e.target.value;
              setSearch(value);

              if (value.trim() === "") {
                try {
                  setLoading(true);

                  const response = await api.get("/reception/bookings");
                  setBookings(response.data.bookings);
                } catch (error) {
                  console.error("Failed to reload bookings:", error);
                } finally {
                  setLoading(false);
                }
              }
            }}
            placeholder="Enter Booking ID or Phone Number..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
          />

          <button
              onClick={async () => {
                try {
                  setLoading(true);

                  if (search.trim() === "") {
                    const response = await api.get("/reception/bookings");
                    setBookings(response.data.bookings);
                  } else {
                    const response = await api.get(
                      `/reception/bookings/search?search=${encodeURIComponent(search)}`
                    );

                    setBookings(response.data.bookings);
                  }
                } catch (error) {
                  console.error("Search failed:", error);
                  alert("Failed to search bookings.");
                } finally {
                  setLoading(false);
                }
              }}
              className="rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Search
            </button>

        </div>

      </div>

      <div
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

                <td>{booking.user.name}</td>

                <td>{booking.user.phone}</td>

                <td>{booking.room.roomNo}</td>

                <td>
                  {new Date(booking.checkIn).toLocaleDateString()}
                </td>

                <td>{booking.status}</td>

                <td>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);

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
          booking={selectedBooking}
          onClose={() => {
            setSelectedBooking(null);

            setTimeout(() => {
              bookingsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }, 100);
          }}
        />
      </div>
    )}
    </ReceptionistLayout>
  );
}

export default Bookings;