import RoomCard from "../../components/rooms/RoomCard";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getRoomById, getRooms } from "../../services/roomService";


function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const room = getRoomById(Number(id));
  const relatedRooms = getRooms().filter(
  (otherRoom) => otherRoom.id !== room?.id
);

  const [selectedImage, setSelectedImage] = useState(0);

  if (!room) {
    return (
      <MainLayout>
        <section className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">

            <h1 className="text-4xl font-bold text-slate-900">
              Room Not Found
            </h1>

            <p className="mt-4 text-slate-600">
              The room you're looking for doesn't exist.
            </p>

            <Link
              to="/rooms"
              className="mt-8 inline-block rounded-xl bg-blue-700 px-8 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Back to Rooms
            </Link>

          </div>
        </section>


        
      </MainLayout>
    );
  }

  return (
    <MainLayout>

      <section className="bg-slate-100 px-6 py-16">
        <div className="mx-auto mb-8 max-w-7xl">
  <Link
    to="/rooms"
    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:border-blue-700 hover:text-blue-700"
  >
    ← Back to Rooms
  </Link>
</div>

  <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-2">

    {/* Room Image */}

    <div>

  <img
    src={room.images[selectedImage]}
    alt={room.name}
    className="h-[550px] w-full rounded-3xl object-cover shadow-xl"
  />

  <div className="mt-6 grid grid-cols-4 gap-4">

    {room.images.map((image, index) => (

                    <img
                key={index}
                src={image}
                alt={`${room.name} ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                className={`h-28 w-full cursor-pointer rounded-xl object-cover transition hover:scale-105 ${
                    selectedImage === index
                    ? "ring-4 ring-yellow-500"
                    : ""
                }`}
                />

            ))}

        </div>

        </div>

    {/* Room Information */}

    <div>

      <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
        {room.type}
      </span>

      <h1 className="mt-6 text-5xl font-bold text-slate-900">
        {room.name}
      </h1>

      <p className="mt-4 text-4xl font-bold text-yellow-600">
        {room.price}
        <span className="text-lg font-normal text-slate-500">
          {" "}
          / Night
        </span>
      </p>

      <p className="mt-6 text-lg text-slate-700">
        👥 Sleeps {room.guests}
      </p>

      <p className="mt-6 text-lg leading-8 text-slate-600">
        {room.description}
      </p>

      <button
        onClick={() =>
          navigate(`/signin?redirect=/booking?roomId=${room.id}`)
        }
        className="mt-10 rounded-xl bg-blue-700 px-10 py-4 text-lg font-semibold text-white transition hover:bg-blue-800"
      >
        Book This Room
      </button>

    </div>

  </div>

</section>


{/* Amenities */}

<section className="bg-white px-6 py-20">

  <div className="mx-auto max-w-7xl">

    <div className="text-center">

      <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
        Room Amenities
      </p>

      <h2 className="mt-4 text-4xl font-bold text-slate-900">
        Everything You Need For A Comfortable Stay
      </h2>

    </div>

    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

      {room.amenities.map((amenity) => (

        <div
          key={amenity}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-lg font-medium text-slate-800">
            ✓ {amenity}
          </p>
        </div>

      ))}

    </div>

  </div>

</section>


{/* About This Room */}

<section className="bg-slate-50 px-6 py-20">

  <div className="mx-auto max-w-5xl">

    <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
      About This Room
    </p>

    <h2 className="mt-4 text-4xl font-bold text-slate-900">
      Designed For Comfort And Relaxation
    </h2>

    <p className="mt-8 text-lg leading-9 text-slate-600">
      {room.description}
    </p>

    <p className="mt-6 text-lg leading-9 text-slate-600">
      Every room at Kiviz Executive Hotel is thoughtfully designed to
      provide guests with comfort, convenience and security. From our
      smart room access system to premium furnishings and high-speed
      internet, every detail has been carefully selected to ensure an
      enjoyable stay whether you're travelling for business or leisure.
    </p>

  </div>

</section>


{/* You May Also Like */}

<section className="bg-slate-100 px-6 py-20">

  <div className="mx-auto max-w-7xl">

    <div className="text-center">

      <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
        You May Also Like
      </p>

      <h2 className="mt-4 text-4xl font-bold text-slate-900">
        Explore Our Other Rooms
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
        Discover more accommodation options designed to suit every type of traveller.
      </p>

    </div>

    <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

      {relatedRooms.map((otherRoom) => (

        <RoomCard
          key={otherRoom.id}
          id={otherRoom.id}
          name={otherRoom.name}
          type={otherRoom.type}
          price={otherRoom.price}
          image={otherRoom.images[0]}
          guests={otherRoom.guests}
          description={otherRoom.description}
          amenities={otherRoom.amenities}
        />

      ))}

    </div>

  </div>

</section>

    </MainLayout>
  );
}

export default RoomDetails;