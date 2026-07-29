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

  const handleBookRoom = () => {
  const token = localStorage.getItem("token");

  if (token) {
    navigate(`/booking?roomId=${room?.id}`);
  } else {
    navigate(
      `/signin?redirect=${encodeURIComponent(
        `/booking?roomId=${room?.id}`
      )}`
    );
  }
};

  const [room, setRoom] =
    useState<GuestRoom | null>(null);

  const [relatedRooms, setRelatedRooms] =
    useState<GuestRoom[]>([]);

  const [selectedImage, setSelectedImage] =
    useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchRoom = async () => {
      try {
        setLoading(true);

        const roomData =
          await getGuestRoom(id);

        setRoom(roomData);

        const rooms =
          await getGuestRooms();

        setRelatedRooms(
          rooms
            .filter(
              (item) =>
                item.id !== roomData.id
            )
            .slice(0, 3)
        );
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load room details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  /* Loading State */

  if (loading) {
    return (
      <MainLayout>
        <section className="flex min-h-[80vh] items-center justify-center px-5">
          <div className="text-center">

            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />

            <h2 className="mt-8 text-2xl font-bold text-slate-900 sm:text-3xl">
              Loading Room...
            </h2>

            <p className="mt-4 text-sm text-slate-600 sm:text-base">
              Please wait while we prepare your
              experience.
            </p>

          </div>
        </section>
      </MainLayout>
    );
  }

  /* Error State */

  if (error || !room) {
    return (
      <MainLayout>
        <section className="flex min-h-[80vh] items-center justify-center px-5">
          <div className="text-center">

            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Room Not Found
            </h2>

            <p className="mt-5 text-sm text-slate-600 sm:text-base">
              {error ||
                "The requested room could not be found."}
            </p>

            <Link
              to="/rooms"
              className="mt-8 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 sm:mt-10 sm:px-8 sm:py-4"
            >
              Back to Rooms
            </Link>

          </div>
        </section>
      </MainLayout>
    );
  }

  const images =
    room.photos &&
    room.photos.length > 0
      ? room.photos
      : room.photo
      ? [room.photo]
      : [];

  const status =
    getRoomStatus(room.status);

    return (
    <MainLayout>
      {/* Hero Section */}

      <section className="bg-gradient-to-b from-slate-50 to-white px-5 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/rooms"
            className="mb-8 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-600 hover:text-blue-700 sm:mb-10 sm:px-5 sm:text-base"
          >
            ← Back to Rooms
          </Link>

          <div className="grid items-start gap-10 lg:grid-cols-3 lg:gap-14">
            {/* Left */}

            <div className="lg:col-span-2">
              <div className="group relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src={images[selectedImage]}
                  alt={`${room.type} Room`}
                  className="h-[280px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[420px] lg:h-[620px]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/80 sm:text-sm sm:tracking-[0.35em]">
                    Room
                  </p>

                  <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                    {room.roomNo}
                  </h1>
                </div>

                <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
                  <div
                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold shadow-xl backdrop-blur-md sm:px-5 sm:py-3 sm:text-sm ${status.badge}`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${status.dot} animate-pulse sm:h-3 sm:w-3`}
                    />

                    {status.label}
                  </div>
                </div>
              </div>

              {images.length > 1 && (
                <div className="mt-5 flex gap-3 overflow-x-auto pb-2 sm:mt-6 sm:gap-4">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Room ${index + 1}`}
                      onClick={() => setSelectedImage(index)}
                      className={`h-20 w-28 flex-shrink-0 cursor-pointer rounded-2xl object-cover transition-all duration-300 hover:scale-105 sm:h-24 sm:w-36 ${
                        selectedImage === index
                          ? "ring-4 ring-yellow-500"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right */}

            <aside className="lg:sticky lg:top-28">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-600 sm:text-sm sm:tracking-[0.35em]">
                  {room.type}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                  {room.type} Room
                </h2>

                <div className="mt-8">
                  <p className="text-4xl font-extrabold text-yellow-600 sm:text-5xl">
                    GHS {room.price}
                  </p>

                  <p className="mt-2 text-slate-500">
                    per night
                  </p>
                </div>

                <div className="my-8 h-px bg-slate-200" />

                <div className="space-y-5">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Room Number
                    </span>

                    <span className="font-semibold text-right">
                      {room.roomNo}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Category
                    </span>

                    <span className="font-semibold text-right">
                      {room.type}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Status
                    </span>

                    <span className="font-semibold text-right">
                      {status.label}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBookRoom}
                  className="mt-10 w-full rounded-2xl bg-blue-700 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-800 hover:shadow-xl sm:text-lg"
                >
                  Book This Room
                </button>

                <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">
                    Need Assistance?
                  </p>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Contact our reception team for
                    bookings, enquiries and special
                    requests.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

            {/* Details */}

      <section className="bg-white px-5 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-3 lg:gap-12">
          {/* Left Content */}

          <div className="space-y-8 sm:space-y-12 lg:col-span-2">
            {/* Description */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                About this Room
              </h2>

              <p className="mt-6 text-sm leading-8 text-slate-600 sm:text-base">
                {room.description ||
                  "Enjoy comfort, elegance and exceptional hospitality in this beautifully designed room at Kiviz Executive Lodge."}
              </p>
            </div>

            {/* Amenities */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Room Amenities
              </h2>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
                {room.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
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

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Included Hotel Services
              </h2>

              <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
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
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
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
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white sm:p-8">
              <h3 className="text-2xl font-bold">
                Need Help?
              </h3>

              <p className="mt-4 text-sm leading-8 text-slate-300 sm:text-base">
                Our hospitality team is always ready to assist you with room
                reservations, special requests and enquiries.
              </p>

              <Link
  to="/?scroll=contact"
  className="mt-8 inline-flex w-full justify-center rounded-xl bg-yellow-500 px-6 py-4 font-semibold text-slate-900 transition hover:bg-yellow-400 sm:w-auto"
>
  Contact Reception
</Link>
          </div>
        </div>
        </div>

      </section>

            {/* Related Rooms */}

      <section className="bg-slate-50 px-5 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              You May Also Like
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Explore more premium rooms available at Kiviz Executive Lodge.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
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