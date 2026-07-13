import AdminLayout from "../../layouts/AdminLayout";
import { useNavigate } from "react-router-dom";


function Guests() {
    const navigate = useNavigate();
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Guests
      </h1>

      <p className="mt-3 text-gray-600">
        View and manage all hotel guests.
      </p>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Guests
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">Guest</th>

                <th className="p-3 text-left">Phone</th>

                <th className="p-3 text-left">Email</th>

                <th className="p-3 text-left">Bookings</th>

                <th className="p-3 text-left">Action</th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-b">

                <td className="p-3">John Mensah</td>

                <td className="p-3">0241234567</td>

                <td className="p-3">john@email.com</td>

                <td className="p-3">5</td>

                <td className="p-3">

                  <button
                    onClick={() => navigate("/admin/guests/profile")}
                    className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
                    >
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

export default Guests;