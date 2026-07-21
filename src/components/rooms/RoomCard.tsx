import { Link } from "react-router-dom";

type RoomCardProps = {
  id: number;
  name: string;
  type: string;
  price: string;
  image: string;
  guests: number;
  description: string;
  
  amenities: string[];
};

function RoomCard({
  id,
  name,
  type,
  price,
  image,
  guests,
  description,
  amenities,
}: RoomCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

      <img
        src={image}
        alt={name}
        className="h-60 w-full object-cover"
      />

      <div className="p-6">

        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
          {type}
        </span>

        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          {name}
        </h2>

        <p className="mt-2 text-slate-600">
          {description}
        </p>


        <p className="mt-2 text-slate-600">
          👥 Sleeps {guests}
        </p>

        
        <div className="mt-4 space-y-2">

          {amenities.map((amenity) => (
            <p key={amenity} className="text-slate-600">
              ✓ {amenity}
            </p>
          ))}

        </div>

        <p className="mt-6 text-2xl font-bold text-yellow-600">
          {price}
          <span className="text-base font-normal text-slate-500">
            {" "}
            / Night
          </span>
        </p>

        <div className="mt-8">

          <Link
            to={`/rooms/${id}`}
            className="block w-full rounded-xl bg-blue-700 px-4 py-4 text-center font-semibold text-white transition hover:bg-blue-800"
          >
            View Details
          </Link>

        </div>

      </div>

    </div>
  );
}

export default RoomCard;