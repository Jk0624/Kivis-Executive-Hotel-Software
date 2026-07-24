import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import CreateRoomDrawer from "../../components/admin/CreateRoomDrawer";
import EditRoomDrawer from "../../components/admin/EditRoomDrawer";
import api from "../../services/api";
import { notify } from "../../utils/notify";

function Rooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] =
    useState(true);

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] =
    useState(false);

  const [isEditDrawerOpen, setIsEditDrawerOpen] =
    useState(false);

  const [selectedRoomId, setSelectedRoomId] =
    useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);

      const response = await api.get(
        "/admin/rooms"
      );

      setRooms(response.data.rooms);
    } catch (error) {
      console.error(error);

      notify.error(
        "Failed to load hotel rooms."
      );
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700";

      case "OCCUPIED":
        return "bg-red-100 text-red-700";

      case "RESERVED":
        return "bg-amber-100 text-amber-700";

      case "MAINTENANCE":
        return "bg-slate-200 text-slate-700";

      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Rooms
          </h1>

          <p className="mt-3 text-slate-600">
            Manage hotel rooms, pricing and
            availability.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setIsCreateDrawerOpen(true)
          }
          className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
        >
          + Add a Room
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-8 py-6">
          <h2 className="text-2xl font-semibold">
            Hotel Rooms
          </h2>
        </div>

        {loadingRooms ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

              <p className="text-slate-500">
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
              Create your first room to get
              started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Room
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Nightly Rate
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {rooms.map((room) => (
                  <tr
                    key={room.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5 font-semibold">
                      {room.roomNo}
                    </td>

                    <td className="px-6 py-5">
                      {room.type}
                    </td>

                    <td className="px-6 py-5 font-semibold">
                      GHS{" "}
                      {Number(room.price).toFixed(
                        2
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                          room.status
                        )}`}
                      >
                        {room.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/rooms/${room.id}`
                            )
                          }
                          className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRoomId(
                              room.id
                            );

                            setIsEditDrawerOpen(
                              true
                            );
                          }}
                          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
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
        )}
      </div>

      <CreateRoomDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() =>
          setIsCreateDrawerOpen(false)
        }
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