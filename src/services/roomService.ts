export type Room = {
  id: number;
  name: string;
  price: string;
};

const rooms: Room[] = [
  {
    id: 1,
    name: "Executive Room",
    price: "GHS 850",
  },
];

export function getRooms(): Room[] {
  return rooms;
}