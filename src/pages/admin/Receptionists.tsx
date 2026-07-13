import AdminLayout from "../../layouts/AdminLayout";
import { useState } from "react";
import CreateReceptionistDrawer from "../../components/admin/CreateReceptionistDrawer";

function Receptionists() {
    const [showDrawer, setShowDrawer] = useState(false);
  return (
    <AdminLayout>

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-slate-900">
            Receptionists
          </h1>

          <p className="mt-2 text-gray-600">
            Manage receptionist accounts.
          </p>

        </div>

        <button
        onClick={() => setShowDrawer(true)}
        className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
        >
        + Create Receptionist
        </button>

      </div>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">Employee ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-b">

                <td className="p-3">REC001</td>

                <td className="p-3">Mary Ann</td>

                <td className="p-3">0241234567</td>

                <td className="p-3">

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    Active
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

        <CreateReceptionistDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        />

    </AdminLayout>
  );
}

export default Receptionists;