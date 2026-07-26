import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import RegisterDeviceModal from "../../components/admin/access-devices/RegisterDeviceModal";
import EditDeviceModal from "../../components/admin/access-devices/EditDeviceModal";

interface AccessDevice {
  id: string;
  deviceId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  room: {
    roomNo: string;
    type: string;
    status: string;
  };
}

function AccessDevices() {
  const [devices, setDevices] = useState<AccessDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showRegisterModal, setShowRegisterModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedDevice, setSelectedDevice] =
    useState<AccessDevice | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/admin/access-devices"
      );

      setDevices(response.data.accessDevices);
    } catch (error) {
      console.error(
        "Failed to load access devices:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const keyword = search.toLowerCase();

      return (
        device.deviceId
          .toLowerCase()
          .includes(keyword) ||
        device.room.roomNo
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [devices, search]);

  const totalDevices = devices.length;

  const activeDevices =
    devices.filter(
      (device) => device.isActive
    ).length;

  const disabledDevices =
    devices.filter(
      (device) => !device.isActive
    ).length;

  const connectedRooms =
    devices.length;

  const handleDisable = async (
    id: string
  ) => {
    if (
      !window.confirm(
        "Disable this access device?"
      )
    ) {
      return;
    }

    try {
      await api.patch(
        `/admin/access-devices/${id}/disable`
      );

      fetchDevices();
    } catch (error) {
      console.error(error);
      alert("Failed to disable device.");
    }
  };

  const handleEnable = async (
    id: string
  ) => {
    if (
      !window.confirm(
        "Enable this access device?"
      )
    ) {
      return;
    }

    try {
      await api.patch(
        `/admin/access-devices/${id}/enable`
      );

      fetchDevices();
    } catch (error) {
      console.error(error);
      alert("Failed to enable device.");
    }
  };

  return (
    <AdminLayout>

      <div className="flex items-center justify-between">

        <h1 className="text-4xl font-bold text-slate-900">
          Access Devices
        </h1>

        <button
          onClick={() =>
            setShowRegisterModal(true)
          }
          className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
        >
          + Register Device
        </button>

      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-4">

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">
            Total Devices
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {totalDevices}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">
            Active
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {activeDevices}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">
            Disabled
          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {disabledDevices}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">
            Connected Rooms
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {connectedRooms}
          </h2>
        </div>

      </div>

      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">

        <div className="mb-6">

          <input
            type="text"
            placeholder="Search by Device ID or Room Number..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />

        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-500">
            Loading access devices...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b bg-slate-100 text-left">
                  <th className="px-4 py-3">Device ID</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Room Type</th>
                  <th className="px-4 py-3">Room Status</th>
                  <th className="px-4 py-3">Device Status</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDevices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-500"
                    >
                      No access devices found.
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((device) => (
                    <tr
                      key={device.id}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {device.deviceId}
                      </td>

                      <td className="px-4 py-3">
                        {device.room.roomNo}
                      </td>

                      <td className="px-4 py-3">
                        {device.room.type}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            device.room.status === "AVAILABLE"
                              ? "bg-green-100 text-green-700"
                              : device.room.status === "OCCUPIED"
                              ? "bg-red-100 text-red-700"
                              : device.room.status === "RESERVED"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {device.room.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            device.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {device.isActive
                            ? "ACTIVE"
                            : "DISABLED"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {new Date(
                          device.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Link
                            to={`/admin/access-devices/${device.id}`}
                            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                          >
                            View
                          </Link>

                          <button
                            onClick={() => {
                              setSelectedDevice(device);
                              setShowEditModal(true);
                            }}
                            className="rounded bg-amber-500 px-3 py-1 text-sm text-white hover:bg-amber-600"
                          >
                            Edit
                          </button>

                          {device.isActive ? (
                            <button
                              onClick={() =>
                                handleDisable(device.id)
                              }
                              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                            >
                              Disable
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleEnable(device.id)
                              }
                              className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                            >
                              Enable
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}


      </div>

      <RegisterDeviceModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          setShowRegisterModal(false);
          fetchDevices();
        }}
      />

      {selectedDevice && (
        <EditDeviceModal
          isOpen={showEditModal}
          device={selectedDevice}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDevice(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedDevice(null);
            fetchDevices();
          }}
        />
      )}

    </AdminLayout>
  );
}

export default AccessDevices;