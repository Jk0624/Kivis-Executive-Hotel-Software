interface BookingSummaryProps {
  room: {
    id: number;
    name: string;
    type: string;
    price: string;
    images: string[];
  };
}

function BookingSummary({ room }: BookingSummaryProps) {
  return (
    <div className="sticky top-28 rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-slate-900">
        Booking Summary
      </h2>

      <div className="mt-8 overflow-hidden rounded-2xl">
        <img
        src={room.images[0]}
        alt={room.name}
        className="h-56 w-full object-cover"
        />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold text-slate-900">
            {room.name}
        </h3>

        <p className="mt-1 text-yellow-600">
          {room.type}
        </p>
      </div>

      <div className="mt-8 space-y-4 border-t border-b border-slate-200 py-6">

        <div className="flex justify-between">
          <span className="text-slate-600">
            Price / Night
          </span>

          <span className="font-semibold">
            {room.price}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">
            Nights
          </span>

          <span className="font-semibold">
            1
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">
            Service Charge
          </span>

          <span className="font-semibold">
            GHS 50
          </span>
        </div>

      </div>

      <div className="mt-6 flex justify-between text-xl font-bold">
        <span>Total</span>

        <span className="text-blue-700">
          GHS 500
        </span>
      </div>
    </div>
  );
}

export default BookingSummary;