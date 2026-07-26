export type Room = {
  id: number;
  name: string;
  type: string;
  price: string;
  images: string[];
  guests: number;
  description: string;
  amenities: string[];
};

const rooms: Room[] = [
  {
    id: 1,
    name: "Standard Room",
    type: "Standard",
    price: "GHS 450",
    images: [
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900",
],
    guests: 2,
    description:
      "A comfortable room ideal for solo travellers and couples.",
    amenities: [
      "Queen Size Bed",
      "Free Wi-Fi",
      "Air Conditioning",
      "Smart Door Access",
    ],
  },

  {
    id: 2,
    name: "Deluxe Room",
    type: "Deluxe",
    price: "GHS 650",
    images: [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900",    
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900",
],
    guests: 2,
    description:
      "Spacious accommodation with premium comfort and elegant décor.",
    amenities: [
      "King Size Bed",
      "Smart TV",
      "Mini Fridge",
      "Free Wi-Fi",
    ],
  },

  {
    id: 3,
    name: "Executive Room",
    type: "Executive",
    price: "GHS 850",
    images: [
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900",

  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900",
  
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900",
],
    guests: 3,
    description:
      "Designed for business travellers seeking luxury and convenience.",
    amenities: [
      "King Size Bed",
      "Smart Door Access",
      "Work Desk",
      "Complimentary Breakfast",
    ],
  },

  {
    id: 4,
    name: "Executive Suite",
    type: "Suite",
    price: "GHS 1,200",
    images: [

  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900",    
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900",
  
],
    guests: 4,
    description:
      "Our most luxurious suite offering generous space and premium amenities.",
    amenities: [
      "Living Area",
      "King Size Bed",
      "Smart TV",
      "Mini Bar",
    ],
  },
];

export function getRooms(): Room[] {
  return rooms;
}


export function getRoomById(id: number): Room | undefined {
  return rooms.find((room) => room.id === id);
}