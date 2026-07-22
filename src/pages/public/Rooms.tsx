import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import RoomCard from "../../components/rooms/RoomCard";

import { getGuestRooms } from "../../services/guestRoomService";
import type { GuestRoom } from "../../services/guestRoomService";

function Rooms() {
  const [rooms, setRooms] = useState<GuestRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
const [roomType, setRoomType] = useState("");
const [maxPrice, setMaxPrice] = useState("");

 useEffect(() => {
  const fetchRooms = async () => {
    try {
      setLoading(true);

      const data = await getGuestRooms({
        status: status || undefined,
        roomType: roomType || undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });

      setRooms(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchRooms();
}, [status, roomType, maxPrice]);
  return (
    <MainLayout>
      <section className="min-h-screen bg-slate-100 px-8 py-16">
        <div className="mx-auto max-w-7xl">

          <div className="text-center">

  <h1 className="text-4xl font-bold uppercase tracking-[0.2em] text-yellow-500">
    Our Rooms
  </h1>

  <p className="mt-4 text-slate-600">
    Discover comfort, luxury and secure smart room access at Kiviz Executive Lodge.
  </p>

</div>

<div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

  <div className="mb-8">

    <h2 className="text-2xl font-bold text-slate-900">
      Find Your Perfect Room
    </h2>
    {loading && (
  <div className="mt-4 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
    Updating rooms...
  </div>
)}

    <p className="mt-2 text-slate-600">
      Use the filters below to narrow your search by room type, availability or your preferred budget.
    </p>

  </div>

  <div className="mt-6 flex items-center justify-between">

  <p className="text-slate-600">
    Showing
    <span className="mx-1 font-bold text-blue-700">
      {rooms.length}
    </span>
    room{rooms.length !== 1 && "s"}
  </p>

</div>

  <div className="grid gap-5 md:grid-cols-3">

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Room Type
      </label>

      <select
  value={roomType}
  onChange={(e) => setRoomType(e.target.value)}
  className="w-full rounded-xl border border-slate-300 p-3 focus:border-blue-600 focus:outline-none"
>
  <option value="">All Types</option>
  <option value="STANDARD">Standard</option>
  <option value="EXECUTIVE">Executive</option>
  <option value="DELUXE">Deluxe</option>
  <option value="SUITE">Suite</option>
</select>
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Availability
      </label>

      <select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  className="w-full rounded-xl border border-slate-300 p-3 focus:border-blue-600 focus:outline-none"
>
  <option value="">All Status</option>
  <option value="AVAILABLE">Available</option>
  <option value="RESERVED">Reserved</option>
  <option value="OCCUPIED">Occupied</option>
  <option value="MAINTENANCE">Maintenance</option>
</select>
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Maximum Price (GHS)
      </label>

      <input
        type="number"
        min="0"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        placeholder="e.g. 500"
        className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-600 focus:outline-none"
      />
    </div>
    <div className="mt-8 flex justify-end">

  <button
    onClick={() => {
      setRoomType("");
      setStatus("");
      setMaxPrice("");
    }}
    className="rounded-xl border border-slate-300 px-5 py-2 font-semibold text-slate-700 transition hover:border-blue-600 hover:text-blue-700"
  >
    Reset Filters
  </button>

</div>

  </div>

</div>

          {loading && (
            <div className="py-20 text-center text-lg text-slate-600">
              Loading available rooms...
            </div>
          )}

          {error && (
            <div className="py-20 text-center text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && rooms.length === 0 && (
            <div className="py-20 text-center text-slate-600">
              No rooms are currently available.
            </div>
          )}

          {!loading && !error && rooms.length > 0 && (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                />
              ))}
            </div>
          )}

        </div>
      </section>
    </MainLayout>
  );
}

export default Rooms;