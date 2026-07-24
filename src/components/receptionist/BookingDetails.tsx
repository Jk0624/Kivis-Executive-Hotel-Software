interface BookingDetailsProps {
  booking: any;
  onClose: () => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "PAID":
      return "text-amber-600";

    case "CHECKED_IN":
      return "text-emerald-600";

    case "CHECKED_OUT":
      return "text-slate-600";

    case "CANCELLED":
      return "text-red-600";

    default:
      return "text-blue-600";
  }
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3">

      <span className="text-sm font-medium text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-900">
        {value}
      </span>

    </div>
  );
}

function BookingDetails({
  booking,
  onClose,
}: BookingDetailsProps) {

  const payment = booking.payments?.[0];

  return (

    <div className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            Booking Details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Reservation information and guest profile.
          </p>

        </div>

        <button
          onClick={onClose}
          className="rounded-lg border border-red-300 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Close
        </button>

      </div>

      <div className="space-y-8 p-8"></div>

              {/* Booking Information */}

        <section>

          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Booking Information
          </h3>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6">

            <DetailRow
              label="Booking Reference"
              value={booking.bookingId}
            />

            <DetailRow
              label="Status"
              value={
                <span className={getStatusColor(booking.status)}>
                  {booking.status.replaceAll("_", " ")}
                </span>
              }
            />

            <DetailRow
              label="Check-In"
              value={formatDate(booking.checkIn)}
            />

            <DetailRow
              label="Check-Out"
              value={formatDate(booking.checkOut)}
            />

          </div>

        </section>

        {/* Guest Information */}

        <section>

          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Guest Information
          </h3>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6">

            <DetailRow
              label="Guest Name"
              value={booking.user.name}
            />

            <DetailRow
              label="Phone Number"
              value={booking.user.phone}
            />

          </div>

        </section>

        {/* Room Information */}

        <section>

          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Room Information
          </h3>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6">

            <DetailRow
              label="Room Number"
              value={booking.room.roomNo}
            />

            <DetailRow
              label="Room Type"
              value={booking.room.type}
            />

            <DetailRow
              label="Room Price"
              value={`GH₵ ${booking.room.price.toFixed(2)}`}
            />

          </div>

        </section>

        {/* Payment Information */}

        <section>

          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Payment Information
          </h3>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6">

            <DetailRow
              label="Payment Status"
              value={
                payment ? (
                  <span className={getStatusColor(payment.status)}>
                    {payment.status}
                  </span>
                ) : (
                  "No Payment"
                )
              }
            />

            <DetailRow
              label="Payment Method"
              value={payment?.method ?? "N/A"}
            />

            <DetailRow
              label="Amount Paid"
              value={`GH₵ ${
                payment
                  ? payment.amount.toFixed(2)
                  : "0.00"
              }`}
            />

          </div>

        </section>

      </div>

  

  );
}

export default BookingDetails;