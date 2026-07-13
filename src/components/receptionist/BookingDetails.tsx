function BookingDetails() {
  return (
    <div className="mt-8 space-y-6">

      {/* Booking Information */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          Booking Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <p><strong>Booking ID:</strong> BK-10245</p>
          <p><strong>Booking Date:</strong> 10 July 2026</p>
          <p>
            <strong>Payment:</strong>{" "}
            <span className="font-semibold text-green-600">
              Verified
            </span>
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="font-semibold text-blue-600">
              Reserved
            </span>
          </p>
        </div>
      </div>

      {/* Guest Information */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          Guest Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <p><strong>Name:</strong> John Mensah</p>
          <p><strong>Phone:</strong> +233 24 123 4567</p>
          <p><strong>Email:</strong> john@email.com</p>
          <p><strong>Nationality:</strong> Ghanaian</p>
        </div>
      </div>

      {/* Stay Information */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          Stay Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <p><strong>Room:</strong> Executive Room</p>
          <p><strong>Guests:</strong> 2</p>
          <p><strong>Check-in:</strong> 15 July 2026</p>
          <p><strong>Check-out:</strong> 18 July 2026</p>
        </div>
      </div>

      {/* Smart Access */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          Smart Access
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <p>
            <strong>PIN Status:</strong>{" "}
            <span className="font-semibold text-green-600">
              Sent to Guest
            </span>
          </p>

          <p>
            <strong>RFID Status:</strong>{" "}
            <span className="font-semibold text-red-600">
              Not Assigned
            </span>
          </p>
        </div>
      </div>

    </div>
  );
}

export default BookingDetails;