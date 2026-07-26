import type { GuestRoom } from "../../services/guestRoomService";

interface BookingSummaryProps {
  room: GuestRoom;
  checkInDate: string;
  checkOutDate: string;
}

function BookingSummary({
  room,
  checkInDate,
  checkOutDate,
}: BookingSummaryProps) {
  const nightlyRate = room.price;

  const nights =
    checkInDate && checkOutDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(checkOutDate).getTime() -
              new Date(checkInDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const total = nightlyRate * nights;

  const roomImage =
    room.photos && room.photos.length > 0
      ? room.photos[0]
      : room.photo;

  return (
    <div className="sticky top-28 rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-slate-900">
        Booking Summary
      </h2>

      <div className="mt-8 overflow-hidden rounded-2xl">
        <img
          src={
            roomImage ||
            "https://placehold.co/800x500?text=Room+Image"
          }
          alt={`Room ${room.roomNo}`}
          className="h-56 w-full object-cover"
        />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold text-slate-900">
          Room {room.roomNo}
        </h3>

        <p className="mt-1 text-yellow-600">
          {room.type} Room
        </p>
      </div>

      <div className="mt-8 rounded-2xl bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-500">
          Check-In
        </p>

        <p className="mt-1 font-medium text-slate-900">
          {checkInDate || "--"}
        </p>

        <p className="mt-5 text-sm font-semibold text-slate-500">
          Check-Out
        </p>

        <p className="mt-1 font-medium text-slate-900">
          {checkOutDate || "--"}
        </p>
      </div>

      <div className="mt-8 space-y-4 border-y border-slate-200 py-6">
        <div className="flex justify-between">
          <span className="text-slate-600">
            Price / Night
          </span>

          <span className="font-semibold">
            GHS {nightlyRate.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">
            Number of Nights
          </span>

          <span className="font-semibold">
            {nights}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-between text-xl font-bold">
        <span>Estimated Total</span>

        <span className="text-yellow-600">
          {nights > 0
            ? `GHS ${total.toLocaleString()}`
            : "--"}
        </span>
      </div>
    </div>
  );
}

export default BookingSummary;