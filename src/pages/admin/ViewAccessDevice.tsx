import AdminLayout from "../../layouts/AdminLayout";
import { useState } from "react";
import EditDeviceDrawer from "../../components/admin/EditDevicedrawer";
import DeleteDeviceModal from "../../components/admin/DeleteDeviceModal";

function ViewAccessDevice() {
    const [showEditDrawer, setShowEditDrawer] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold text-slate-900">
        Access Device
      </h1>

      <p className="mt-3 text-gray-600">
        View and manage the selected ESP32 smart access device.
      </p>

      {/* Device Information */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Device Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <p><strong>MAC Address:</strong> 24:6F:28:AB:CD:EF</p>

          <p><strong>Room:</strong> K101</p>

          <p><strong>Room Type:</strong> Executive</p>

          <p><strong>Created Date:</strong> 13 July 2026</p>

        </div>

      </div>

      {/* API Key */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          API Key
        </h2>

        <div className="flex items-center gap-4">

          <input
            type="password"
            value="******************************"
            readOnly
            className="flex-1 rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
          />

          <button className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800">
            Copy API Key
          </button>

        </div>

      </div>

      {/* Device Test */}

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Device Connection
        </h2>

        <button className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800">
          Test Connection
        </button>

      </div>

      {/* Device Actions */}

      <div className="mt-8 flex gap-4">

        <button
        onClick={() => setShowEditDrawer(true)}
        className="rounded-lg bg-yellow-600 px-6 py-3 font-semibold text-white hover:bg-yellow-700"
        >
        Edit Device
        </button>

        <button
        onClick={() => setShowDeleteModal(true)}
        className="rounded-lg bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800"
        >
        Delete Device
        </button>

      </div>
        <EditDeviceDrawer
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        />

        <DeleteDeviceModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
            // Backend delete request will be added later
            setShowDeleteModal(false);
        }}
        />

    </AdminLayout>
  );
}

export default ViewAccessDevice;