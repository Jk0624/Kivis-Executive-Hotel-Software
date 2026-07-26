import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

function RoomDetails() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState<any>(null);

  const fetchRoom = async () => {
    const response = await api.get(`/admin/rooms/${roomId}`);
    setRoom(response.data.room);
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  return (
    <AdminLayout>
      {room && (
        <>
          <button
            onClick={() => navigate("/admin/rooms")}
            className="mb-6 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
          >
            ← Back to Rooms
          </button>

          <h1 className="text-4xl font-bold text-slate-900">
            Room {room.roomNo}
          </h1>

          <p className="mt-3 text-gray-600">
            View detailed information about this room.
          </p>

          <div className="mt-8 rounded-xl bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-semibold">
              Room Information
            </h2>

            <div className="space-y-3">
              <p>
                <strong>Room Number:</strong> {room.roomNo}
              </p>

              <p>
                <strong>Type:</strong> {room.type}
              </p>

              <p>
                <strong>Price:</strong> GHS {room.price}
              </p>

              <p>
                <strong>Status:</strong> {room.status}
              </p>

              <p>
                <strong>Description:</strong> {room.description}
              </p>

              <div>
                <strong>Amenities:</strong>

                <ul className="mt-2 list-disc pl-6">
                  {room.amenities.map((amenity: string) => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ul>
              </div>
            </div>

            {room.photos.length > 0 && (
  <div className="mt-8">
    <h3 className="mb-4 text-xl font-semibold">
      Room Photos
    </h3>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {room.photos.map((photo: string, index: number) => (
        <img
          key={index}
          src={photo}
          alt={`Room ${room.roomNo} ${index + 1}`}
          className="h-56 w-full rounded-lg object-cover shadow"
        />
      ))}
    </div>
  </div>
)}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default RoomDetails;