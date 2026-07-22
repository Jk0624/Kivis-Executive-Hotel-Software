import { Link } from "react-router-dom";
import type { GuestRoom } from "../../services/guestRoomService";

type RoomCardProps = {
  room: GuestRoom;
};

function RoomCard({ room }: RoomCardProps) {
  const getStatus = () => {
    switch (room.status.toUpperCase()) {
      case "AVAILABLE":
        return {
          label: "Available",
          badge:
            "bg-emerald-50/90 text-emerald-700 border border-emerald-200",
          dot: "bg-emerald-500",
        };

      case "RESERVED":
        return {
          label: "Reserved",
          badge: "bg-blue-50/90 text-blue-700 border border-blue-200",
          dot: "bg-blue-500",
        };

      case "BOOKED":
        return {
          label: "Booked",
          badge: "bg-red-50/90 text-red-700 border border-red-200",
          dot: "bg-red-500",
        };

      case "OCCUPIED":
        return {
          label: "Occupied",
          badge: "bg-red-50/90 text-red-700 border border-red-200",
          dot: "bg-red-500",
        };

      case "MAINTENANCE":
        return {
          label: "Maintenance",
          badge:
            "bg-orange-50/90 text-orange-700 border border-orange-200",
          dot: "bg-orange-500",
        };

      default:
        return {
          label: room.status,
          badge: "bg-slate-100 text-slate-700 border border-slate-200",
          dot: "bg-slate-500",
        };
    }
  };

  const status = getStatus();

  const visibleAmenities = room.amenities.slice(0, 4);
  const remainingAmenities = room.amenities.length - visibleAmenities.length;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-blue-100 hover:shadow-2xl">

      {/* IMAGE */}

      <div className="relative overflow-hidden">

        <img
          src={
            room.photo ||
            "https://placehold.co/900x600?text=Room+Image"
          }
          alt={`${room.type} Room`}
          className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Availability */}

        <div className="absolute right-5 top-5">

          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-md transition-all duration-500 group-hover:scale-105 ${status.badge}`}
          >

            <span
              className={`h-3 w-3 rounded-full ${status.dot} animate-pulse`}
            />

            {status.label}

          </div>

        </div>

        {/* Room Number */}

        <div className="absolute bottom-6 left-6">

          <p className="text-xs uppercase tracking-[0.35em] text-white/70">
            Room
          </p>

          <h2 className="mt-1 text-4xl font-bold text-white drop-shadow-lg">
            {room.roomNo}
          </h2>

        </div>

      </div>

      {/* CONTENT */}

      <div className="flex flex-1 flex-col p-7">

        {/* Title */}

        <div>

          <h3 className="text-2xl font-bold text-slate-900">
            {room.type} Room
          </h3>

          <div className="mt-2 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-yellow-500" />

            <p className="text-sm font-medium text-slate-500">
              Premium Accommodation
            </p>

          </div>

        </div>

        {/* Description */}

        <p className="mt-5 min-h-[72px] leading-7 text-slate-600">
          {room.description ||
            "Experience comfort, elegance and modern convenience in a thoughtfully designed room, perfect for business and leisure stays."}
        </p>

        {/* Amenities */}

        <div className="mt-6">

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Amenities
          </p>

          <div className="flex flex-wrap gap-2">

            {visibleAmenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition-all duration-300 group-hover:border-blue-100 group-hover:bg-blue-50"
              >
                {amenity}
              </span>
            ))}

            {remainingAmenities > 0 && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                +{remainingAmenities} more
              </span>
            )}

          </div>

        </div>

        {/* Divider */}

        <div className="my-7 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Bottom */}

        <div className="mt-auto flex items-end justify-between">

          <div>

            <p className="text-5x1 text-amber-600 font-bold">
              GHS {room.price}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              per night
            </p>

          </div>

          <Link
            to={`/rooms/${room.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-700/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-800 hover:shadow-xl"
          >
            View Details

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>

          </Link>

        </div>

      </div>

    </article>
  );
}

export default RoomCard;