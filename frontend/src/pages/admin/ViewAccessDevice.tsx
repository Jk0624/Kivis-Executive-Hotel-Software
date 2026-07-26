import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

interface AccessDevice {
  id: string;
  deviceId: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  room: {
    roomNo: string;
    type: string;
    status: string;
  };
}

export default function ViewAccessDevice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] =
    useState<AccessDevice | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (id) {
      fetchDevice();
    }
  }, [id]);

  const fetchDevice = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/admin/access-devices/${id}`
      );

      setDevice(response.data.accessDevice);
    } catch (error) {
      console.error(error);
      alert("Failed to load access device.");
      navigate("/admin/access-devices");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!device) return;

    try {
      if (device.isActive) {
        await api.patch(
          `/admin/access-devices/${device.id}/disable`
        );
      } else {
        await api.patch(
          `/admin/access-devices/${device.id}/enable`
        );
      }

      fetchDevice();
    } catch (error) {
      console.error(error);
      alert("Failed to update device.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-gray-500">
          Loading access device...
        </div>
      </AdminLayout>
    );
  }

  if (!device) {
    return (
      <AdminLayout>
        <div className="py-20 text-center">
          Device not found.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-slate-900">
            Access Device
          </h1>

          <p className="mt-2 text-gray-500">
            Device Details
          </p>

        </div>

        <Link
          to="/admin/access-devices"
          className="rounded-lg border px-5 py-2 hover:bg-gray-100"
        >
          ← Back
        </Link>

      </div>

      <div className="rounded-xl border bg-white p-8 shadow-sm">

  <div className="grid gap-6 md:grid-cols-2">

                  <div>
            <p className="text-sm font-medium text-gray-500">
              Device ID
            </p>

            <p className="mt-2 text-lg font-semibold">
              {device.deviceId}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Device Status
            </p>

            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                device.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {device.isActive ? "ACTIVE" : "DISABLED"}
            </span>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">
              API Key
            </p>

            <textarea
              readOnly
              value={device.apiKey}
              rows={3}
              className="mt-2 w-full rounded-lg border bg-gray-50 p-3 text-sm"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Room Number
            </p>

            <p className="mt-2 text-lg font-semibold">
              {device.room.roomNo}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Room Type
            </p>

            <p className="mt-2 text-lg font-semibold">
              {device.room.type}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Room Status
            </p>

            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                device.room.status === "AVAILABLE"
                  ? "bg-green-100 text-green-700"
                  : device.room.status === "OCCUPIED"
                  ? "bg-red-100 text-red-700"
                  : device.room.status === "RESERVED"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {device.room.status}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Registered On
            </p>

            <p className="mt-2">
              {new Date(
                device.createdAt
              ).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Last Updated
            </p>

            <p className="mt-2">
              {new Date(
                device.updatedAt
              ).toLocaleString()}
            </p>
          </div>

        </div>

        <div className="mt-10 flex justify-end gap-3">

          <button
            onClick={toggleStatus}
            className={`rounded-lg px-6 py-2 text-white ${
              device.isActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {device.isActive
              ? "Disable Device"
              : "Enable Device"}
          </button>

          <Link
            to="/admin/access-devices"
            className="rounded-lg border px-6 py-2 hover:bg-gray-100"
          >
            Back to Devices
          </Link>

        </div>

      </div>

    </AdminLayout>
  );
}