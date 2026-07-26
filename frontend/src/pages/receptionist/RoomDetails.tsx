import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import api from "../../services/api";
import { notify } from "../../utils/notify";

function RoomDetails() {
  const { roomNumber } = useParams();

  const navigate = useNavigate();

  const [room, setRoom] = useState<any | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  const loadRoom = async () => {
    if (!roomNumber) return;

    try {
      setLoadingRoom(true);

      const response = await api.get(
        `/reception/rooms/${roomNumber}`
      );

      setRoom(response.data.room);
    } catch (error) {
      console.error(error);

      notify.error("Failed to load room details.");

      setRoom(null);
    } finally {
      setLoadingRoom(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [roomNumber]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700";

      case "OCCUPIED":
        return "bg-red-100 text-red-700";

      case "RESERVED":
        return "bg-amber-100 text-amber-700";

      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  return (
    <ReceptionistLayout>
      <button
        type="button"
        onClick={() =>
          navigate("/receptionist/rooms")
        }
        className="mb-6 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
      >
        ← Back to Rooms
      </button>

      <h1 className="text-4xl font-bold text-slate-900">
        Room Details
      </h1>

      <p className="mt-3 text-slate-600">
        View complete information about the
        selected room.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {loadingRoom ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

              <p className="text-sm text-slate-500">
                Loading room details...
              </p>
            </div>
          </div>
        ) : !room ? (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-semibold text-slate-700">
              Room Not Found
            </h2>

            <p className="mt-2 text-slate-500">
              The requested room could not be
              found.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Room {room.roomNo}
                </h2>

                <p className="mt-2 text-slate-500">
                  {room.type}
                </p>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadge(
                  room.status
                )}`}
              >
                {room.status}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-500">
                  Room Number
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {room.roomNo}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-500">
                  Room Type
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {room.type}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-500">
                  Nightly Rate
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  GHS{" "}
                  {Number(room.price).toFixed(2)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-500">
                  Current Status
                </p>

                <span
                  className={`mt-3 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadge(
                    room.status
                  )}`}
                >
                  {room.status}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </ReceptionistLayout>
  );
}

export default RoomDetails;