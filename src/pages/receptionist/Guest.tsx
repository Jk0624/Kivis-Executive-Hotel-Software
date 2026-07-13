import ReceptionistLayout from "../../layouts/ReceptionistLayout";

function Guest() {
  return (
    <ReceptionistLayout>

    <h1 className="text-4xl font-bold text-slate-900">
  Guest Management
</h1>

<p className="mt-3 text-gray-600">
  View and manage all hotel guests.
</p>

{/* Filters */}

<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Filter Guests
  </h2>

  <div className="grid gap-6 md:grid-cols-3">

    <input
      type="date"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <input
      type="text"
      placeholder="Guest Name"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <input
      type="text"
      placeholder="Phone Number"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <input
      type="text"
      placeholder="Room Number"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <input
      type="text"
      placeholder="Booking ID"
      className="rounded-lg border border-gray-300 px-4 py-3"
    />

    <select className="rounded-lg border border-gray-300 px-4 py-3">

      <option>All Booking Status</option>

      <option>Checked In</option>

      <option>Checked Out</option>

    </select>

  </div>

</div>

{/* Guests */}

<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Guests
  </h2>

  <div className="overflow-x-auto">

    <table className="w-full border-collapse">

      <thead>

        <tr className="border-b">

          <th className="p-3 text-left">Name</th>

          <th className="p-3 text-left">Phone</th>

          <th className="p-3 text-left">Room</th>

          <th className="p-3 text-left">Booking ID</th>

          <th className="p-3 text-left">Status</th>

          <th className="p-3 text-left">PIN</th>

          <th className="p-3 text-left">Actions</th>

        </tr>

      </thead>

      <tbody>

        <tr>

          <td className="p-3">John Mensah</td>

          <td className="p-3">0241234567</td>

          <td className="p-3">101</td>

          <td className="p-3">BK-202600125</td>

          <td className="p-3 text-green-600 font-semibold">
            Checked In
          </td>

          <td className="p-3">
            ••••••
          </td>

          <td className="p-3">

            <div className="flex gap-2">

              <button className="rounded bg-blue-700 px-3 py-2 text-white">
                Resend PIN
              </button>

              <button className="rounded bg-green-700 px-3 py-2 text-white">
                Reveal PIN
              </button>

            </div>

          </td>

        </tr>

      </tbody>

    </table>

  </div>

</div>

     
    </ReceptionistLayout>
  );
}

export default Guest;