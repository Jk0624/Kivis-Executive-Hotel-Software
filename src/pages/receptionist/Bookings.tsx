import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import BookingDetails from "../../components/receptionist/BookingDetails";

function Bookings() {
  return (
    <ReceptionistLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Booking Verification
      </h1>

      <p className="mt-3 text-gray-600">
        Search for a booking using the Booking ID.
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
      <BookingDetails />

    </ReceptionistLayout>
  );
}

export default Bookings;