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
            (room) =>
              room.status.toUpperCase() ===
              "AVAILABLE"
          )
          .slice(0, 4);

        setRooms(featuredRooms);
      } catch (error) {
        console.error(
          "Failed to fetch featured rooms:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  return (
    <section className="bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500 sm:text-sm">
              Featured Rooms
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Discover Your Perfect Stay
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Explore our handpicked selection of
              premium rooms, combining comfort,
              elegance and smart hospitality.
            </p>
          </div>

          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 self-start font-semibold text-blue-700 transition hover:text-blue-900 md:self-auto"
          >
            View All Rooms

            <span className="transition-transform duration-300 hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white"
              >
                <div className="h-64 bg-slate-200 sm:h-72" />

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
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm sm:p-12">
            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
              No Featured Rooms Available
            </h3>

            <p className="mt-4 text-sm text-slate-600 sm:text-base">
              Please check back later to
              explore our available
              accommodation.
            </p>

            <Link
              to="/rooms"
              className="mt-8 inline-flex w-full justify-center rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 sm:w-auto"
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