interface BookingDetailsProps {
  bookingId: string;
  onClose: () => void;
}

function BookingDetails({
  bookingId,
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
            <strong>Booking Reference:</strong> {bookingId}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span className="font-semibold text-blue-600">
              PAID
            </span>
          </p>

          <p>
            <strong>Check-In:</strong> 20 July 2026
          </p>

          <p>
            <strong>Check-Out:</strong> 23 July 2026
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
            <strong>Name:</strong> John Mensah
          </p>

          <p>
            <strong>Phone:</strong> +233 24 123 4567
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
            <strong>Room Number:</strong> 101
          </p>

          <p>
            <strong>Room Type:</strong> Executive Room
          </p>

          <p>
            <strong>Room Price:</strong> GH₵ 850.00
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
              SUCCESS
            </span>
          </p>

          <p>
            <strong>Method:</strong> Mobile Money
          </p>

          <p>
            <strong>Amount:</strong> GH₵ 2,550.00
          </p>

        </div>

      </div>
</div>
      
  );
}

export default BookingDetails;