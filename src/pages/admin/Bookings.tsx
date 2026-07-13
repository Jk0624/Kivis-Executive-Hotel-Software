import AdminLayout from "../../layouts/AdminLayout";

function Bookings() {
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Bookings
      </h1>

      <p className="mt-3 text-gray-600">
        View and monitor all hotel bookings.
      </p>

      {/* Search */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Search Bookings
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <input
            type="text"
            placeholder="Booking ID"
            className="rounded-lg border border-gray-300 px-4 py-3"
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="rounded-lg border border-gray-300 px-4 py-3"
          />

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

              <tr className="border-b">

                <th className="p-3 text-left">Booking</th>
                <th className="p-3 text-left">Guest</th>
                <th className="p-3 text-left">Room</th>
                <th className="p-3 text-left">Check In</th>
                <th className="p-3 text-left">Check Out</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-b">

                <td className="p-3">BK-202600125</td>

                <td className="p-3">John Mensah</td>

                <td className="p-3">101</td>

                <td className="p-3">20 Jul 2026</td>

                <td className="p-3">23 Jul 2026</td>

                <td className="p-3">

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    Checked In
                  </span>

                </td>

                <td className="p-3">

                  <button className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800">
                    View
                  </button>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </AdminLayout>
  );
}

export default Bookings;