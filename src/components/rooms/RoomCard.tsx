type RoomCardProps = {
  name: string;
  price: string;
};

function RoomCard({ name, price }: RoomCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-4 flex h-52 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900">
    <span className="text-lg font-semibold text-white">
        Room Image
    </span>
    </div>

      <h2 className="text-2xl font-bold">{name}</h2>

      <div className="mt-4 space-y-2 text-gray-600">
        <p>✓ Queen Size Bed</p>
        <p>✓ Smart Door Access</p>
        <p>✓ Free Wi-Fi</p>
        <p>✓ Air Conditioning</p>
      </div>

      <p className="mt-4 text-xl font-semibold text-yellow-600">
        {price} / Night
      </p>

      <button className="mt-6 w-full rounded-xl bg-yellow-500 py-3 font-semibold text-white transition-all duration-300 hover:bg-yellow-400">
        Book Now
      </button>
    </div>
  );
}

export default RoomCard;