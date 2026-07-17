function BookingForm() {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-slate-900">
        Booking Details
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Check-in Date
          </label>

          <input
            type="date"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Check-out Date
          </label>

          <input
            type="date"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Adults
          </label>

          <input
            type="number"
            min="1"
            defaultValue="1"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Children
          </label>

          <input
            type="number"
            min="0"
            defaultValue="0"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700"
          />
        </div>
      </div>

      <h2 className="mt-12 text-2xl font-bold text-slate-900">
        Guest Information
      </h2>

      <div className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Phone Number
          </label>

          <input
            type="tel"
            placeholder="Enter your phone number"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700"
          />
        </div>
      </div>

      <button className="mt-10 w-full rounded-xl bg-blue-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-blue-800">
        Continue Booking
      </button>
    </div>
  );
}

export default BookingForm;