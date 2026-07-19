import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Rooms() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<any[]>([]);
    useEffect(() => {
      const fetchRooms = async () => {
        try {
          const response = await api.get("/reception/rooms");
          setRooms(response.data.rooms);
        } catch (error) {
          console.error("Failed to load rooms:", error);
        }
      };

      fetchRooms();
    }, []);
  return (
    <ReceptionistLayout>
      <h1 className="text-4xl font-bold text-slate-900">
        Rooms
      </h1>

      <p className="mt-3 text-gray-600">
        View all hotel rooms,their prices and current status.
      </p>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {rooms.map((room) => (
              <div
                key={room.roomNo}
                className="rounded-xl bg-white p-5 shadow-md"
              >
                <h2 className="text-xl font-bold text-slate-900">
                  Room {room.roomNo}
                </h2>

                <p className="mt-1 text-gray-600">
                  {room.type}
                </p>

                <p className="mt-2 text-lg font-semibold">
                  GHS {room.price} / Night
                </p>

                <div className="mt-3 flex justify-center">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      room.status === "AVAILABLE"
                        ? "bg-green-100 text-green-700"
                        : room.status === "OCCUPIED"
                        ? "bg-red-100 text-red-700"
                        : room.status === "RESERVED"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="mt-5 flex justify-center">
                  <button
                    onClick={() =>
                      navigate(`/receptionist/rooms/${room.id}`)
                    }
                    className="rounded-lg bg-blue-700 px-8 py-2 font-semibold text-white hover:bg-blue-800"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

      </div>

    </ReceptionistLayout>
  );
}

export default Rooms;