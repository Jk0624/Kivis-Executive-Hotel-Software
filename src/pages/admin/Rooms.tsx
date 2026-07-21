import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import CreateRoomDrawer from "../../components/admin/CreateRoomDrawer";
import EditRoomDrawer from "../../components/admin/EditRoomDrawer";

function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const navigate = useNavigate();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const fetchRooms = async () => {
  const response = await api.get("/admin/rooms");
  setRooms(response.data.rooms);
};

useEffect(() => {
  fetchRooms();
}, []);


  return (
    <AdminLayout>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Rooms
            </h1>

            <p className="mt-3 text-gray-600">
              Manage all hotel rooms.
            </p>
          </div>

          <button
            onClick={() => setIsCreateDrawerOpen(true)}
            className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            + Create Room
          </button>
        </div>
      <div className="mt-8 rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-2xl font-semibold">
          Rooms
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">Room</th>

                <th className="p-3 text-left">Type</th>

                <th className="p-3 text-left">Price</th>

                <th className="p-3 text-left">Status</th>

                <th className="p-3 text-left">Actions</th>

              </tr>

            </thead>

            <tbody>
  {rooms.map((room) => (
    <tr key={room.id} className="border-b">
      <td className="p-3">{room.roomNo}</td>

      <td className="p-3">{room.type}</td>

      <td className="p-3">GHS {room.price}</td>

      <td className="p-3">
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
          {room.status}
        </span>
      </td>

      <td className="p-3">
  <div className="flex gap-2">
    <button
      onClick={() => navigate(`/admin/rooms/${room.id}`)}
      className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
    >
      View
    </button>

    <button
      onClick={() => {
        setSelectedRoomId(room.id);
        setIsEditDrawerOpen(true);
      }}
      className="rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
    >
      Edit
    </button>
  </div>
</td>
    </tr>
  ))}
</tbody>

          </table>

        </div>

      </div>
      <CreateRoomDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCreated={fetchRooms}
      />
      
      <EditRoomDrawer
  isOpen={isEditDrawerOpen}
  roomId={selectedRoomId}
  onClose={() => {
    setIsEditDrawerOpen(false);
    setSelectedRoomId(null);
  }}
  onUpdated={fetchRooms}
/>

    </AdminLayout>
  );
}

export default Rooms;