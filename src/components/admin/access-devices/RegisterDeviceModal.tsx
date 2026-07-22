import { useEffect, useState } from "react";
import api from "../../../services/api";

interface RegisterDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Room {
  id: string;
  roomNo: string;
}

export default function RegisterDeviceModal({
  isOpen,
  onClose,
  onSuccess,
}: RegisterDeviceModalProps) {
  const [deviceId, setDeviceId] = useState("");
  const [roomNo, setRoomNo] = useState("");

  const [rooms, setRooms] = useState<Room[]>([]);

  const [loadingRooms, setLoadingRooms] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [generatedApiKey, setGeneratedApiKey] =
    useState("");

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  const loadRooms = async () => {
    try {
      setLoadingRooms(true);

      const response = await api.get("/admin/rooms");

      const roomList =
        response.data.rooms ||
        response.data.data ||
        [];

      setRooms(roomList);
    } catch (error) {
      console.error(error);
      alert("Failed to load rooms.");
    } finally {
      setLoadingRooms(false);
    }
  };

  const resetForm = () => {
    setDeviceId("");
    setRoomNo("");
    setGeneratedApiKey("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

      const response = await api.post(
        "/admin/access-devices",
        {
          deviceId,
          roomNo,
        }
      );

      setGeneratedApiKey(
        response.data.apiKey
      );

      alert(
        `Device registered successfully!\n\nAPI Key:\n${response.data.apiKey}`
      );

      onSuccess();

      resetForm();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to register device."
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
            Register Access Device
          </h2>

          <button
            onClick={handleClose}
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
              placeholder="ESP32 Device ID"
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

          {generatedApiKey && (
            <div className="rounded-lg bg-green-50 p-4">

              <p className="font-semibold text-green-700">
                Generated API Key
              </p>

              <textarea
                readOnly
                value={generatedApiKey}
                className="mt-2 w-full rounded border bg-white p-3 text-sm"
                rows={4}
              />

            </div>
          )}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={handleClose}
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
                ? "Registering..."
                : "Register Device"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}