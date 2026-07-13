import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";
import Rooms from "../pages/public/Rooms";
import Dashboard from "../pages/receptionist/Dashboard";
import Bookings from "../pages/receptionist/Bookings";
import WalkIn from "../pages/receptionist/Walkin";
import AssignRFID from "../pages/receptionist/AssignRFID";
import CheckIn from "../pages/receptionist/CheckIn";
import CheckOut from "../pages/receptionist/CheckOut";
import BookingExtension from "../pages/receptionist/BookingExtensionPage";
import ReceptionistRooms from "../pages/receptionist/Rooms";
import RoomDetails from "../pages/receptionist/RoomDetails";
import Guest from "../pages/receptionist/Guest";
import Notifications from "../pages/receptionist/NotificationPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/receptionist/dashboard" element={<Dashboard />} />
        <Route path="/receptionist/bookings" element={<Bookings />} />
        <Route path="/receptionist/walkin" element={<WalkIn />} />

        <Route path="/receptionist/rfid" element={<AssignRFID />} />

        <Route path="/receptionist/checkin"element={<CheckIn />} />

        <Route path="/receptionist/checkout"element={<CheckOut />} />

        <Route path="/receptionist/rooms" element={<ReceptionistRooms />}
        />

        <Route path="/receptionist/booking-extension"element={<BookingExtension />}/>

        <Route path="/receptionist/guests" element={<Guest />} />

        <Route
  path="/receptionist/notifications"
  element={<Notifications />}
/>

        <Route path="/receptionist/rooms/:roomNumber"
  element={<RoomDetails />}
 />
        
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;