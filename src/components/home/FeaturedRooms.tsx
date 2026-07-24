import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RoomCard from "../rooms/RoomCard";
import {
  getGuestRooms,
  type GuestRoom,
} from "../../services/guestRoomService";

function FeaturedRooms() {
  const [rooms, setRooms] = useState<GuestRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const data = await getGuestRooms();

        // Show only the first four available rooms
        const featuredRooms = data
          .filter(
            (room) => room.status.toUpperCase() === "AVAILABLE"
          )
          .slice(0, 4);

        setRooms(featuredRooms);
      } catch (error) {
        console.error("Failed to fetch featured rooms:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  return (
    <section className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
              Featured Rooms
            </p>

            <h2 className="mt-4 text-4xl font-bold text-slate-900">
              Discover Your Perfect Stay
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Explore our handpicked selection of premium rooms,
              combining comfort, elegance and smart hospitality.
            </p>

          </div>

          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 font-semibold text-blue-700 transition hover:text-blue-900"
          >
            View All Rooms

            <span className="transition-transform duration-300 hover:translate-x-1">
              →
            </span>

          </Link>

        </div>

        {/* Loading */}

        {loading ? (

          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

            {[...Array(4)].map((_, index) => (

              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white"
              >

                <div className="h-72 bg-slate-200" />

                <div className="space-y-4 p-6">

                  <div className="h-6 w-2/3 rounded bg-slate-200" />

                  <div className="h-4 rounded bg-slate-200" />

                  <div className="h-4 w-5/6 rounded bg-slate-200" />

                  <div className="h-10 rounded bg-slate-200" />

                </div>

              </div>

            ))}

          </div>

        ) : rooms.length > 0 ? (

          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
              />
            ))}

          </div>

        ) : (

          <div className="mt-20 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <h3 className="text-2xl font-bold text-slate-900">
              No Featured Rooms Available
            </h3>

            <p className="mt-4 text-slate-600">
              Please check back later to explore our available accommodation.
            </p>

            <Link
              to="/rooms"
              className="mt-8 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Browse All Rooms
            </Link>

          </div>

        )}

      </div>
    </section>
  );
}

export default FeaturedRooms;