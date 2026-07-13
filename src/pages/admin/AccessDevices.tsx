import AdminLayout from "../../layouts/AdminLayout";
import { useState } from "react";
import RegisterDeviceDrawer from "../../components/admin/RegisterDeviceDrawer";
import { useNavigate } from "react-router-dom";

function AccessDevices() {
    const navigate = useNavigate();

    const [showDrawer, setShowDrawer] = useState(false);
  return (
    <AdminLayout>

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-slate-900">
            Access Device Management
          </h1>

          <p className="mt-2 text-gray-600">
            Manage all ESP32 smart access devices.
          </p>

        </div>

        <button
        onClick={() => setShowDrawer(true)}
        className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
        >
        + Register Device
        </button>

      </div>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Registered Devices
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">
                  MAC Address
                </th>

                <th className="p-3 text-left">
                  Room
                </th>

                <th className="p-3 text-left">
                  Room Type
                </th>

                <th className="p-3 text-left">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-b">

                <td className="p-3">
                  24:6F:28:AB:CD:EF
                </td>

                <td className="p-3">
                  K101
                </td>

                <td className="p-3">
                  Executive
                </td>

                <td className="p-3">

                  <button
                onClick={() => navigate("/admin/access-devices/view")}
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

      <RegisterDeviceDrawer
  isOpen={showDrawer}
  onClose={() => setShowDrawer(false)}
/>

    </AdminLayout>
  );
}

export default AccessDevices;