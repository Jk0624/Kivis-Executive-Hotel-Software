import conference1 from "../assets/gallery/conference-1.jpg";
import conference2 from "../assets/gallery/conference-2.jpg";
import dining1 from "../assets/gallery/dining-1.jpg";
import dining2 from "../assets/gallery/dining-2.jpg";
import dining3 from "../assets/gallery/dining-3.jpg";
import dining4 from "../assets/gallery/dining-4.jpg";
import exterior1 from "../assets/gallery/exterior-1.jpg";
import exterior2 from "../assets/gallery/exterior-2.jpg";
import exterior3 from "../assets/gallery/exterior-3.jpg";
import exterior4 from "../assets/gallery/exterior-4.jpg";
import facility1 from "../assets/gallery/facility-1.jpg";
import facility2 from "../assets/gallery/facility-2.jpg";
import facility3 from "../assets/gallery/facility-3.jpg";
import room1 from "../assets/gallery/room-1.jpg";
import room2 from "../assets/gallery/room-2.jpg";
import room3 from "../assets/gallery/room-3.jpg";
import room4a from "../assets/gallery/room-4a.jpg";
import room4b from "../assets/gallery/room-4b.jpg";
import room5a from "../assets/gallery/room-5a.jpg";
import room5b from "../assets/gallery/room-5b.jpg";
import room5c from "../assets/gallery/room-5c.jpg";
import room5d from "../assets/gallery/room-5d.jpg";
import room6a from "../assets/gallery/room-6a.jpg";
import room6b from "../assets/gallery/room-6b.jpg";
import room6c from "../assets/gallery/room-6c.jpg";


export interface GalleryImage {
  id: number;
  title: string;
  category:
    | "Hotel Exterior"
    | "Rooms & Suites"
    | "Restaurant & Dining"
    | "Amenities & Facilities"
    | "Conference & Events";
  image: string;
}

export const galleryImages: GalleryImage[] = [
  // Hotel Exterior
  { id: 1, title: "Grand Hotel Entrance", category: "Hotel Exterior", image: exterior1 },
  { id: 2, title: "Main Hotel Entrance", category: "Hotel Exterior", image: exterior2 },
  { id: 3, title: "Evening Exterior View", category: "Hotel Exterior", image: exterior3 },
  { id: 4, title: "Panoramic Exterior", category: "Hotel Exterior", image: exterior4 },

  // Rooms & Suites
  { id: 5, title: "Standard Room", category: "Rooms & Suites", image: room1 },
  { id: 6, title: "Deluxe Room", category: "Rooms & Suites", image: room2 },
  { id: 7, title: "Executive Suite", category: "Rooms & Suites", image: room3 },
  { id: 8, title: "Executive Suite View", category: "Rooms & Suites", image: room4a },
  { id: 9, title: "King Bedroom", category: "Rooms & Suites", image: room4b },
  { id: 10, title: "Luxury Bathroom", category: "Rooms & Suites", image: room5a },
  { id: 11, title: "Luxury Bathroom II", category: "Rooms & Suites", image: room5b },
  { id: 12, title: "Executive Bathroom", category: "Rooms & Suites", image: room5c },
  { id: 13, title: "Premium Bathroom", category: "Rooms & Suites", image: room5d },
  { id: 14, title: "Balcony View", category: "Rooms & Suites", image: room6a },
  { id: 15, title: "City View", category: "Rooms & Suites", image: room6b },
  { id: 16, title: "Luxury Balcony", category: "Rooms & Suites", image: room6c },

  // Restaurant & Dining
  { id: 17, title: "Main Restaurant", category: "Restaurant & Dining", image: dining1 },
  { id: 18, title: "Breakfast Buffet", category: "Restaurant & Dining", image: dining2 },
  { id: 19, title: "Fine Dining", category: "Restaurant & Dining", image: dining3 },
  { id: 20, title: "Coffee Lounge", category: "Restaurant & Dining", image: dining4 },

  // Amenities & Facilities
  { id: 21, title: "Swimming Pool", category: "Amenities & Facilities", image: facility1 },
  { id: 22, title: "Fitness Centre", category: "Amenities & Facilities", image: facility2 },
  { id: 23, title: "Hotel Reception", category: "Amenities & Facilities", image: facility3 },

  // Conference & Events
  { id: 24, title: "Conference Hall", category: "Conference & Events", image: conference1 },
  { id: 25, title: "Boardroom", category: "Conference & Events", image: conference2 },
];