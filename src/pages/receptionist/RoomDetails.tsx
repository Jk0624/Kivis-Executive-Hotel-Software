import ReceptionistLayout from "../../layouts/ReceptionistLayout";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function RoomDetails() {
  const { roomNumber } = useParams();

  const navigate = useNavigate();

  const [room, setRoom] = useState<any | null>(null);

  useEffect(() => { 
    const fetchRoom = async () => {
      try {
        const response = await api.get(`/reception/rooms/${roomNumber}`);
        setRoom(response.data.room);
      } catch (error) {
        console.error("Failed to load room:", error);
      }
    };

    if (roomNumber) {
      fetchRoom();
    }
  }, [roomNumber]);
  return (
    <ReceptionistLayout>

      <button
        onClick={() => navigate("/receptionist/rooms")}
        className="mb-4 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
      >
        ← Back to Rooms
      </button>

      <h1 className="text-4xl font-bold text-slate-900">
        Room Details
      </h1>

      <p className="mt-3 text-gray-600">
        View detailed information about the selected room.
      </p>

      {/* Room Information */}

<div className="mt-8 rounded-xl bg-white p-8 shadow-md">

  <h2 className="mb-6 text-2xl font-semibold">
    Room Information
  </h2>

  <div className="grid gap-6 md:grid-cols-2">

    <p><strong>Room Number:</strong> {room?.roomNo}</p>

    <p><strong>Room Type:</strong> {room?.type}</p>

    <p><strong>Price:</strong> GHS {room?.price} / Night</p>

    <p>
      <strong>Status:</strong>{" "}
      <span className="font-semibold text-green-600">
        {room?.status}
      </span>
    </p>

  </div>

</div>


    </ReceptionistLayout>
  );
}

export default RoomDetails;