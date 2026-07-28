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

      console.log(response.data.rooms);

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

  const availableRooms = rooms.filter(
  (room) => room.status === "AVAILABLE"
).length;

const occupiedRooms = rooms.filter(
  (room) => room.status === "OCCUPIED"
).length;

const reservedRooms = rooms.filter(
  (room) => room.status === "RESERVED"
).length;

  return (
    <ReceptionistLayout>

      {/* Page Header */}

<section className="sticky top-20 z-20 -mx-2 mb-8 rounded-2xl border border-slate-200 bg-white/95 px-4 py-5 backdrop-blur-md sm:px-6">

  <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
    Room Management
  </h1>

  <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
    View hotel rooms, monitor availability, and access detailed room information.
  </p>

</section>

<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

  <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

    <div>

      <h2 className="text-xl font-semibold text-slate-900">
        Rooms
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Current room inventory and occupancy status.
      </p>

    </div>

    <div className="flex flex-wrap gap-3">

  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
    {rooms.length} Rooms
  </div>

  <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
    {availableRooms} Available
  </div>

  <div className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
    {occupiedRooms} Occupied
  </div>

  <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
    {reservedRooms} Reserved
  </div>

</div>

  </div>

  <div className="p-5 sm:p-8">
        {loadingRooms ? (
          <div className="flex items-center justify-center py-24">

  <div className="text-center">

    <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

    <h3 className="text-lg font-semibold text-slate-800">
      Loading Rooms
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      Retrieving room availability and pricing...
    </p>

  </div>

</div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-24 text-center">

  <div className="mb-5 rounded-full bg-slate-100 p-5">

    <svg
      className="h-8 w-8 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h18M5 10V7a2 2 0 012-2h10a2 2 0 012 2v3M6 21v-6m12 6v-6M4 21h16"
      />
    </svg>

  </div>

  <h3 className="text-xl font-semibold text-slate-800">
    No Rooms Available
  </h3>

  <p className="mt-3 max-w-md text-sm text-slate-500">
    Room inventory will appear here once rooms have been added to the hotel system.
  </p>

</div>
        ) : (
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">

  {rooms.map((room) => (

    <article
  key={room.roomNo}
  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl"
>
  {/* Status Accent */}
  <div
    className={`h-1.5 w-full ${
      room.status === "AVAILABLE"
        ? "bg-green-500"
        : room.status === "OCCUPIED"
        ? "bg-red-500"
        : room.status === "RESERVED"
        ? "bg-amber-500"
        : "bg-slate-400"
    }`}
  />

  <div className="p-7">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-blue-50 group-hover:text-blue-700">
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 10h18M5 10V7a2 2 0 012-2h10a2 2 0 012 2v3M6 21v-6m12 6v-6M4 21h16"
            />
          </svg>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Room
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            {room.roomNo}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {room.type}
          </p>
        </div>
      </div>

      <span
  className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
    room.status === "AVAILABLE"
      ? "bg-green-100 text-green-700"
      : room.status === "OCCUPIED"
      ? "bg-red-100 text-red-700"
      : room.status === "RESERVED"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-700"
  }`}
>
  {room.status === "AVAILABLE"
    ? "Available"
    : room.status === "OCCUPIED"
    ? "Occupied"
    : room.status === "RESERVED"
    ? "Reserved"
    : room.status}
</span>
    </div>

    {/* Divider */}
    <div className="my-7 border-t border-slate-100" />

    {/* Price */}
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
        Starting From
      </p>

      <div className="mt-2 flex items-end gap-2">
        <span className="text-4xl font-bold text-slate-900">
          GHS {Number(room.price).toFixed(2)}
        </span>

        <span className="mb-1 text-sm text-slate-500">
          / night
        </span>
      </div>
    </div>

    {/* CTA */}
    <button
      type="button"
      onClick={() =>
        navigate(`/receptionist/rooms/${room.id}`)
      }
      className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-blue-700"
    >
      Manage Room

      <svg
        className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  </div>
</article>

  ))}

</div>
        )}
      </div>
      </section>
    </ReceptionistLayout>
  );
}

export default Rooms;