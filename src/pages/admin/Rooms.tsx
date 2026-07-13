import AdminLayout from "../../layouts/AdminLayout";

function Rooms() {
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Rooms
      </h1>

      <p className="mt-3 text-gray-600">
        Manage all hotel rooms.
      </p>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Rooms
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">Room</th>

                <th className="p-3 text-left">Type</th>

                <th className="p-3 text-left">Price</th>

                <th className="p-3 text-left">Status</th>

                <th className="p-3 text-left">Actions</th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-b">

                <td className="p-3">101</td>

                <td className="p-3">Executive</td>

                <td className="p-3">GHS 350</td>

                <td className="p-3">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    Available
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

export default Rooms;