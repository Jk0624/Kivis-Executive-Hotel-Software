import { useEffect, useState } from "react";
import api from "../../../services/api";

interface Room {
  id: string;
  roomNo: string;
}

interface AccessDevice {
  id: string;
  deviceId: string;
  isActive: boolean;
  room: {
    roomNo: string;
  };
}

interface EditDeviceModalProps {
  isOpen: boolean;
  device: AccessDevice;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDeviceModal({
  isOpen,
  device,
  onClose,
  onSuccess,
}: EditDeviceModalProps) {
  const [deviceId, setDeviceId] = useState("");
  const [roomNo, setRoomNo] = useState("");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDeviceId(device.deviceId);
      setRoomNo(device.room.roomNo);
      loadRooms();
    }
  }, [isOpen, device]);

  const loadRooms = async () => {
    try {
      setLoadingRooms(true);

      const response = await api.get("/admin/rooms");

      setRooms(
        response.data.rooms ||
          response.data.data ||
          []
      );
    } catch (error) {
      console.error(error);
      alert("Failed to load rooms.");
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!deviceId.trim()) {
      alert("Device ID is required.");
      return;
    }

    if (!roomNo) {
      alert("Please select a room.");
      return;
    }

    try {
      setSaving(true);

      await api.patch(
        `/admin/access-devices/${device.id}`,
        {
          deviceId,
          roomNo,
        }
      );

      alert("Device updated successfully.");

      onSuccess();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to update device."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Edit Access Device
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-black"
          >
            ×
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label className="mb-2 block font-medium">
              Device ID
            </label>

            <input
              type="text"
              value={deviceId}
              onChange={(e) =>
                setDeviceId(e.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>

            <label className="mb-2 block font-medium">
              Room
            </label>

            <select
              value={roomNo}
              onChange={(e) =>
                setRoomNo(e.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
            >
              <option value="">
                Select Room
              </option>

              {!loadingRooms &&
                rooms.map((room) => (
                  <option
                    key={room.id}
                    value={room.roomNo}
                  >
                    {room.roomNo}
                  </option>
                ))}

            </select>

          </div>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}