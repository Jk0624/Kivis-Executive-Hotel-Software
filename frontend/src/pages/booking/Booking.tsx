import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import MainLayout from "../../layouts/MainLayout";
import BookingForm from "../../components/booking/BookingForm";
import BookingSummary from "../../components/booking/BookingSummary";

import {
  getGuestRoom,
  type GuestRoom,
} from "../../services/guestRoomService";

function Booking() {
  const [searchParams] = useSearchParams();

  const roomId = searchParams.get("roomId");

  const [room, setRoom] = useState<GuestRoom | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  useEffect(() => {
    if (!roomId) {
      setError("Invalid room.");
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      try {
        setLoading(true);

        const data = await getGuestRoom(roomId);

        setRoom(data);
      } catch (err) {
        console.error(err);

        setError("Unable to load room details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  if (loading) {
    return (
      <MainLayout>
        <section className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />

            <p className="mt-6 text-slate-600">
              Loading room...
            </p>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (error || !room) {
    return (
      <MainLayout>
        <section className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-2xl bg-white p-10 shadow-lg text-center">

            <h2 className="text-2xl font-bold text-slate-900">
              Room Not Found
            </h2>

            <p className="mt-4 text-slate-600">
              {error}
            </p>

          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
              Reservation
            </p>

            <h1 className="mt-4 text-5xl font-bold text-slate-900">
              Book Your Stay
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
              Complete the information below to reserve your room.
            </p>

          </div>

          <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-5">

            <p className="text-sm font-medium text-green-700">
              Selected Room
            </p>

            <h2 className="mt-1 text-xl font-bold text-green-900">
              Room {room.roomNo}
            </h2>

            <p className="text-slate-600">
              {room.type} Room
            </p>

          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-3">

            <div className="lg:col-span-2">

              <BookingForm
                roomId={room.id}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                setCheckInDate={setCheckInDate}
                setCheckOutDate={setCheckOutDate}
              />

            </div>

            <div>

              <BookingSummary
                room={room}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
              />

            </div>

          </div>

        </div>
      </section>
    </MainLayout>
  );
}

export default Booking;