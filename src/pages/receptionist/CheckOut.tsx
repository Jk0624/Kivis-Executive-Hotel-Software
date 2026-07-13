import ReceptionistLayout from "../../layouts/ReceptionistLayout";

function CheckOut() {
  return (
    <ReceptionistLayout>
      <h1 className="text-4xl font-bold text-slate-900">
        Guest Check-Out
      </h1>

      <p className="mt-3 text-gray-600">
        Search for a checked-in guest and complete the check-out process using the phone number.
      </p>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Guest Verification
        </h2>

        <div className="flex gap-4">

          <input
            type="text"
            placeholder="Enter Phone Number"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
          />

          <button className="rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800">
            Search
          </button>

        </div>

      </div>

    <div className="mt-8 rounded-xl bg-white p-8    shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
            Guest Details
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

            <p><strong>Booking ID:</strong> BK-202600125</p>

            <p><strong>Name:</strong> John Mensah</p>

            <p><strong>Phone:</strong> 0241234567</p>

            <p><strong>Room:</strong> 101 - Executive Room</p>

            <p>
            <strong>Payment:</strong>{" "}
            <span className="font-semibold text-green-600">
                Verified
            </span>
            </p>

            <p><strong>Check-in Date:</strong> 20 July 2026</p>

            <p><strong>Check-out Date:</strong> 23 July 2026</p>

        </div>

    </div>

    <div className="mt-8 flex justify-end">

        <button className="rounded-lg bg-red-700 px-10 py-3 font-semibold text-white transition hover:bg-red-800">
            Check Out Guest
        </button>

    </div>

    </ReceptionistLayout>
  );
}

export default CheckOut;