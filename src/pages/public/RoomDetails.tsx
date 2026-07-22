import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../layouts/MainLayout";
import RoomCard from "../../components/rooms/RoomCard";

import {
  getGuestRoom,
  getGuestRooms,
} from "../../services/guestRoomService";

import type { GuestRoom } from "../../services/guestRoomService";

import { getRoomStatus } from "../../utils/roomStatus";



function RoomDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<GuestRoom | null>(null);
  const [relatedRooms, setRelatedRooms] = useState<GuestRoom[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchRoom = async () => {
      try {
        setLoading(true);

        const roomData = await getGuestRoom(id);

        setRoom(roomData);

        const rooms = await getGuestRooms();

        setRelatedRooms(
          rooms.filter((item) => item.id !== roomData.id).slice(0, 3)
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load room details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <section className="flex min-h-[80vh] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />

            <h2 className="mt-8 text-3xl font-bold text-slate-900">
              Loading Room...
            </h2>

            <p className="mt-4 text-slate-600">
              Please wait while we prepare your experience.
            </p>

          </div>
        </section>
      </MainLayout>
    );
  }

  if (error || !room) {
    return (
      <MainLayout>
        <section className="flex min-h-[80vh] items-center justify-center">
          <div className="text-center">

            <h2 className="text-4xl font-bold text-slate-900">
              Room Not Found
            </h2>

            <p className="mt-5 text-slate-600">
              {error || "The requested room could not be found."}
            </p>

            <Link
              to="/rooms"
              className="mt-10 inline-flex rounded-xl bg-blue-700 px-8 py-4 font-semibold text-white transition hover:bg-blue-800"
            >
              Back to Rooms
            </Link>

          </div>
        </section>
      </MainLayout>
    );
  }

  const images =
    room.photos && room.photos.length > 0
      ? room.photos
      : room.photo
      ? [room.photo]
      : [];

  const status = getRoomStatus(room.status);

  return (
  <MainLayout>

    <section className="bg-gradient-to-b from-slate-50 to-white px-6 py-14">

      <div className="mx-auto max-w-7xl">

        <Link
          to="/rooms"
          className="mb-10 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 shadow-sm transition hover:border-blue-600 hover:text-blue-700"
        >
          ← Back to Rooms
        </Link>

        <div className="grid items-start gap-14 lg:grid-cols-3">

          {/* LEFT */}

          <div className="lg:col-span-2">

            <div className="group relative overflow-hidden rounded-3xl shadow-2xl">

              <img
                src={images[selectedImage]}
                alt={`${room.type} Room`}
                className="h-[620px] w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute bottom-8 left-8">

                <p className="text-sm uppercase tracking-[0.35em] text-white/80">
                  Room
                </p>

                <h1 className="mt-2 text-5xl font-bold text-white">
                  {room.roomNo}
                </h1>

              </div>

              <div className="absolute right-6 top-6">

                <div
                  className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-xl backdrop-blur-md ${status.badge}`}
                >

                  <span
                    className={`h-3 w-3 rounded-full ${status.dot} animate-pulse`}
                  />

                  {status.label}

                </div>

              </div>

            </div>

            {images.length > 1 && (

              <div className="mt-6 flex gap-4 overflow-x-auto pb-2">

                {images.map((image, index) => (

                  <img
                    key={index}
                    src={image}
                    alt={`Room ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    className={`h-24 w-36 cursor-pointer rounded-2xl object-cover transition-all duration-300 hover:scale-105 ${
                      selectedImage === index
                        ? "ring-4 ring-yellow-500"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  />

                ))}

              </div>

            )}

          </div>

          {/* RIGHT */}

          <aside className="lg:sticky lg:top-28">

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-yellow-600">
                {room.type}
              </p>

              <h2 className="mt-3 text-4xl font-bold text-slate-900">
                {room.type} Room
              </h2>

              <div className="mt-8">

                <p className="text-5xl font-extrabold text-yellow-600">
                  GHS {room.price}
                </p>

                <p className="mt-2 text-slate-500">
                  per night
                </p>

              </div>

              <div className="my-8 h-px bg-slate-200" />

              <div className="space-y-5">

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Room Number
                  </span>

                  <span className="font-semibold">
                    {room.roomNo}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Category
                  </span>

                  <span className="font-semibold">
                    {room.type}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Status
                  </span>

                  <span className="font-semibold">
                    {status.label}
                  </span>

                </div>

              </div>

              <button
                onClick={() =>
                  navigate(`/signin?redirect=/booking?roomId=${room.id}`)
                }
                className="mt-10 w-full rounded-2xl bg-blue-700 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-800 hover:shadow-xl"
              >
                Book This Room
              </button>

              <div className="mt-8 rounded-2xl bg-slate-50 p-5">

                <p className="font-semibold text-slate-900">
                  Need Assistance?
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Contact our reception team for bookings, enquiries and
                  special requests.
                </p>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </section>

          {/* Details */}

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-3">

          <div className="lg:col-span-2 space-y-12">

            {/* Description */}

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-slate-900">
                About this Room
              </h2>

              <p className="mt-6 leading-8 text-slate-600">
                {room.description ||
                  "Enjoy comfort, elegance and exceptional hospitality in this beautifully designed room at Kiviz Executive Lodge."}
              </p>
            </div>

            {/* Amenities */}

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-slate-900">
                Room Amenities
              </h2>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">

                {room.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                      ✓
                    </div>

                    <span className="font-medium text-slate-700">
                      {amenity}
                    </span>
                  </div>
                ))}

              </div>
            </div>

            {/* Hotel Services */}

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

              <h2 className="text-3xl font-bold text-slate-900">
                Included Hotel Services
              </h2>

              <div className="mt-8 grid gap-5 md:grid-cols-2">

                {[
                  "24/7 Reception",
                  "Free Wi-Fi",
                  "Daily Housekeeping",
                  "Free Parking",
                  "Restaurant Access",
                  "Airport Pickup Available",
                  "Laundry Service",
                  "Room Service",
                ].map((service) => (

                  <div
                    key={service}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      ✓
                    </div>

                    <span className="font-medium text-slate-700">
                      {service}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Contact Card */}

          <div>

            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white">

              <h3 className="text-2xl font-bold">
                Need Help?
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                Our hospitality team is always ready to assist you with room
                reservations, special requests and enquiries.
              </p>

              <Link
                to="/contact"
                className="mt-8 inline-flex rounded-xl bg-yellow-500 px-6 py-4 font-semibold text-slate-900 transition hover:bg-yellow-400"
              >
                Contact Reception
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* Related Rooms */}

      <section className="bg-slate-50 px-6 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="mb-10">

            <h2 className="text-4xl font-bold text-slate-900">
              You May Also Like
            </h2>

            <p className="mt-3 text-slate-600">
              Explore more premium rooms available at Kiviz Executive Lodge.
            </p>

          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

            {relatedRooms.map((relatedRoom) => (
              <RoomCard
                key={relatedRoom.id}
                room={relatedRoom}
              />
            ))}

          </div>

        </div>

      </section>

    </MainLayout>
  );
}

export default RoomDetails;