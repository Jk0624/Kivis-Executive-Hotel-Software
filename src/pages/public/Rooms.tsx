import MainLayout from "../../layouts/MainLayout";
import RoomCard from "../../components/rooms/RoomCard";
import { getRooms } from "../../services/roomService";



function Rooms() {
  const rooms = getRooms();
  return (
    <MainLayout>
      <section className="bg-slate-100 min-h-screen py-16 px-8">
        <h1 className="text-5xl font-bold text-center text-slate-900">
          Our Rooms
        </h1>

        <p className="mt-4 text-center text-gray-600">
          Discover comfort, luxury and smart room access.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.name}
              name={room.name}
              price={room.price}
            />
          ))}
        </div>
      </section>
    </MainLayout>
  );
}

export default Rooms;