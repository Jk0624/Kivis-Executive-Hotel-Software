import { Link, useNavigate } from "react-router-dom";
import type { GuestRoom } from "../../services/guestRoomService";

type RoomCardProps = {
  room: GuestRoom;
};

function RoomCard({ room }: RoomCardProps) {
    const navigate = useNavigate();

  const handleBookNow = () => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate(`/booking?roomId=${room.id}`);
    } else {
      navigate(
        `/signin?redirect=${encodeURIComponent(
          `/booking?roomId=${room.id}`
        )}`
      );
    }
  };
  

  const amenities = room.amenities ?? [];

const visibleAmenities = amenities.slice(0, 4);

const remainingAmenities =
  amenities.length - visibleAmenities.length;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-blue-100 hover:shadow-2xl">
      {/* Image */}

      <div className="relative overflow-hidden">
        <img
          src={
            room.photo ||
            "https://placehold.co/900x600?text=Room+Image"
          }
          alt={`${room.type} Room`}
          className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110 sm:h-64 lg:h-72"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        
        <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/70 sm:text-xs sm:tracking-[0.35em]">
            Room
          </p>

          <h2 className="mt-1 text-3xl font-bold text-white drop-shadow-lg sm:text-4xl">
            {room.roomNo}
          </h2>
        </div>
      </div>

      {/* Content */}

      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <div>
          <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {room.type} Room
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />

            <p className="text-sm font-medium text-slate-500">
              Premium Accommodation
            </p>
          </div>
        </div>

        <p className="mt-5 min-h-[72px] text-sm leading-7 text-slate-600 sm:text-base">
          {room.description ||
            "Experience comfort, elegance and modern convenience in a thoughtfully designed room, perfect for business and leisure stays."}
        </p>

        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500 sm:text-sm">
            Amenities
          </p>

          <div className="flex flex-wrap gap-2">
            {visibleAmenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-300 group-hover:border-blue-100 group-hover:bg-blue-50 sm:text-sm"
              >
                {amenity}
              </span>
            ))}

            {remainingAmenities > 0 && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
                +{remainingAmenities} more
              </span>
            )}
          </div>
        </div>

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:my-7" />

        {/* Footer */}

        <div className="mt-auto">
          <div className="mb-6">
            <p className="text-2xl font-bold text-amber-600 sm:text-3xl">
              GHS {room.price}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              per night
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to={`/rooms/${room.id}`}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition-all duration-300 hover:border-blue-700 hover:bg-blue-50 hover:text-blue-700"
            >
              View Details
            </Link>

            <button
              type="button"
              onClick={handleBookNow}
              className="rounded-xl bg-yellow-500 px-5 py-3 text-center font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-400"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </article> 
  );
}

export default RoomCard;