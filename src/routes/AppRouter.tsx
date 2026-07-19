import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "../components/navigation/ScrollToTop";
import Home from "../pages/public/Home";
import Rooms from "../pages/public/Rooms";
import Dashboard from "../pages/receptionist/Dashboard";
import Bookings from "../pages/receptionist/Bookings";
import WalkIn from "../pages/receptionist/Walkin";

import CheckIn from "../pages/receptionist/CheckIn";
import CheckOut from "../pages/receptionist/CheckOut";
import BookingExtension from "../pages/receptionist/BookingExtensionPage";
import ReceptionistRooms from "../pages/receptionist/Rooms";
import RoomDetails from "../pages/receptionist/RoomDetails";
import Guest from "../pages/receptionist/Guest";
import Notifications from "../pages/receptionist/NotificationPage";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminRooms from "../pages/admin/Rooms";
import AdminBookings from "../pages/admin/Bookings";
import AdminGuests from "../pages/admin/Guests";
import GuestProfile from "../pages/admin/GuestProfile";
import AdminReceptionists from "../pages/admin/Receptionists";
import AdminAccessDevices from "../pages/admin/AccessDevices";
import ViewAccessDevice from "../pages/admin/ViewAccessDevice";
import SecurityAudit from "../pages/admin/SecurityAudit";
import Profile from "../pages/admin/Profile";
import Gallery from "../pages/public/Gallery";
import ScrollToHash from "../components/navigation/ScrollToHash";
import About from "../pages/public/About";

import PublicRoomDetails from "../pages/public/RoomDetails";

import SignUp from "../pages/public/SignUp";
import SignIn from "../pages/public/SignIn";

import OTPVerification from "../pages/public/OTPVerification";

import Booking from "../pages/booking/Booking";


function AppRouter() {
  return (
    <BrowserRouter>
    <ScrollToTop />
    <ScrollToHash />
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/receptionist/dashboard" element={<Dashboard />} />
        <Route path="/receptionist/bookings" element={<Bookings />} />
        <Route path="/receptionist/walkin" element={<WalkIn />} />

        

        <Route path="/receptionist/checkin"element={<CheckIn />} />

        <Route path="/receptionist/checkout"element={<CheckOut />} />

        <Route path="/receptionist/rooms" element={<ReceptionistRooms />}/>

        <Route path="/receptionist/booking-extension"element={<BookingExtension />}/>

        <Route path="/receptionist/guests" element={<Guest />} />

        <Route path="/receptionist/notifications" element={<Notifications />}/>

        <Route path="/receptionist/rooms/:roomNumber" element={<RoomDetails />} />

        <Route
          path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/admin/rooms" element={<AdminRooms />}
        />

        <Route path="/admin/bookings" element={<AdminBookings />}/>

        <Route path="/admin/guests" element={<AdminGuests />}/>

        <Route path="/admin/guests/profile" element={<GuestProfile />} />

        <Route path="/admin/receptionists"
          element={<AdminReceptionists />}/>

        <Route path="/admin/access-devices" element={<AdminAccessDevices />} />

        <Route path="/admin/access-devices/:macAddress" element={<ViewAccessDevice />} />

        <Route path="/admin/security-audit" element={<SecurityAudit />} />

        <Route path="/admin/profile" element={<Profile />} />

        <Route path="/gallery" element={<Gallery />}
        />

        <Route
        path="/about"
        element={<About />}
        />

        <Route path="/rooms/:id"
          element={<PublicRoomDetails />} />

        <Route path="/signup" element={<SignUp />}/>

        <Route path="/signin" element={<SignIn />}/>

        <Route path="/verify-otp" element={<OTPVerification />} />

        <Route path="/booking" element={<Booking />} />

        


        
      </Routes>

    </BrowserRouter>
  );
}

export default AppRouter;