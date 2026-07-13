import AdminLayout from "../../layouts/AdminLayout";

function GuestProfile() {
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Guest Profile
      </h1>

      <p className="mt-3 text-gray-600">
        View detailed information about the selected guest.
      </p>

      {/* Guest Information */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Guest Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <p><strong>Name:</strong> John Mensah</p>

          <p><strong>Phone:</strong> 0241234567</p>

          <p><strong>Email:</strong> john@email.com</p>

        </div>

      </div>

      {/* Current Booking */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Current Booking
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <p><strong>Booking ID:</strong> BK-202600125</p>

          <p><strong>Room:</strong> 101</p>

          <p><strong>Check In:</strong> 20 Jul 2026</p>

          <p><strong>Check Out:</strong> 23 Jul 2026</p>

          <p>
            <strong>Status:</strong>{" "}
            <span className="font-semibold text-green-600">
              Checked In
            </span>
          </p>

        </div>

      </div>

      {/* Booking History */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Booking History
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">Booking ID</th>
                <th className="p-3 text-left">Room</th>
                <th className="p-3 text-left">Check In</th>
                <th className="p-3 text-left">Check Out</th>
                <th className="p-3 text-left">Status</th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td className="p-3">BK-202600101</td>
                <td className="p-3">205</td>
                <td className="p-3">10 Jun 2026</td>
                <td className="p-3">13 Jun 2026</td>
                <td className="p-3">Checked Out</td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </AdminLayout>
  );
}

export default GuestProfile;