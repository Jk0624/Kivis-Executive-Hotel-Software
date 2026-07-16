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
            key={room.id} 
            id={room.id}
            name={room.name}
            type={room.type}
            price={room.price}
            image={room.images[0]}
            guests={room.guests}
            description={room.description}
            amenities={room.amenities}
          />
        ))}
        </div>
      </section>
    </MainLayout>
  );
}

export default Rooms;