import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const rooms = [
  {
    name: "Executive Room",
    price: "GH₵450 / Night",
    description:
      "Perfect for business travellers and couples seeking comfort.",
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
  },
  {
    name: "Deluxe Room",
    price: "GH₵380 / Night",
    description:
      "A spacious room with modern amenities for a relaxing stay.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
  },
  {
    name: "Standard Room",
    price: "GH₵280 / Night",
    description:
      "Affordable comfort with everything you need for your visit.",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  },
  {
    name: "Suite",
    price: "GH₵650 / Night",
    description:
      "Luxury accommodation offering premium comfort and elegance.",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
  },
];

function FeaturedRooms() {
  return (
    <section
      className="bg-slate-50 px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">

        <div className="text-center">

          <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
            Featured Rooms
          </p>

          <h2 className="mt-4 text-4xl font-bold text-slate-900">
            Discover Your Perfect Stay
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-600">
            Choose from our carefully designed rooms offering luxury,
            comfort and smart access technology.
          </p>

        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {rooms.map((room) => (

            <div
              key={room.name}
              className="overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              <img
                src={room.image}
                alt={room.name}
                className="h-56 w-full object-cover"
              />

              <div className="p-6">

                <h3 className="text-2xl font-bold text-slate-900">
                  {room.name}
                </h3>

                <div className="mt-3 flex gap-1">

                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}

                </div>

                <p className="mt-4 text-slate-600">
                  {room.description}
                </p>

                <p className="mt-6 text-xl font-bold text-blue-700">
                  {room.price}
                </p>

                <div className="mt-8 flex gap-3">

                  <Link
                    to="/rooms"
                    className="flex-1 rounded-lg border border-blue-700 px-4 py-2 text-center font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    View Details
                  </Link>

                  <Link
                    to="/rooms"
                    className="flex-1 rounded-lg bg-blue-700 px-4 py-2 text-center font-semibold text-white transition hover:bg-blue-800"
                  >
                    Book Now
                  </Link>

                </div>

              </div>

            </div>

          ))}

        </div>

        <div className="mt-16 text-center">

          <Link
            to="/rooms"
            className="rounded-xl bg-yellow-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-yellow-400"
          >
            View All Rooms
          </Link>

        </div>

      </div>
    </section>
  );
}

export default FeaturedRooms;