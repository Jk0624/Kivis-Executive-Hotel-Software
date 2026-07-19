interface BookingDetailsProps {
  booking: any;
  onClose: () => void;
}

function BookingDetails({
  booking,
  onClose,
}: BookingDetailsProps) {
  return (
    <div className="mt-8 space-y-6">

      {/* Booking Information */}
      <div className="rounded-xl bg-white p-6 shadow-md">

        <div className="mb-4 flex items-center justify-between">

        <h2 className="text-2xl font-bold text-slate-900">
          Booking Information
        </h2>

        <button
          onClick={onClose}
          className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Close
        </button>

      </div>

        <div className="grid gap-4 md:grid-cols-2">

          <p>
            <strong>Booking Reference:</strong> {booking.bookingId}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span className="font-semibold text-blue-600">
              {booking.status}
            </span>
          </p>

          <p>
            <strong>Check-In:</strong>{" "}
            {new Date(booking.checkIn).toLocaleDateString()}
          </p>

          <p>
            <strong>Check-Out:</strong>{" "}
            {new Date(booking.checkOut).toLocaleDateString()}
          </p>

        </div>

      </div>

      {/* Guest Information */}
      <div className="rounded-xl bg-white p-6 shadow-md">

        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          Guest Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">

          <p>
            <strong>Name:</strong> {booking.user.name}
          </p>

          <p>
            <strong>Phone:</strong> {booking.user.phone}
          </p>

        </div>

      </div>

      {/* Room Information */}
      <div className="rounded-xl bg-white p-6 shadow-md">

        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          Room Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">

          <p>
            <strong>Room Number:</strong> {booking.room.roomNo}
          </p>

          <p>
            <strong>Room Type:</strong> {booking.room.type}
          </p>

          <p>
            <strong>Room Price:</strong> GH₵ {booking.room.price.toFixed(2)}
          </p>

        </div>

      </div>



      {/* Payment Information */}
      <div className="rounded-xl bg-white p-6 shadow-md">

        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          Payment Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">

          <p>
            <strong>Status:</strong>{" "}
            <span className="font-semibold text-green-600">
              {booking.payments.length > 0
                ? booking.payments[0].status
                : "No Payment"}
            </span>
          </p>

          <p>
            <strong>Method:</strong>{" "}
            {booking.payments.length > 0
              ? booking.payments[0].method
              : "N/A"}
          </p>

          <p>
            <strong>Amount:</strong>{" "}
            GH₵{" "}
            {booking.payments.length > 0
              ? booking.payments[0].amount.toFixed(2)
              : "0.00"}
          </p>

        </div>

      </div>
</div>
      
  );
}

export default BookingDetails;