import MainLayout from "../../layouts/MainLayout";
import BookingForm from "../../components/booking/BookingForm";
import BookingSummary from "../../components/booking/BookingSummary";
import { useSearchParams } from "react-router-dom";
import { getRoomById } from "../../services/roomService";

function Booking() {
    const [searchParams] = useSearchParams();

    const roomId = Number(searchParams.get("roomId"));

    const room = getRoomById(roomId);
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
              Complete the information below to reserve your room at
              Kiviz Executive Hotel.
            </p>
          </div>

          {room && (
            <div className="mt-10 rounded-xl bg-green-100 p-4 text-green-700">
                Selected Room: <strong>{room.name}</strong>
            </div>
            )}

        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-3">

            <div className="lg:col-span-2">
                <BookingForm />
            </div>

            <div>
                {room && <BookingSummary room={room} />}
            </div>

        </div>

      </section>
    </MainLayout>
  );
}

export default Booking;