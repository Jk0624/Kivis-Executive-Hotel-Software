import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import api from "../../services/api";
import { notify } from "../../utils/notify";

function Rooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] =
    useState(true);

  const loadRooms = async () => {
    try {
      setLoadingRooms(true);

      const response = await api.get(
        "/reception/rooms"
      );

      setRooms(response.data.rooms);
    } catch (error) {
      console.error(error);

      notify.error(
        "Failed to load available rooms."
      );
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <ReceptionistLayout>
      <h1 className="text-4xl font-bold text-slate-900">
        Rooms
      </h1>

      <p className="mt-3 text-gray-600">
        View all hotel rooms, their nightly
        rates and current availability.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {loadingRooms ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

              <p className="text-sm text-slate-500">
                Loading rooms...
              </p>
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="text-xl font-semibold text-slate-700">
              No Rooms Found
            </h3>

            <p className="mt-2 text-slate-500">
              There are currently no rooms
              available to display.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.roomNo}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Room {room.roomNo}
                    </h2>

                    <p className="mt-1 text-slate-500">
                      {room.type}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide ${
                      room.status ===
                      "AVAILABLE"
                        ? "bg-green-100 text-green-700"
                        : room.status ===
                          "OCCUPIED"
                        ? "bg-red-100 text-red-700"
                        : room.status ===
                          "RESERVED"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">
                    Nightly Rate
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    GHS{" "}
                    {Number(
                      room.price
                    ).toFixed(2)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/receptionist/rooms/${room.id}`
                    )
                  }
                  className="mt-6 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
                >
                  View Room Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ReceptionistLayout>
  );
}

export default Rooms;